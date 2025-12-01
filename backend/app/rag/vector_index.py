"""
MemoRAG ULTRA - Vector Index using FAISS
Fast similarity search for chunks
"""
import numpy as np
import faiss
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import logging

from app.core.config import get_config
from app.rag.embeddings import get_embedding_generator

logger = logging.getLogger(__name__)


class VectorIndex:
    """FAISS-based vector index for semantic search"""
    
    def __init__(self):
        self.config = get_config().vector_index
        self.embedding_gen = get_embedding_generator()
        self.dimension = self.embedding_gen.get_dimension()
        
        self.index: Optional[faiss.Index] = None
        self.chunk_ids: List[str] = []
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize FAISS index"""
        if self.config.index_type == "IndexFlatL2":
            # Exact search using L2 distance
            self.index = faiss.IndexFlatL2(self.dimension)
            logger.info(f"Initialized IndexFlatL2 with dimension {self.dimension}")
        
        elif self.config.index_type == "IndexIVFFlat":
            # Faster approximate search
            quantizer = faiss.IndexFlatL2(self.dimension)
            self.index = faiss.IndexIVFFlat(
                quantizer,
                self.dimension,
                self.config.nlist
            )
            logger.info(f"Initialized IndexIVFFlat with {self.config.nlist} clusters")
        
        else:
            logger.warning(f"Unknown index type '{self.config.index_type}', using IndexFlatL2")
            self.index = faiss.IndexFlatL2(self.dimension)
    
    def add_chunks(
        self,
        chunk_ids: List[str],
        chunk_texts: List[str]
    ) -> int:
        """
        Add chunks to index
        
        Args:
            chunk_ids: List of chunk IDs
            chunk_texts: List of chunk texts
            
        Returns:
            Number of chunks added
        """
        if not chunk_ids or not chunk_texts:
            return 0
        
        # Generate embeddings
        logger.info(f"Generating embeddings for {len(chunk_texts)} chunks...")
        embeddings = self.embedding_gen.embed_batch(chunk_texts)
        
        # Train index if needed (for IVF indexes)
        if isinstance(self.index, faiss.IndexIVFFlat) and not self.index.is_trained:
            logger.info("Training IVF index...")
            self.index.train(embeddings)
        
        # Add to index
        self.index.add(embeddings)
        self.chunk_ids.extend(chunk_ids)
        
        logger.info(f"Added {len(chunk_ids)} chunks to index (total: {self.index.ntotal})")
        return len(chunk_ids)
    
    def search(
        self,
        query: str,
        top_k: int = 5
    ) -> List[Tuple[str, float]]:
        """
        Search for similar chunks
        
        Args:
            query: Query text
            top_k: Number of results to return
            
        Returns:
            List of (chunk_id, distance) tuples
        """
        if self.index.ntotal == 0:
            logger.warning("Index is empty")
            return []
        
        # Generate query embedding
        query_embedding = self.embedding_gen.embed_text(query)
        query_embedding = np.array([query_embedding])
        
        # Search
        distances, indices = self.index.search(query_embedding, top_k)
        
        # Convert to results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.chunk_ids):
                results.append((self.chunk_ids[idx], float(dist)))
        
        return results
    
    def search_batch(
        self,
        queries: List[str],
        top_k: int = 5
    ) -> List[List[Tuple[str, float]]]:
        """
        Batch search for multiple queries
        
        Args:
            queries: List of query texts
            top_k: Number of results per query
            
        Returns:
            List of result lists
        """
        if self.index.ntotal == 0:
            return [[] for _ in queries]
        
        # Generate query embeddings
        query_embeddings = self.embedding_gen.embed_batch(queries)
        
        # Search
        distances, indices = self.index.search(query_embeddings, top_k)
        
        # Convert to results
        all_results = []
        for dist_row, idx_row in zip(distances, indices):
            results = []
            for dist, idx in zip(dist_row, idx_row):
                if idx < len(self.chunk_ids):
                    results.append((self.chunk_ids[idx], float(dist)))
            all_results.append(results)
        
        return all_results
    
    def remove_chunks(self, chunk_ids: List[str]) -> int:
        """
        Remove chunks from index
        Note: FAISS doesn't support efficient removal, so we rebuild
        
        Args:
            chunk_ids: List of chunk IDs to remove
            
        Returns:
            Number of chunks removed
        """
        # Find indices to keep
        chunk_ids_set = set(chunk_ids)
        keep_indices = [
            i for i, cid in enumerate(self.chunk_ids)
            if cid not in chunk_ids_set
        ]
        
        if len(keep_indices) == len(self.chunk_ids):
            return 0  # Nothing to remove
        
        # Rebuild index with remaining chunks
        logger.info(f"Rebuilding index after removing {len(chunk_ids)} chunks...")
        
        # Get embeddings for chunks to keep
        old_embeddings = self.index.reconstruct_n(0, self.index.ntotal)
        keep_embeddings = old_embeddings[keep_indices]
        
        # Reinitialize and add
        self._initialize_index()
        if len(keep_embeddings) > 0:
            if isinstance(self.index, faiss.IndexIVFFlat):
                self.index.train(keep_embeddings)
            self.index.add(keep_embeddings)
        
        self.chunk_ids = [self.chunk_ids[i] for i in keep_indices]
        
        return len(chunk_ids)
    
    def save(self, path: str):
        """Save index to disk"""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, str(path / "faiss.index"))
        
        # Save chunk IDs
        with open(path / "chunk_ids.pkl", 'wb') as f:
            pickle.dump(self.chunk_ids, f)
        
        logger.info(f"Saved index to {path}")
    
    def load(self, path: str) -> bool:
        """
        Load index from disk
        
        Returns:
            True if successful
        """
        path = Path(path)
        
        if not (path / "faiss.index").exists():
            logger.warning(f"Index not found at {path}")
            return False
        
        try:
            # Load FAISS index
            self.index = faiss.read_index(str(path / "faiss.index"))
            
            # Load chunk IDs
            with open(path / "chunk_ids.pkl", 'rb') as f:
                self.chunk_ids = pickle.load(f)
            
            logger.info(f"Loaded index from {path} ({self.index.ntotal} vectors)")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load index: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        return {
            'total_vectors': self.index.ntotal if self.index else 0,
            'dimension': self.dimension,
            'index_type': self.config.index_type,
            'total_chunks': len(self.chunk_ids)
        }


# Global vector index instance
_vector_index: Optional[VectorIndex] = None


def get_vector_index() -> VectorIndex:
    """Get global vector index instance"""
    global _vector_index
    if _vector_index is None:
        _vector_index = VectorIndex()
        
        # Try to load existing index
        index_path = Path(get_config().paths.indexes) / "vector"
        _vector_index.load(str(index_path))
    
    return _vector_index
