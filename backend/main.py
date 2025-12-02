from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from orchestrator import CodeGenesisOrchestrator
from dotenv import load_dotenv

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

# Initialize orchestrator
orchestrator = CodeGenesisOrchestrator()

class GenerateRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"message": "CodeGenesis Architect Engine is Online"}

@app.post("/api/generate")
def generate_app(request: GenerateRequest):
    """Generate an application from a text prompt."""
    result = orchestrator.generate_app(request.prompt)
    return result

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "agents": ["architect", "engineer", "testsprite"]}
