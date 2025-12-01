"""
MemoRAG ULTRA - LM Studio Client
OpenAI-compatible API client for local LLM inference
"""
import asyncio
from typing import List, Dict, Any, Optional, AsyncIterator
import httpx
from openai import AsyncOpenAI
from app.core.config import get_config
import logging

logger = logging.getLogger(__name__)


class LMStudioClient:
    """Client for LM Studio local LLM server"""
    
    def __init__(self):
        self.config = get_config().lm_studio
        self.client = AsyncOpenAI(
            base_url=self.config.base_url,
            api_key="not-needed"  # LM Studio doesn't require API key
        )
        self._connected = False
    
    async def check_connection(self) -> bool:
        """Check if LM Studio server is accessible"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.config.base_url}/models",
                    timeout=5.0
                )
                self._connected = response.status_code == 200
                return self._connected
        except Exception as e:
            logger.error(f"LM Studio connection failed: {e}")
            self._connected = False
            return False
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> str:
        """
        Generate completion from LM Studio
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            temperature: Sampling temperature (optional, uses config default)
            max_tokens: Max tokens to generate (optional, uses config default)
            stream: Whether to stream response
            
        Returns:
            Generated text
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.client.chat.completions.create(
                model=self.config.model_name,
                messages=messages,
                temperature=temperature or self.config.temperature,
                max_tokens=max_tokens or self.config.max_tokens,
                stream=stream
            )
            
            if stream:
                return response  # Return stream object
            else:
                return response.choices[0].message.content
                
        except Exception as e:
            logger.error(f"LM Studio generation failed: {e}")
            raise
    
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> AsyncIterator[str]:
        """
        Generate streaming completion from LM Studio
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            temperature: Sampling temperature
            max_tokens: Max tokens to generate
            
        Yields:
            Text chunks as they're generated
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        try:
            stream = await self.client.chat.completions.create(
                model=self.config.model_name,
                messages=messages,
                temperature=temperature or self.config.temperature,
                max_tokens=max_tokens or self.config.max_tokens,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"LM Studio streaming failed: {e}")
            raise
    
    async def generate_with_retry(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_retries: int = 3,
        **kwargs
    ) -> str:
        """
        Generate with automatic retry on failure
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            max_retries: Maximum number of retries
            **kwargs: Additional arguments for generate()
            
        Returns:
            Generated text
        """
        for attempt in range(max_retries):
            try:
                return await self.generate(prompt, system_prompt, **kwargs)
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                logger.warning(f"Retry {attempt + 1}/{max_retries} after error: {e}")
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
    
    async def batch_generate(
        self,
        prompts: List[str],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> List[str]:
        """
        Generate completions for multiple prompts
        
        Args:
            prompts: List of prompts
            system_prompt: System prompt for all
            **kwargs: Additional arguments for generate()
            
        Returns:
            List of generated texts
        """
        tasks = [
            self.generate(prompt, system_prompt, **kwargs)
            for prompt in prompts
        ]
        return await asyncio.gather(*tasks)
    
    async def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extract entities and relations from text using LLM
        
        Args:
            text: Input text
            
        Returns:
            Dict with entities and relations
        """
        system_prompt = """You are an expert at extracting entities and relationships from text.
Extract key entities (people, places, concepts, etc.) and relationships between them.
Return your response as JSON with this structure:
{
  "entities": [{"name": "entity1", "type": "person"}, ...],
  "relations": [{"source": "entity1", "target": "entity2", "relation": "works_at"}, ...]
}"""
        
        prompt = f"Extract entities and relations from this text:\n\n{text}"
        
        response = await self.generate_with_retry(prompt, system_prompt)
        
        try:
            import json
            return json.loads(response)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse entity extraction response: {response}")
            return {"entities": [], "relations": []}
    
    async def detect_intent(self, query: str) -> str:
        """
        Detect query intent
        
        Args:
            query: User query
            
        Returns:
            Intent type: factual, comparative, temporal, causal, exploratory
        """
        system_prompt = """Classify the query intent into one of these categories:
- factual: asking for facts or definitions
- comparative: comparing two or more things
- temporal: asking about time, changes, or evolution
- causal: asking about causes or reasons
- exploratory: open-ended exploration

Respond with ONLY the category name, nothing else."""
        
        response = await self.generate_with_retry(query, system_prompt, temperature=0.1)
        intent = response.strip().lower()
        
        valid_intents = ["factual", "comparative", "temporal", "causal", "exploratory"]
        return intent if intent in valid_intents else "factual"
    
    async def decompose_query(self, query: str) -> List[str]:
        """
        Decompose complex query into sub-questions
        
        Args:
            query: Complex query
            
        Returns:
            List of sub-questions
        """
        system_prompt = """Break down complex questions into simpler sub-questions.
Return each sub-question on a new line, numbered.
If the question is already simple, return it as-is."""
        
        response = await self.generate_with_retry(query, system_prompt)
        
        # Parse numbered list
        lines = response.strip().split('\n')
        sub_questions = []
        for line in lines:
            # Remove numbering (1., 2., etc.)
            cleaned = line.strip()
            if cleaned and cleaned[0].isdigit():
                cleaned = cleaned.split('.', 1)[-1].strip()
            if cleaned:
                sub_questions.append(cleaned)
        
        return sub_questions if sub_questions else [query]
    
    @property
    def is_connected(self) -> bool:
        """Check if client is connected"""
        return self._connected


# Global client instance
_client: Optional[LMStudioClient] = None


def get_lm_studio_client() -> LMStudioClient:
    """Get global LM Studio client instance"""
    global _client
    if _client is None:
        _client = LMStudioClient()
    return _client
