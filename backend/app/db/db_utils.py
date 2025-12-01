"""
MemoRAG ULTRA - Database Utilities
"""
import sqlite3
import json
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
from contextlib import contextmanager
import logging
from app.core.config import get_config

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Database manager for SQLite operations"""
    
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            config = get_config()
            db_path = config.database.path
        
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database with schema"""
        schema_path = Path(__file__).parent / "schema.sql"
        
        if not schema_path.exists():
            logger.warning(f"Schema file not found: {schema_path}")
            return
        
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        with self.get_connection() as conn:
            conn.executescript(schema_sql)
            conn.commit()
        
        logger.info(f"Database initialized at {self.db_path}")
    
    @contextmanager
    def get_connection(self):
        """Get database connection context manager"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # Access columns by name
        try:
            yield conn
        finally:
            conn.close()
    
    def execute_query(
        self,
        query: str,
        params: Optional[Tuple] = None
    ) -> List[sqlite3.Row]:
        """Execute SELECT query and return results"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            return cursor.fetchall()
    
    def execute_update(
        self,
        query: str,
        params: Optional[Tuple] = None
    ) -> int:
        """Execute INSERT/UPDATE/DELETE query and return affected rows"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            conn.commit()
            return cursor.rowcount
    
    def execute_many(
        self,
        query: str,
        params_list: List[Tuple]
    ) -> int:
        """Execute query with multiple parameter sets"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            conn.commit()
            return cursor.rowcount
    
    # ========================================================================
    # Document Operations
    # ========================================================================
    
    def insert_document(self, doc_data: Dict[str, Any]) -> str:
        """Insert document and return doc_id"""
        query = """
        INSERT INTO documents (doc_id, title, doc_type, file_path, url, 
                               size_bytes, status, metadata, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            doc_data['doc_id'],
            doc_data['title'],
            doc_data['doc_type'],
            doc_data.get('file_path'),
            doc_data.get('url'),
            doc_data.get('size_bytes', 0),
            doc_data.get('status', 'pending'),
            json.dumps(doc_data.get('metadata', {})),
            json.dumps(doc_data.get('tags', []))
        )
        self.execute_update(query, params)
        return doc_data['doc_id']
    
    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        query = "SELECT * FROM documents WHERE doc_id = ?"
        results = self.execute_query(query, (doc_id,))
        if results:
            row = results[0]
            return dict(row)
        return None
    
    def update_document_status(self, doc_id: str, status: str):
        """Update document status"""
        query = "UPDATE documents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE doc_id = ?"
        self.execute_update(query, (status, doc_id))
    
    def list_documents(
        self,
        limit: int = 100,
        offset: int = 0,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List documents with pagination"""
        if status:
            query = "SELECT * FROM documents WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
            results = self.execute_query(query, (status, limit, offset))
        else:
            query = "SELECT * FROM documents ORDER BY created_at DESC LIMIT ? OFFSET ?"
            results = self.execute_query(query, (limit, offset))
        
        return [dict(row) for row in results]
    
    # ========================================================================
    # Chunk Operations
    # ========================================================================
    
    def insert_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Insert multiple chunks"""
        query = """
        INSERT INTO chunks (chunk_id, doc_id, content, embedding, 
                           chunk_index, page_number, start_char, end_char)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        params_list = [
            (
                chunk['chunk_id'],
                chunk['doc_id'],
                chunk['content'],
                chunk.get('embedding'),  # Serialized numpy array
                chunk.get('chunk_index'),
                chunk.get('page_number'),
                chunk.get('start_char'),
                chunk.get('end_char')
            )
            for chunk in chunks
        ]
        return self.execute_many(query, params_list)
    
    def get_chunks_by_doc(self, doc_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a document"""
        query = "SELECT * FROM chunks WHERE doc_id = ? ORDER BY chunk_index"
        results = self.execute_query(query, (doc_id,))
        return [dict(row) for row in results]
    
    # ========================================================================
    # Entity Operations
    # ========================================================================
    
    def insert_entity(self, entity_data: Dict[str, Any]) -> str:
        """Insert entity"""
        query = """
        INSERT OR REPLACE INTO entities (entity_id, name, entity_type, description, 
                                         importance_score, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        params = (
            entity_data['entity_id'],
            entity_data['name'],
            entity_data.get('entity_type'),
            entity_data.get('description'),
            entity_data.get('importance_score', 0.5),
            json.dumps(entity_data.get('metadata', {}))
        )
        self.execute_update(query, params)
        return entity_data['entity_id']
    
    def get_entity_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get entity by name"""
        query = "SELECT * FROM entities WHERE name = ?"
        results = self.execute_query(query, (name,))
        if results:
            return dict(results[0])
        return None
    
    def update_entity_importance(self, entity_id: str, score: float):
        """Update entity importance score"""
        query = """
        UPDATE entities 
        SET importance_score = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE entity_id = ?
        """
        self.execute_update(query, (score, entity_id))
    
    # ========================================================================
    # Relation Operations
    # ========================================================================
    
    def insert_relation(self, relation_data: Dict[str, Any]) -> str:
        """Insert relation"""
        query = """
        INSERT INTO relations (relation_id, source_entity_id, target_entity_id,
                              relation_type, confidence, source_doc_id, 
                              source_chunk_id, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            relation_data['relation_id'],
            relation_data['source_entity_id'],
            relation_data['target_entity_id'],
            relation_data['relation_type'],
            relation_data.get('confidence', 0.5),
            relation_data.get('source_doc_id'),
            relation_data.get('source_chunk_id'),
            json.dumps(relation_data.get('metadata', {}))
        )
        self.execute_update(query, params)
        return relation_data['relation_id']
    
    def get_entity_relations(self, entity_id: str) -> List[Dict[str, Any]]:
        """Get all relations for an entity"""
        query = """
        SELECT * FROM relations 
        WHERE source_entity_id = ? OR target_entity_id = ?
        """
        results = self.execute_query(query, (entity_id, entity_id))
        return [dict(row) for row in results]
    
    # ========================================================================
    # Provenance Operations
    # ========================================================================
    
    def insert_provenance_log(self, log_data: Dict[str, Any]) -> str:
        """Insert provenance log"""
        query = """
        INSERT INTO provenance_logs (log_id, query, answer, mode_used, confidence,
                                     chunks_used, entities_used, graph_paths,
                                     processing_time_ms, cached, session_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            log_data['log_id'],
            log_data['query'],
            log_data['answer'],
            log_data['mode_used'],
            log_data.get('confidence'),
            json.dumps(log_data.get('chunks_used', [])),
            json.dumps(log_data.get('entities_used', [])),
            json.dumps(log_data.get('graph_paths', [])),
            log_data.get('processing_time_ms'),
            log_data.get('cached', False),
            log_data.get('session_id')
        )
        self.execute_update(query, params)
        return log_data['log_id']
    
    # ========================================================================
    # Metrics Operations
    # ========================================================================
    
    def insert_metric(self, metric_name: str, metric_value: float, metadata: Optional[Dict] = None):
        """Insert metric"""
        query = "INSERT INTO metrics (metric_name, metric_value, metadata) VALUES (?, ?, ?)"
        self.execute_update(query, (metric_name, metric_value, json.dumps(metadata or {})))
    
    def get_metrics(
        self,
        metric_name: str,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get recent metrics"""
        query = """
        SELECT * FROM metrics 
        WHERE metric_name = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
        """
        results = self.execute_query(query, (metric_name, limit))
        return [dict(row) for row in results]


# Global database instance
_db: Optional[DatabaseManager] = None


def get_db() -> DatabaseManager:
    """Get global database instance"""
    global _db
    if _db is None:
        _db = DatabaseManager()
    return _db
