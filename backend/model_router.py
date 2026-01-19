"""
Model Router for CodeGenesis
Intelligent routing to free AI models with automatic fallback
"""
import os
import asyncio
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from enum import Enum
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage
from dotenv import load_dotenv

load_dotenv()


class TaskType(Enum):
    """Types of tasks for optimized model routing"""
    CODE_GENERATION = "code_generation"
    CODE_REVIEW = "code_review"
    ARCHITECTURE = "architecture"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    GENERAL = "general"


@dataclass
class ModelConfig:
    """Configuration for a single model"""
    provider: str
    model: str
    priority: int
    base_url: str
    max_tokens: int = 4096
    supports_streaming: bool = True
    best_for: List[TaskType] = None
    
    def __post_init__(self):
        if self.best_for is None:
            self.best_for = [TaskType.GENERAL]


# Free models registry - ordered by priority
FREE_MODELS: List[ModelConfig] = [
    ModelConfig(
        provider="groq",
        model="llama-3.3-70b-versatile",
        priority=1,
        base_url="https://api.groq.com/openai/v1",
        max_tokens=32768,
        best_for=[TaskType.CODE_GENERATION, TaskType.CODE_REVIEW, TaskType.ARCHITECTURE]
    ),
    ModelConfig(
        provider="groq",
        model="llama-3.1-8b-instant",
        priority=2,
        base_url="https://api.groq.com/openai/v1",
        max_tokens=8192,
        best_for=[TaskType.TESTING, TaskType.GENERAL]
    ),
    ModelConfig(
        provider="google_ai",
        model="gemini-2.0-flash-exp",
        priority=3,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        max_tokens=8192,
        best_for=[TaskType.CODE_GENERATION, TaskType.DOCUMENTATION]
    ),
    ModelConfig(
        provider="openrouter_free",
        model="meta-llama/llama-3.2-3b-instruct:free",
        priority=4,
        base_url="https://openrouter.ai/api/v1",
        max_tokens=4096,
        best_for=[TaskType.GENERAL]
    ),
    ModelConfig(
        provider="cloudflare",
        model="@cf/meta/llama-3.1-8b-instruct",
        priority=5,
        base_url="",  # Requires account ID
        max_tokens=4096,
        best_for=[TaskType.GENERAL]
    ),
]


class RateLimitError(Exception):
    """Raised when a model is rate limited"""
    pass


class NoAvailableModelError(Exception):
    """Raised when all models are unavailable"""
    pass


