from typing import TypedDict, Optional, Literal
from langgraph.graph import StateGraph, END
from agents.architect import ArchitectAgent
from agents.engineer import EngineerAgent
from agents.testsprite import TestSpriteAgent
from agents.debugger import DebuggerAgent
from agents.refactorer import RefactorerAgent, DocumenterAgent
from vfs import VirtualFileSystem


class CodeGenState(TypedDict):
    """Enhanced state for the CodeGenesis workflow."""
    user_prompt: str
    file_plan: dict
    generated_files: dict
    test_script: str
    status: str
    # New fields for enhanced workflow
    errors: list
    debug_results: list
    refactor_results: dict
    quality_score: float
    iteration: int


class CodeGenesisOrchestrator:
    """
    Enhanced LangGraph-based orchestrator for the coding workflow.
    
    Features:
    - Multi-agent code generation pipeline
    - Automatic error detection and fixing
    - Code quality analysis and refactoring
    - Self-healing with iteration limits
    """
    
    MAX_DEBUG_ITERATIONS = 3
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        """
        Initialize orchestrator with user API credentials.
        
        Args:
            user_api_key: User's own API key (REQUIRED for project generation)
            user_provider: User's API provider (REQUIRED)
            user_base_url: Custom base URL (optional)
        """
        self.user_api_key = user_api_key
        self.user_provider = user_provider
        self.user_base_url = user_base_url
        
        # Initialize agents
        self.architect = ArchitectAgent(user_api_key, user_provider, user_base_url)
        self.engineer = EngineerAgent(user_api_key, user_provider, user_base_url)
        self.testsprite = TestSpriteAgent(user_api_key, user_provider, user_base_url)
        self.debugger = DebuggerAgent(user_api_key, user_provider, user_base_url)
        self.refactorer = RefactorerAgent(user_api_key, user_provider, user_base_url)
        self.documenter = DocumenterAgent(user_api_key, user_provider, user_base_url)
        self.vfs = VirtualFileSystem()
        
        # Build the enhanced graph
        self.workflow = self._build_graph()
    
    def _build_graph(self):
        """Build the enhanced LangGraph workflow with debugging and refactoring."""
        workflow = StateGraph(CodeGenState)
        
        # Add nodes
        workflow.add_node("architect", self._architect_node)
        workflow.add_node("engineer", self._engineer_node)
        workflow.add_node("debugger", self._debugger_node)
        workflow.add_node("refactorer", self._refactorer_node)
        workflow.add_node("testsprite", self._testsprite_node)
        
        # Define edges with conditional routing
        workflow.set_entry_point("architect")
        workflow.add_edge("architect", "engineer")
        workflow.add_edge("engineer", "debugger")
        workflow.add_conditional_edges(
            "debugger",
            self._should_continue_debugging,
            {
                "continue": "engineer",  # Go back to fix issues
                "proceed": "refactorer"  # No more issues, proceed
            }
        )
        workflow.add_edge("refactorer", "testsprite")
        workflow.add_edge("testsprite", END)
        
        return workflow.compile()
    
    def _should_continue_debugging(self, state: CodeGenState) -> Literal["continue", "proceed"]:
        """Decide whether to continue debugging or proceed to refactoring."""
        errors = state.get("errors", [])
        iteration = state.get("iteration", 0)
        
        # Stop if no errors or max iterations reached
        if not errors or iteration >= self.MAX_DEBUG_ITERATIONS:
            return "proceed"
        
        # Check if we have critical errors that need fixing
        critical_errors = [e for e in errors if "error" in e.lower() or "failed" in e.lower()]
        
        if critical_errors and iteration < self.MAX_DEBUG_ITERATIONS:
            return "continue"
        
        return "proceed"
    
    def _architect_node(self, state: CodeGenState) -> CodeGenState:
        """Architect planning node."""
        plan = self.architect.plan(state["user_prompt"])
        state["file_plan"] = plan
        state["status"] = "Planning complete"
        state["iteration"] = 0
        state["errors"] = []
        return state
    
    def _engineer_node(self, state: CodeGenState) -> CodeGenState:
        """Engineer coding node."""
        plan = state["file_plan"]
        files = state.get("generated_files", {})
        debug_results = state.get("debug_results", [])
        
        # If we have debug results, apply fixes
        if debug_results:
            for result in debug_results:
                if hasattr(result, 'diff') and result.diff:
                    # Apply the suggested fix
                    for affected_file in result.affected_files:
                        if affected_file in files:
                            # Simple replacement - production would use proper diff application
                            if result.diff:
                                files[affected_file] = result.diff
        else:
            # Fresh generation
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
        state["debug_results"] = []  # Clear for next iteration
        return state
    
    def _debugger_node(self, state: CodeGenState) -> CodeGenState:
        """Debugger analysis node - checks for potential issues."""
        files = state.get("generated_files", {})
        errors = []
        debug_results = []
        
        # Basic static analysis for common issues
        for filename, content in files.items():
            file_errors = self._static_analysis(filename, content)
            errors.extend(file_errors)
        
        # If we found potential issues, get debug suggestions
        if errors:
            for error in errors[:3]:  # Limit to 3 errors per iteration
                result = self.debugger.diagnose(error, files)
                debug_results.append(result)
        
        state["errors"] = errors
        state["debug_results"] = debug_results
        state["iteration"] = state.get("iteration", 0) + 1
        state["status"] = f"Debug iteration {state['iteration']} complete"
        
        return state
    
    def _static_analysis(self, filename: str, content: str) -> list:
        """Perform basic static analysis on generated code."""
        errors = []
        
        # Check for common issues
        if filename.endswith(('.tsx', '.jsx', '.ts', '.js')):
            # Check for missing imports (basic check)
            if 'useState' in content and "import" not in content:
                errors.append(f"{filename}: React hook 'useState' used but React may not be imported")
            if 'useEffect' in content and "import" not in content:
                errors.append(f"{filename}: React hook 'useEffect' used but React may not be imported")
            
            # Check for obvious syntax issues
            if content.count('{') != content.count('}'):
                errors.append(f"{filename}: Mismatched curly braces")
            if content.count('(') != content.count(')'):
                errors.append(f"{filename}: Mismatched parentheses")
        
        elif filename.endswith('.py'):
            # Python checks
            if 'print(' in content and 'logging' not in content:
                # Not an error, just a note
                pass
        
        return errors
    
    def _refactorer_node(self, state: CodeGenState) -> CodeGenState:
        """Refactorer optimization node."""
        files = state.get("generated_files", {})
        
        try:
            # Analyze code quality
            result = self.refactorer.analyze(files, ['readability', 'best_practice'])
            
            state["refactor_results"] = {
                "suggestions": [
                    {
                        "category": s.category,
                        "file": s.file,
                        "description": s.description,
                        "priority": s.priority
                    }
                    for s in result.suggestions
                ],
                "quality_score": result.overall_quality_score,
                "summary": result.summary
            }
            state["quality_score"] = result.overall_quality_score
            
        except Exception as e:
            state["refactor_results"] = {"error": str(e)}
            state["quality_score"] = 5.0
        
        state["status"] = "Refactoring analysis complete"
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
            "status": "Starting",
            "errors": [],
            "debug_results": [],
            "refactor_results": {},
            "quality_score": 0.0,
            "iteration": 0
        }
        
        # Run the workflow
        final_state = self.workflow.invoke(initial_state)
        
        return {
            "files": final_state["generated_files"],
            "tests": final_state["test_script"],
            "plan": final_state["file_plan"],
            "status": final_state["status"],
            "quality": {
                "score": final_state.get("quality_score", 0),
                "refactor_suggestions": final_state.get("refactor_results", {})
            },
            "debug_iterations": final_state.get("iteration", 0)
        }
    
    def generate_with_documentation(self, user_prompt: str) -> dict:
        """Generate app with automatic documentation."""
        result = self.generate_app(user_prompt)
        
        # Generate README
        readme = self.documenter.generate_readme(
            result["files"],
            user_prompt
        )
        result["files"]["README.md"] = readme
        
        return result

