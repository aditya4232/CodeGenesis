"""
MemoRAG ULTRA - Importance Scoring System
Calculate importance scores for chunks and entities to prevent forgetting
"""
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

from app.core.config import get_config
from app.db import get_db
from app.rag import get_knowledge_graph

logger = logging.getLogger(__name__)


class ImportanceScorer:
    """Calculate and update importance scores for memory items"""
    
    def __init__(self):
        self.config = get_config().memory
        self.db = get_db()
        self.kg = get_knowledge_graph()
    
    def calculate_importance(
        self,
        item_id: str,
        item_type: str  # 'chunk' or 'entity'
    ) -> float:
        """
        Calculate combined importance score
        
        Factors:
        1. Recency - how recently accessed
        2. Frequency - how often accessed
        3. Centrality - position in knowledge graph (for entities)
        4. Feedback - user feedback signals
        
        Returns:
            Importance score (0-1)
        """
        # Get or create tracking record
        tracking = self.db.execute_query(
            "SELECT * FROM importance_tracking WHERE item_id = ?",
            (item_id,)
        )
        
        if not tracking:
            # Initialize new tracking
            self.db.execute_update(
                """
                INSERT INTO importance_tracking 
                (item_id, item_type, recency_score, frequency_score, centrality_score, feedback_score)
                VALUES (?, ?, 0.5, 0.5, 0.5, 0.5)
                """,
                (item_id, item_type)
            )
            return 0.5
        
        tracking = dict(tracking[0])
        
        # Calculate individual scores
        recency_score = self._calculate_recency(item_id, item_type)
        frequency_score = self._calculate_frequency(item_id, item_type)
        centrality_score = self._calculate_centrality(item_id, item_type)
        feedback_score = tracking['feedback_score']
        
        # Weighted combination
        combined = (
            0.3 * recency_score +
            0.3 * frequency_score +
            0.2 * centrality_score +
            0.2 * feedback_score
        )
        
        # Update tracking
        self.db.execute_update(
            """
            UPDATE importance_tracking
            SET recency_score = ?, frequency_score = ?, centrality_score = ?,
                combined_score = ?, last_updated = CURRENT_TIMESTAMP
            WHERE item_id = ?
            """,
            (recency_score, frequency_score, centrality_score, combined, item_id)
        )
        
        return combined
    
    def _calculate_recency(self, item_id: str, item_type: str) -> float:
        """Calculate recency score based on last access time"""
        if item_type == 'entity':
            result = self.db.execute_query(
                "SELECT last_accessed FROM entities WHERE entity_id = ?",
                (item_id,)
            )
            if not result or not result[0]['last_accessed']:
                return 0.5
            
            last_accessed = datetime.fromisoformat(result[0]['last_accessed'])
        else:  # chunk
            # Check provenance logs for chunk usage
            result = self.db.execute_query(
                """
                SELECT MAX(created_at) as last_used
                FROM provenance_logs
                WHERE chunks_used LIKE ?
                """,
                (f'%{item_id}%',)
            )
            if not result or not result[0]['last_used']:
                return 0.5
            
            last_accessed = datetime.fromisoformat(result[0]['last_used'])
        
        # Calculate decay based on time
        days_ago = (datetime.now() - last_accessed).days
        
        # Exponential decay
        decay_rate = self.config.importance_decay
        recency_score = decay_rate ** days_ago
        
        return max(0.0, min(1.0, recency_score))
    
    def _calculate_frequency(self, item_id: str, item_type: str) -> float:
        """Calculate frequency score based on access count"""
        if item_type == 'entity':
            result = self.db.execute_query(
                "SELECT access_count FROM entities WHERE entity_id = ?",
                (item_id,)
            )
            if not result:
                return 0.5
            
            access_count = result[0]['access_count'] or 0
        else:  # chunk
            # Count appearances in provenance logs
            result = self.db.execute_query(
                """
                SELECT COUNT(*) as count
                FROM provenance_logs
                WHERE chunks_used LIKE ?
                """,
                (f'%{item_id}%',)
            )
            access_count = result[0]['count'] if result else 0
        
        # Normalize to 0-1 (log scale)
        import math
        if access_count == 0:
            return 0.1
        
        # Log scale with cap at 100 accesses
        frequency_score = min(1.0, math.log(access_count + 1) / math.log(100))
        
        return frequency_score
    
    def _calculate_centrality(self, item_id: str, item_type: str) -> float:
        """Calculate centrality score based on graph position"""
        if item_type != 'entity':
            return 0.5  # Chunks don't have centrality
        
        # Check if entity exists in graph
        if item_id not in self.kg.graph.nodes:
            return 0.5
        
        # Get centrality from graph
        try:
            centrality_scores = self.kg.compute_centrality()
            score = centrality_scores.get(item_id, 0.5)
            return score
        except Exception as e:
            logger.warning(f"Centrality calculation failed: {e}")
            return 0.5
    
    def update_feedback_score(
        self,
        item_id: str,
        feedback: int  # -1, 0, 1
    ):
        """Update feedback score based on user feedback"""
        tracking = self.db.execute_query(
            "SELECT feedback_score FROM importance_tracking WHERE item_id = ?",
            (item_id,)
        )
        
        if not tracking:
            return
        
        current_score = tracking[0]['feedback_score']
        
        # Adjust score based on feedback
        if feedback > 0:
            new_score = min(1.0, current_score + 0.1)
        elif feedback < 0:
            new_score = max(0.0, current_score - 0.1)
        else:
            new_score = current_score
        
        self.db.execute_update(
            "UPDATE importance_tracking SET feedback_score = ? WHERE item_id = ?",
            (new_score, item_id)
        )
    
    def batch_update_scores(self, limit: int = 100):
        """Update importance scores for multiple items"""
        # Get items that need updating (not updated recently)
        items = self.db.execute_query(
            """
            SELECT item_id, item_type FROM importance_tracking
            WHERE last_updated < datetime('now', '-1 day')
            ORDER BY last_updated ASC
            LIMIT ?
            """,
            (limit,)
        )
        
        updated_count = 0
        for item in items:
            try:
                self.calculate_importance(item['item_id'], item['item_type'])
                updated_count += 1
            except Exception as e:
                logger.error(f"Failed to update importance for {item['item_id']}: {e}")
        
        logger.info(f"Updated importance scores for {updated_count} items")
        return updated_count


def get_importance_scorer() -> ImportanceScorer:
    """Get importance scorer instance"""
    return ImportanceScorer()
