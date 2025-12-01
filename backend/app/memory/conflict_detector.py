"""
MemoRAG ULTRA - Conflict Detection
Detect and track contradictions in knowledge
"""
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.core.config import get_config
from app.core.lm_studio_client import get_lm_studio_client
from app.db import get_db

logger = logging.getLogger(__name__)


class ConflictDetector:
    """Detect contradictions and conflicts in knowledge"""
    
    def __init__(self):
        self.config = get_config()
        self.llm_client = get_lm_studio_client()
        self.db = get_db()
    
    async def detect_conflicts(
        self,
        entity_name: str,
        new_claim: str,
        new_doc_id: str
    ) -> List[Dict[str, Any]]:
        """
        Detect conflicts for an entity's claims
        
        Args:
            entity_name: Entity to check
            new_claim: New claim about the entity
            new_doc_id: Document ID of new claim
            
        Returns:
            List of detected conflicts
        """
        # Get existing claims about this entity
        entity = self.db.get_entity_by_name(entity_name)
        if not entity:
            return []
        
        entity_id = entity['entity_id']
        
        # Get chunks mentioning this entity
        existing_chunks = self.db.execute_query(
            """
            SELECT c.content, c.doc_id, c.chunk_id
            FROM chunks c
            JOIN entity_chunks ec ON c.chunk_id = ec.chunk_id
            WHERE ec.entity_id = ?
            LIMIT 10
            """,
            (entity_id,)
        )
        
        conflicts = []
        
        for chunk in existing_chunks:
            if chunk['doc_id'] == new_doc_id:
                continue  # Skip same document
            
            # Check for contradiction using LLM
            is_conflict, confidence = await self._check_contradiction(
                new_claim,
                chunk['content']
            )
            
            if is_conflict and confidence > 0.7:
                # Record conflict
                conflict_id = str(uuid.uuid4())
                
                self.db.execute_update(
                    """
                    INSERT INTO conflicts
                    (conflict_id, entity_id, claim1, claim2, doc1_id, doc2_id,
                     confidence1, confidence2)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        conflict_id,
                        entity_id,
                        new_claim,
                        chunk['content'],
                        new_doc_id,
                        chunk['doc_id'],
                        confidence,
                        confidence
                    )
                )
                
                conflicts.append({
                    'conflict_id': conflict_id,
                    'entity': entity_name,
                    'claim1': new_claim,
                    'claim2': chunk['content'],
                    'confidence': confidence
                })
                
                logger.warning(f"Conflict detected for {entity_name}: {confidence:.2f}")
        
        return conflicts
    
    async def _check_contradiction(
        self,
        claim1: str,
        claim2: str
    ) -> tuple[bool, float]:
        """
        Check if two claims contradict each other
        
        Returns:
            (is_contradiction, confidence)
        """
        system_prompt = """You are an expert at detecting contradictions.
Analyze if the two claims contradict each other.
Respond with ONLY 'YES' or 'NO' followed by a confidence score (0-1).
Format: YES 0.9 or NO 0.3"""
        
        prompt = f"""Claim 1: {claim1}

Claim 2: {claim2}

Do these claims contradict each other?"""
        
        try:
            response = await self.llm_client.generate_with_retry(
                prompt,
                system_prompt,
                temperature=0.1,
                max_tokens=20
            )
            
            # Parse response
            parts = response.strip().split()
            if len(parts) >= 2:
                is_contradiction = parts[0].upper() == 'YES'
                try:
                    confidence = float(parts[1])
                except:
                    confidence = 0.5
                
                return is_contradiction, confidence
            
        except Exception as e:
            logger.error(f"Contradiction check failed: {e}")
        
        return False, 0.0
    
    def get_conflicts(
        self,
        entity_name: Optional[str] = None,
        resolved: Optional[bool] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get conflicts, optionally filtered"""
        query = "SELECT * FROM conflicts WHERE 1=1"
        params = []
        
        if entity_name:
            entity = self.db.get_entity_by_name(entity_name)
            if entity:
                query += " AND entity_id = ?"
                params.append(entity['entity_id'])
        
        if resolved is not None:
            query += " AND resolved = ?"
            params.append(resolved)
        
        query += " ORDER BY detected_at DESC LIMIT ?"
        params.append(limit)
        
        results = self.db.execute_query(query, tuple(params))
        return [dict(row) for row in results]
    
    def resolve_conflict(
        self,
        conflict_id: str,
        resolution: str
    ):
        """Mark conflict as resolved with explanation"""
        self.db.execute_update(
            """
            UPDATE conflicts
            SET resolved = TRUE, resolution = ?
            WHERE conflict_id = ?
            """,
            (resolution, conflict_id)
        )
        
        logger.info(f"Conflict {conflict_id} resolved: {resolution}")


def get_conflict_detector() -> ConflictDetector:
    """Get conflict detector instance"""
    return ConflictDetector()
