import os
from typing import TypedDict, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from api_config import api_config

class ArchitectState(TypedDict):
    """State for the Architect Agent."""
    user_prompt: str
    file_structure: dict
    tech_stack: str

class ArchitectAgent:
    """Agent responsible for planning the application structure."""
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        """
        Initialize Architect Agent.
        
        Args:
            user_api_key: User's own API key (REQUIRED)
            user_provider: User's API provider (REQUIRED)
            user_base_url: Custom base URL (optional)
        """
        self.user_api_key = user_api_key
        self.user_provider = user_provider
        self.user_base_url = user_base_url
        
        # Get LLM for user projects (requires user's API key)
        self.llm = api_config.get_llm(
            context="user_project",
            user_api_key=user_api_key,
            user_provider=user_provider,
            user_base_url=user_base_url,
            temperature=0.7
        )
    
    def plan(self, user_prompt: str) -> dict:
        """
        Generate a file structure plan based on user's prompt.
        Returns a JSON structure with files and their purposes.
        """
        system_prompt = """You are an expert software architect. 
Given a user's app description, create a minimal file structure plan.
Return ONLY a valid JSON object with this structure:
{
  "tech_stack": "React + Tailwind",
  "files": {
    "index.html": "Main HTML entry point",
    "App.tsx": "Root React component",
    "styles.css": "Global styles"
  }
}
Keep it simple and minimal. No markdown, no explanations."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User wants: {user_prompt}")
        ]
        
        response = self.llm.invoke(messages)
        
        # Parse the JSON response
        import json
        try:
            # Clean the response (remove markdown if present)
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            plan = json.loads(content.strip())
            return plan
        except Exception as e:
            # Fallback structure
            return {
                "tech_stack": "HTML + CSS + JS",
                "files": {
                    "index.html": "Main HTML file",
                    "style.css": "Styling",
                    "script.js": "JavaScript logic"
                }
            }
