"""
MemoRAG ULTRA - Text Chunking Strategies
"""
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

from app.core.config import get_config

logger = logging.getLogger(__name__)


@dataclass
class Chunk:
    """Text chunk with metadata"""
    content: str
    chunk_index: int
    start_char: int
    end_char: int
    page_number: Optional[int] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class TextChunker:
    """Text chunking with multiple strategies"""
    
    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None
    ):
        config = get_config().rag
        self.chunk_size = chunk_size or config.chunk_size
        self.chunk_overlap = chunk_overlap or config.chunk_overlap
    
    def chunk_text(
        self,
        text: str,
        strategy: str = "fixed",
        page_number: Optional[int] = None
    ) -> List[Chunk]:
        """
        Chunk text using specified strategy
        
        Args:
            text: Input text
            strategy: Chunking strategy ('fixed', 'sentence', 'semantic')
            page_number: Optional page number for metadata
            
        Returns:
            List of chunks
        """
        if strategy == "fixed":
            return self._chunk_fixed_size(text, page_number)
        elif strategy == "sentence":
            return self._chunk_by_sentence(text, page_number)
        elif strategy == "semantic":
            return self._chunk_semantic(text, page_number)
        else:
            logger.warning(f"Unknown strategy '{strategy}', using 'fixed'")
            return self._chunk_fixed_size(text, page_number)
    
    def _chunk_fixed_size(
        self,
        text: str,
        page_number: Optional[int] = None
    ) -> List[Chunk]:
        """
        Fixed-size chunking with overlap
        
        Args:
            text: Input text
            page_number: Optional page number
            
        Returns:
            List of chunks
        """
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence ending within next 100 chars
                search_end = min(end + 100, len(text))
                sentence_ends = [
                    m.end() for m in re.finditer(r'[.!?]\s+', text[end:search_end])
                ]
                if sentence_ends:
                    end = end + sentence_ends[0]
            
            chunk_text = text[start:end].strip()
            
            if chunk_text:
                chunks.append(Chunk(
                    content=chunk_text,
                    chunk_index=chunk_index,
                    start_char=start,
                    end_char=end,
                    page_number=page_number
                ))
                chunk_index += 1
            
            # Move start position with overlap
            start = end - self.chunk_overlap
        
        return chunks
    
    def _chunk_by_sentence(
        self,
        text: str,
        page_number: Optional[int] = None
    ) -> List[Chunk]:
        """
        Sentence-based chunking
        
        Args:
            text: Input text
            page_number: Optional page number
            
        Returns:
            List of chunks
        """
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = []
        current_size = 0
        chunk_index = 0
        start_char = 0
        
        for sentence in sentences:
            sentence_size = len(sentence)
            
            if current_size + sentence_size > self.chunk_size and current_chunk:
                # Create chunk from accumulated sentences
                chunk_text = ' '.join(current_chunk)
                chunks.append(Chunk(
                    content=chunk_text,
                    chunk_index=chunk_index,
                    start_char=start_char,
                    end_char=start_char + len(chunk_text),
                    page_number=page_number
                ))
                
                # Keep last sentence for overlap
                overlap_sentences = []
                overlap_size = 0
                for s in reversed(current_chunk):
                    if overlap_size + len(s) <= self.chunk_overlap:
                        overlap_sentences.insert(0, s)
                        overlap_size += len(s)
                    else:
                        break
                
                start_char += len(chunk_text) - overlap_size
                current_chunk = overlap_sentences
                current_size = overlap_size
                chunk_index += 1
            
            current_chunk.append(sentence)
            current_size += sentence_size
        
        # Add remaining chunk
        if current_chunk:
            chunk_text = ' '.join(current_chunk)
            chunks.append(Chunk(
                content=chunk_text,
                chunk_index=chunk_index,
                start_char=start_char,
                end_char=start_char + len(chunk_text),
                page_number=page_number
            ))
        
        return chunks
    
    def _chunk_semantic(
        self,
        text: str,
        page_number: Optional[int] = None
    ) -> List[Chunk]:
        """
        Semantic chunking based on topic coherence
        (Simplified version - uses paragraph breaks as proxy)
        
        Args:
            text: Input text
            page_number: Optional page number
            
        Returns:
            List of chunks
        """
        # Split by paragraphs
        paragraphs = re.split(r'\n\s*\n', text)
        
        chunks = []
        current_chunk = []
        current_size = 0
        chunk_index = 0
        start_char = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            para_size = len(para)
            
            if current_size + para_size > self.chunk_size and current_chunk:
                # Create chunk
                chunk_text = '\n\n'.join(current_chunk)
                chunks.append(Chunk(
                    content=chunk_text,
                    chunk_index=chunk_index,
                    start_char=start_char,
                    end_char=start_char + len(chunk_text),
                    page_number=page_number
                ))
                
                start_char += len(chunk_text)
                current_chunk = []
                current_size = 0
                chunk_index += 1
            
            current_chunk.append(para)
            current_size += para_size
        
        # Add remaining chunk
        if current_chunk:
            chunk_text = '\n\n'.join(current_chunk)
            chunks.append(Chunk(
                content=chunk_text,
                chunk_index=chunk_index,
                start_char=start_char,
                end_char=start_char + len(chunk_text),
                page_number=page_number
            ))
        
        return chunks
    
    def chunk_with_metadata(
        self,
        text: str,
        doc_metadata: Dict[str, Any],
        strategy: str = "fixed"
    ) -> List[Chunk]:
        """
        Chunk text and add document metadata to each chunk
        
        Args:
            text: Input text
            doc_metadata: Document metadata to add to chunks
            strategy: Chunking strategy
            
        Returns:
            List of chunks with metadata
        """
        chunks = self.chunk_text(text, strategy)
        
        for chunk in chunks:
            chunk.metadata.update(doc_metadata)
        
        return chunks


def get_chunker(
    chunk_size: Optional[int] = None,
    chunk_overlap: Optional[int] = None
) -> TextChunker:
    """Get text chunker instance"""
    return TextChunker(chunk_size, chunk_overlap)
