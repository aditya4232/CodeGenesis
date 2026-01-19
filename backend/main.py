from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import json
from orchestrator import CodeGenesisOrchestrator
from dotenv import load_dotenv
from api_config import api_config
from model_router import ModelRouter, TaskType, NoAvailableModelError
from langchain_core.messages import HumanMessage, SystemMessage

load_dotenv()

app = FastAPI(title="CodeGenesis API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    user_api_key: Optional[str] = None
    user_provider: Optional[str] = None  # "openai", "anthropic", "gemini", "a4f", "custom"
    user_base_url: Optional[str] = None  # For custom API endpoints

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "CodeGenesis Architect Engine is Online"}

@app.post("/api/generate")
def generate_app(request: GenerateRequest):
    """
    Generate an application from a text prompt.
    REQUIRES user's API key - platform API is NOT used for project generation.
    """
    # Validate that user provided API credentials
    if not request.user_api_key or not request.user_provider:
        return {
            "error": "API_KEY_REQUIRED",
            "message": "Please configure your API key in Settings to generate projects.",
            "status": "error"
        }
    
    # Initialize orchestrator with user's API credentials
    orchestrator = CodeGenesisOrchestrator(
        user_api_key=request.user_api_key,
        user_provider=request.user_provider,
        user_base_url=request.user_base_url
    )
    
    try:
        result = orchestrator.generate_app(request.prompt)
        return result
    except ValueError as e:
        return {
            "error": "INVALID_API_CONFIG",
            "message": str(e),
            "status": "error"
        }

@app.post("/api/chat")
def chat(request: ChatRequest):
    """
    AI chatbot for platform features (recommendations, help, etc.)
    Always uses platform A4F API - not user's API key.
    """
    # Get platform LLM (always A4F)
    llm = api_config.get_llm(context="platform", temperature=0.7)
    
    system_prompt = """You are CodeGenesis AI Assistant. Help users with:
- Recommendations for their projects
- Best practices for app development
- Suggestions for features and improvements
- General coding questions

Be helpful, concise, and friendly."""
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=request.message)
    ]
    
    response = llm.invoke(messages)
    return {"response": response.content}

@app.post("/api/validate-key")
def validate_api_key(request: GenerateRequest):
    """Validate user's API key."""
    if not request.user_api_key or not request.user_provider:
        return {"valid": False, "message": "API key and provider required"}
    
    is_valid = api_config.validate_user_api_key(
        request.user_api_key,
        request.user_provider
    )
    
    return {
        "valid": is_valid,
        "message": "API key is valid" if is_valid else "API key validation failed"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "agents": ["architect", "engineer", "testsprite", "debugger"]}


# ========== STREAMING & SMART ROUTING ENDPOINTS ==========

class SmartChatRequest(BaseModel):
    """Request for smart chat with automatic model routing"""
    message: str
    project_id: Optional[str] = None
    context: Optional[str] = None
    api_keys: Optional[Dict[str, str]] = None  # {"groq": "key", "google_ai": "key", ...}
    stream: bool = False
    task_type: str = "general"  # code_generation, code_review, architecture, testing, documentation


class SmartGenerateRequest(BaseModel):
    """Request for smart generation with automatic free model routing"""
    prompt: str
    api_keys: Optional[Dict[str, str]] = None
    preferred_provider: Optional[str] = None  # groq, google_ai, openrouter_free, cloudflare


@app.post("/api/chat/stream")
async def stream_chat(request: SmartChatRequest):
    """
    Stream AI responses with automatic model routing.
    Uses Server-Sent Events (SSE) for real-time streaming.
    """
    # Initialize router with user's API keys
    router = ModelRouter(request.api_keys)
    
    # Map task type string to enum
    task_type_map = {
        "code_generation": TaskType.CODE_GENERATION,
        "code_review": TaskType.CODE_REVIEW,
        "architecture": TaskType.ARCHITECTURE,
        "testing": TaskType.TESTING,
        "documentation": TaskType.DOCUMENTATION,
        "general": TaskType.GENERAL
    }
    task_type = task_type_map.get(request.task_type, TaskType.GENERAL)
    
    system_prompt = """You are CodeGenesis AI, an expert software architect and developer.
You help users build applications from natural language descriptions.
Provide helpful, accurate, and practical advice.
When generating code, use modern best practices and well-structured patterns."""
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    # Add context if provided
    if request.context:
        messages.append(SystemMessage(content=f"Project context: {request.context}"))
    
    messages.append(HumanMessage(content=request.message))
    
    async def generate():
        try:
            async for chunk in router.stream_request(messages, task_type):
                data = json.dumps({
                    "content": chunk["content"],
                    "model": chunk["model_used"],
                    "provider": chunk["provider"]
                })
                yield f"data: {data}\n\n"
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except NoAvailableModelError as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Generation failed: {str(e)}' })}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/chat/smart")
async def smart_chat(request: SmartChatRequest):
    """
    Non-streaming smart chat with automatic model routing and fallback.
    """
    # Initialize router with user's API keys
    router = ModelRouter(request.api_keys)
    
    task_type_map = {
        "code_generation": TaskType.CODE_GENERATION,
        "code_review": TaskType.CODE_REVIEW,
        "architecture": TaskType.ARCHITECTURE,
        "testing": TaskType.TESTING,
        "documentation": TaskType.DOCUMENTATION,
        "general": TaskType.GENERAL
    }
    task_type = task_type_map.get(request.task_type, TaskType.GENERAL)
    
    system_prompt = """You are CodeGenesis AI, an expert software architect and developer.
You help users build applications from natural language descriptions.
Provide helpful, accurate, and practical advice.
When generating code, use modern best practices and well-structured patterns."""
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    if request.context:
        messages.append(SystemMessage(content=f"Project context: {request.context}"))
    
    messages.append(HumanMessage(content=request.message))
    
    try:
        result = await router.route_request(messages, task_type)
        return {
            "response": result["content"],
            "model_used": result["model_used"],
            "provider": result["provider"],
            "status": "success"
        }
    except NoAvailableModelError as e:
        return {
            "error": "NO_AVAILABLE_MODEL",
            "message": str(e),
            "status": "error"
        }
    except Exception as e:
        return {
            "error": "GENERATION_FAILED",
            "message": str(e),
            "status": "error"
        }