class ModelRouter:
    """
    Routes requests to optimal free model with automatic fallback.
    
    Features:
    - Task-optimized model selection
    - Automatic fallback on rate limits
    - Tracks usage and errors per model
    - Supports multiple API keys per provider
    """
    
    def __init__(self, user_api_keys: Optional[Dict[str, str]] = None):
        """
        Initialize the model router.
        
        Args:
            user_api_keys: Dict mapping provider names to API keys
                           e.g., {"groq": "gsk_xxx", "google_ai": "AIza..."}
        """
        self.user_api_keys = user_api_keys or {}
        self.model_errors: Dict[str, int] = {}
        self.model_usage: Dict[str, int] = {}
        
        # Load default keys from environment
        self._load_env_keys()
    
    def _load_env_keys(self):
        """Load API keys from environment variables"""
        env_mappings = {
            "groq": "GROQ_API_KEY",
            "google_ai": "GOOGLE_AI_API_KEY",
            "openrouter": "OPENROUTER_API_KEY",
            "openrouter_free": "OPENROUTER_API_KEY",
            "cloudflare": "CLOUDFLARE_API_KEY",
        }
        
        for provider, env_var in env_mappings.items():
            if provider not in self.user_api_keys:
                key = os.getenv(env_var)
                if key:
                    self.user_api_keys[provider] = key
    
    def get_available_models(self, task_type: TaskType = TaskType.GENERAL) -> List[ModelConfig]:
        """
        Get list of available models for a task type, sorted by priority.
        Only returns models for which we have API keys.
        """
        available = []
        
        for model in FREE_MODELS:
            # Check if we have an API key for this provider
            if model.provider in self.user_api_keys:
                # Prioritize models that are best for this task type
                if task_type in model.best_for:
                    available.insert(0, model)
                else:
                    available.append(model)
        
        # Sort by priority within each group
        return sorted(available, key=lambda m: (
            task_type not in m.best_for,  # Best-for models first
            m.priority,
            self.model_errors.get(f"{m.provider}:{m.model}", 0)  # Fewer errors preferred
        ))
    
    def _get_llm(self, model_config: ModelConfig, temperature: float = 0.7) -> ChatOpenAI:
        """Create LLM instance for a specific model config"""
        api_key = self.user_api_keys.get(model_config.provider)
        
        if not api_key:
            raise ValueError(f"No API key for provider: {model_config.provider}")
        
        base_url = model_config.base_url
        
        # Handle Cloudflare special case
        if model_config.provider == "cloudflare":
            account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
            base_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1"
        
        extra_kwargs = {}
        if model_config.provider in ["openrouter", "openrouter_free"]:
            extra_kwargs["default_headers"] = {
                "HTTP-Referer": "https://codegenesis.app",
                "X-Title": "CodeGenesis"
            }
        
        return ChatOpenAI(
            model=model_config.model,
            openai_api_key=api_key,
            openai_api_base=base_url,
            temperature=temperature,
            max_tokens=model_config.max_tokens,
            **extra_kwargs
        )
    
    async def route_request(
        self,
        messages: List[BaseMessage],
        task_type: TaskType = TaskType.GENERAL,
        temperature: float = 0.7,
        retry_count: int = 3
    ) -> Dict[str, Any]:
        """
        Route a request to the best available model with automatic fallback.
        
        Args:
            messages: List of LangChain messages
            task_type: Type of task for optimized routing
            temperature: Model temperature
            retry_count: Number of models to try before giving up
            
        Returns:
            Dict with 'content', 'model_used', and 'provider'
            
        Raises:
            NoAvailableModelError: If all models fail
        """
        available_models = self.get_available_models(task_type)
        
        if not available_models:
            raise NoAvailableModelError("No models available. Please configure at least one API key.")
        
        errors = []
        
        for model_config in available_models[:retry_count]:
            model_key = f"{model_config.provider}:{model_config.model}"
            
            try:
                llm = self._get_llm(model_config, temperature)
                response = await asyncio.to_thread(llm.invoke, messages)
                
                # Track successful usage
                self.model_usage[model_key] = self.model_usage.get(model_key, 0) + 1
                
                return {
                    "content": response.content,
                    "model_used": model_config.model,
                    "provider": model_config.provider
                }
                
            except Exception as e:
                error_str = str(e).lower()
                
                # Track error
                self.model_errors[model_key] = self.model_errors.get(model_key, 0) + 1
                errors.append(f"{model_key}: {str(e)[:100]}")
                
                # Check if it's a rate limit error
                if "rate" in error_str or "limit" in error_str or "429" in error_str:
                    continue  # Try next model
                elif "unauthorized" in error_str or "401" in error_str:
                    continue  # Invalid key, try next
                else:
                    # For other errors, still try next model
                    continue
        
        raise NoAvailableModelError(
            f"All models failed. Errors: {'; '.join(errors)}"
        )
    
    def invoke_sync(
        self,
        messages: List[BaseMessage],
        task_type: TaskType = TaskType.GENERAL,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Synchronous version of route_request for non-async contexts"""
        return asyncio.run(self.route_request(messages, task_type, temperature))
    
    async def stream_request(
        self,
        messages: List[BaseMessage],
        task_type: TaskType = TaskType.GENERAL,
        temperature: float = 0.7
    ):
        """
        Stream a request to the best available model.
        
        Yields:
            Dict with 'content' chunk, 'model_used', and 'provider'
        """
        available_models = self.get_available_models(task_type)
        
        if not available_models:
            raise NoAvailableModelError("No models available.")
        
        model_config = available_models[0]
        llm = self._get_llm(model_config, temperature)
        
        async for chunk in llm.astream(messages):
            yield {
                "content": chunk.content,
                "model_used": model_config.model,
                "provider": model_config.provider
            }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get usage and error statistics"""
        return {
            "usage": self.model_usage,
            "errors": self.model_errors,
            "available_providers": list(self.user_api_keys.keys())
        }


# Create a global instance with environment keys
model_router = ModelRouter()
