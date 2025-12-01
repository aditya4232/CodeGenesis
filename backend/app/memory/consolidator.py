"""
MemoRAG ULTRA - Memory Consolidation
Periodic consolidation to strengthen important memories and prune unimportant ones
"""
import uuid
from typing import Dict, Any, List
from datetime import datetime
import logging

from app.core.config import get_config
from app.db import get_db
from app.memory.importance_scorer import get_importance_scorer
from app.rag import get_vector_index, get_knowledge_graph

logger = logging.getLogger(__name__)


class MemoryConsolidator:
    """Consolidate and maintain memory over time"""
    
    def __init__(self):
        self.config = get_config().memory
        self.db = get_db()
        self.importance_scorer = get_importance_scorer()
        self.vector_index = get_vector_index()
        self.kg = get_knowledge_graph()
        self.query_count = 0
    
    def should_consolidate(self) -> bool:
        """Check if consolidation should be triggered"""
        # Count queries since last consolidation
        last_consolidation = self.db.execute_query(
            "SELECT MAX(created_at) as last FROM consolidation_history"
        )
        
        if not last_consolidation or not last_consolidation[0]['last']:
            return True  # First consolidation
        
        # Count queries since last consolidation
        query_count = self.db.execute_query(
            """
            SELECT COUNT(*) as count FROM provenance_logs
            WHERE created_at > ?
            """,
            (last_consolidation[0]['last'],)
        )[0]['count']
        
        return query_count >= self.config.consolidation_interval
    
    async def consolidate(self, force: bool = False) -> Dict[str, Any]:
        """
        Perform memory consolidation
        
        Steps:
        1. Update importance scores
        2. Identify low-importance items
        3. Prune if necessary
        4. Strengthen important connections
        5. Log consolidation
        
        Returns:
            Consolidation report
        """
        if not force and not self.should_consolidate():
            return {
                'status': 'skipped',
                'reason': 'Consolidation interval not reached'
            }
        
        logger.info("Starting memory consolidation...")
        start_time = datetime.now()
        
        # Step 1: Update all importance scores
        logger.info("Updating importance scores...")
        chunks = self.db.execute_query("SELECT chunk_id FROM chunks")
        entities = self.db.execute_query("SELECT entity_id FROM entities")
        
        for chunk in chunks:
            self.importance_scorer.calculate_importance(chunk['chunk_id'], 'chunk')
        
        for entity in entities:
            self.importance_scorer.calculate_importance(entity['entity_id'], 'entity')
        
        # Step 2: Identify low-importance items
        low_importance_chunks = self.db.execute_query(
            """
            SELECT item_id FROM importance_tracking
            WHERE item_type = 'chunk' AND combined_score < ?
            """,
            (self.config.pruning_threshold,)
        )
        
        low_importance_entities = self.db.execute_query(
            """
            SELECT item_id FROM importance_tracking
            WHERE item_type = 'entity' AND combined_score < ?
            """,
            (self.config.pruning_threshold,)
        )
        
        # Step 3: Prune if memory limit exceeded
        total_items = len(chunks) + len(entities)
        items_pruned = 0
        
        if total_items > self.config.max_memory_items:
            items_to_prune = total_items - self.config.max_memory_items
            logger.info(f"Pruning {items_to_prune} low-importance items...")
            
            # Prune chunks
            chunks_to_prune = min(len(low_importance_chunks), items_to_prune)
            for i in range(chunks_to_prune):
                chunk_id = low_importance_chunks[i]['item_id']
                self._prune_chunk(chunk_id)
                items_pruned += 1
            
            # Prune entities if needed
            remaining = items_to_prune - chunks_to_prune
            if remaining > 0:
                for i in range(min(len(low_importance_entities), remaining)):
                    entity_id = low_importance_entities[i]['item_id']
                    self._prune_entity(entity_id)
                    items_pruned += 1
        
        # Step 4: Strengthen important connections
        logger.info("Strengthening important connections...")
        high_importance_entities = self.db.execute_query(
            """
            SELECT item_id FROM importance_tracking
            WHERE item_type = 'entity' AND combined_score > 0.7
            ORDER BY combined_score DESC
            LIMIT 100
            """
        )
        
        for entity_data in high_importance_entities:
            entity_id = entity_data['item_id']
            # Update entity importance in database
            importance = self.db.execute_query(
                "SELECT combined_score FROM importance_tracking WHERE item_id = ?",
                (entity_id,)
            )[0]['combined_score']
            
            self.db.update_entity_importance(entity_id, importance)
        
        # Step 5: Log consolidation
        duration = (datetime.now() - start_time).total_seconds() * 1000
        
        consolidation_id = str(uuid.uuid4())
        self.db.execute_update(
            """
            INSERT INTO consolidation_history
            (consolidation_id, items_processed, items_pruned, duration_ms)
            VALUES (?, ?, ?, ?)
            """,
            (consolidation_id, total_items, items_pruned, duration)
        )
        
        logger.info(f"Consolidation complete: {items_pruned} items pruned in {duration:.0f}ms")
        
        return {
            'status': 'completed',
            'consolidation_id': consolidation_id,
            'items_processed': total_items,
            'items_pruned': items_pruned,
            'duration_ms': duration
        }
    
    def _prune_chunk(self, chunk_id: str):
        """Remove chunk from memory"""
        # Remove from vector index
        self.vector_index.remove_chunks([chunk_id])
        
        # Remove from database (cascades to entity_chunks)
        self.db.execute_update("DELETE FROM chunks WHERE chunk_id = ?", (chunk_id,))
        
        # Remove from importance tracking
        self.db.execute_update("DELETE FROM importance_tracking WHERE item_id = ?", (chunk_id,))
    
    def _prune_entity(self, entity_id: str):
        """Remove entity from memory"""
        # Remove from knowledge graph
        if entity_id in self.kg.graph.nodes:
            self.kg.graph.remove_node(entity_id)
        
        # Remove from database (cascades to relations and entity_chunks)
        self.db.execute_update("DELETE FROM entities WHERE entity_id = ?", (entity_id,))
        
        # Remove from importance tracking
        self.db.execute_update("DELETE FROM importance_tracking WHERE item_id = ?", (entity_id,))
    
    def get_consolidation_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent consolidation history"""
        results = self.db.execute_query(
            """
            SELECT * FROM consolidation_history
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,)
        )
        return [dict(row) for row in results]


def get_memory_consolidator() -> MemoryConsolidator:
    """Get memory consolidator instance"""
    return MemoryConsolidator()