@app.post("/api/generate/smart")
async def smart_generate(request: SmartGenerateRequest):
    """
    Generate an application using smart model routing with free APIs.
    Automatically selects the best available free model.
    """
    router = ModelRouter(request.api_keys)
    
    # Check available models
    available = router.get_available_models(TaskType.CODE_GENERATION)
    if not available:
        return {
            "error": "NO_API_KEYS",
            "message": "Please configure at least one free API key (Groq, Google AI, OpenRouter, or Cloudflare)",
            "status": "error",
            "help": {
                "groq": "Get free key at https://console.groq.com",
                "google_ai": "Get free key at https://aistudio.google.com/apikey",
                "openrouter": "Get free key at https://openrouter.ai/keys"
            }
        }
    
    # Use the preferred provider if specified and available
    provider = request.preferred_provider
    if provider and provider in request.api_keys:
        api_key = request.api_keys[provider]
    else:
        # Use the best available
        provider = available[0].provider
        api_key = request.api_keys.get(provider)
    
    if not api_key:
        return {
            "error": "MISSING_API_KEY",
            "message": f"No API key for provider: {provider}",
            "status": "error"
        }
    
    try:
        orchestrator = CodeGenesisOrchestrator(
            user_api_key=api_key,
            user_provider=provider
        )
        
        result = orchestrator.generate_app(request.prompt)
        result["provider_used"] = provider
        result["model_info"] = {
            "provider": provider,
            "is_free": True
        }
        return result
        
    except Exception as e:
        return {
            "error": "GENERATION_FAILED",
            "message": str(e),
            "status": "error"
        }


@app.get("/api/providers/free")
def get_free_providers():
    """
    Get list of supported free API providers and their setup instructions.
    """
    return {
        "providers": [
            {
                "id": "groq",
                "name": "Groq",
                "description": "Ultra-fast LPU inference with generous free tier",
                "free_tier": "14,400 requests/day for Llama 3.1 8B, 1,000/day for Llama 3.3 70B",
                "signup_url": "https://console.groq.com",
                "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
                "recommended": True
            },
            {
                "id": "google_ai",
                "name": "Google AI Studio",
                "description": "Free access to Gemini models",
                "free_tier": "Free for developers, students, and researchers",
                "signup_url": "https://aistudio.google.com/apikey",
                "models": ["gemini-2.0-flash-exp", "gemini-1.5-flash"],
                "recommended": True
            },
            {
                "id": "openrouter_free",
                "name": "OpenRouter (Free Models)",
                "description": "Access to various free AI models",
                "free_tier": "50 requests/day on free models",
                "signup_url": "https://openrouter.ai/keys",
                "models": ["meta-llama/llama-3.2-3b-instruct:free"],
                "recommended": False
            },
            {
                "id": "cloudflare",
                "name": "Cloudflare Workers AI",
                "description": "10,000 free requests/day with global edge network",
                "free_tier": "10,000 requests/day",
                "signup_url": "https://dash.cloudflare.com/",
                "models": ["@cf/meta/llama-3.1-8b-instruct"],
                "recommended": False,
                "note": "Requires Cloudflare account ID"
            }
        ],
        "tip": "For best results, configure multiple free providers for automatic fallback!"
    }


@app.get("/api/router/stats")
def get_router_stats():
    """
    Get model router statistics (usage and errors).
    """
    from model_router import model_router
    return model_router.get_stats()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

