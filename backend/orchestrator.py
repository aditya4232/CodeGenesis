from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from agents.architect import ArchitectAgent
from agents.engineer import EngineerAgent
from agents.testsprite import TestSpriteAgent
from vfs import VirtualFileSystem

class CodeGenState(TypedDict):
    """State for the CodeGenesis workflow."""
    user_prompt: str
    file_plan: dict
    generated_files: dict
    test_script: str
    status: str

class CodeGenesisOrchestrator:
    """LangGraph-based orchestrator for the coding workflow."""
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        """
        Initialize orchestrator with user API credentials.
        
        Args:
            user_api_key: User's own API key (REQUIRED for project generation)
            user_provider: User's API provider (REQUIRED)
            user_base_url: Custom base URL (optional)
        """
        self.architect = ArchitectAgent(user_api_key, user_provider, user_base_url)
        self.engineer = EngineerAgent(user_api_key, user_provider, user_base_url)
        self.testsprite = TestSpriteAgent(user_api_key, user_provider, user_base_url)
        self.vfs = VirtualFileSystem()
        
        # Build the graph
        self.workflow = self._build_graph()
    
    def _build_graph(self):
        """Build the LangGraph workflow."""
        workflow = StateGraph(CodeGenState)
        
        # Add nodes
        workflow.add_node("architect", self._architect_node)
        workflow.add_node("engineer", self._engineer_node)
        workflow.add_node("testsprite", self._testsprite_node)
        
        # Define edges
        workflow.set_entry_point("architect")
        workflow.add_edge("architect", "engineer")
        workflow.add_edge("engineer", "testsprite")
        workflow.add_edge("testsprite", END)
        
        return workflow.compile()
    
    def _architect_node(self, state: CodeGenState) -> CodeGenState:
        """Architect planning node."""
        plan = self.architect.plan(state["user_prompt"])
        state["file_plan"] = plan
        state["status"] = "Planning complete"
        return state
    
    def _engineer_node(self, state: CodeGenState) -> CodeGenState:
        """Engineer coding node."""
        plan = state["file_plan"]
        files = {}
        
        for filename, description in plan.get("files", {}).items():
            code = self.engineer.write_file(
                filename, 
                description, 
                state["user_prompt"],
                plan.get("tech_stack", "HTML/CSS/JS")
            )
            files[filename] = code
            self.vfs.write_file(filename, code)
        
        state["generated_files"] = files
        state["status"] = "Code generation complete"
        return state
    
    def _testsprite_node(self, state: CodeGenState) -> CodeGenState:
        """TestSprite QA node."""
        test_code = self.testsprite.generate_tests(
            state["generated_files"],
            state["user_prompt"]
        )
        state["test_script"] = test_code
        self.vfs.write_file("tests/app.test.js", test_code)
        state["status"] = "Tests generated"
        return state
    
    def generate_app(self, user_prompt: str) -> dict:
        """Main entry point to generate an app."""
        initial_state: CodeGenState = {
            "user_prompt": user_prompt,
            "file_plan": {},
            "generated_files": {},
            "test_script": "",
            "status": "Starting"
        }
        
        # Run the workflow
        final_state = self.workflow.invoke(initial_state)
        
        return {
            "files": final_state["generated_files"],
            "tests": final_state["test_script"],
            "plan": final_state["file_plan"],
            "status": final_state["status"]
        }
