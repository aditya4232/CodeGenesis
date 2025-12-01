"""
MemoRAG ULTRA - Local Embeddings Generation
Uses sentence-transformers for local embedding generation
"""
import numpy as np
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import logging
from functools import lru_cache

from app.core.config import get_config

logger = logging.getLogger(__name__)


class EmbeddingGenerator:
    """Local embedding generator using sentence-transformers"""
    
    def __init__(self):
        self.config = get_config().embeddings
        self.model: Optional[SentenceTransformer] = None
        self._load_model()
    
    def _load_model(self):
        """Load embedding model"""
        try:
            logger.info(f"Loading embedding model: {self.config.model_name}")
            self.model = SentenceTransformer(
                self.config.model_name,
                device=self.config.device
            )
            logger.info(f"✓ Embedding model loaded on {self.config.device}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    def embed_text(self, text: str) -> np.ndarray:
        """
        Generate embedding for single text
        
        Args:
            text: Input text
            
        Returns:
            Embedding vector as numpy array
        """
        if not self.model:
            raise RuntimeError("Embedding model not loaded")
        
        embedding = self.model.encode(
            text,
            convert_to_numpy=True,
            show_progress_bar=False
        )
        return embedding
    
    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            Array of embeddings (n_texts, embedding_dim)
        """
        if not self.model:
            raise RuntimeError("Embedding model not loaded")
        
        embeddings = self.model.encode(
            texts,
            batch_size=self.config.batch_size,
            convert_to_numpy=True,
            show_progress_bar=len(texts) > 100
        )
        return embeddings
    
    @lru_cache(maxsize=1000)
    def embed_cached(self, text: str) -> np.ndarray:
        """
        Generate embedding with caching for frequently used texts
        
        Args:
            text: Input text
            
        Returns:
            Embedding vector
        """
        return self.embed_text(text)
    
    def get_dimension(self) -> int:
        """Get embedding dimension"""
        if not self.model:
            raise RuntimeError("Embedding model not loaded")
        return self.model.get_sentence_embedding_dimension()
    
    def compute_similarity(self, text1: str, text2: str) -> float:
        """
        Compute cosine similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
            
        Returns:
            Similarity score (0-1)
        """
        emb1 = self.embed_text(text1)
        emb2 = self.embed_text(text2)
        
        # Cosine similarity
        similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
        return float(similarity)
    
    def find_most_similar(
        self,
        query: str,
        candidates: List[str],
        top_k: int = 5
    ) -> List[tuple[int, float]]:
        """
        Find most similar texts to query
        
        Args:
            query: Query text
            candidates: List of candidate texts
            top_k: Number of top results to return
            
        Returns:
            List of (index, similarity_score) tuples
        """
        query_emb = self.embed_text(query)
        candidate_embs = self.embed_batch(candidates)
        
        # Compute similarities
        similarities = np.dot(candidate_embs, query_emb) / (
            np.linalg.norm(candidate_embs, axis=1) * np.linalg.norm(query_emb)
        )
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        return [(int(idx), float(similarities[idx])) for idx in top_indices]


# Global embedding generator instance
_embedding_generator: Optional[EmbeddingGenerator] = None


def get_embedding_generator() -> EmbeddingGenerator:
    """Get global embedding generator instance"""
    global _embedding_generator
    if _embedding_generator is None:
        _embedding_generator = EmbeddingGenerator()
    return _embedding_generator
