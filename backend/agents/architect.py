import os
from typing import TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

class ArchitectState(TypedDict):
    """State for the Architect Agent."""
    user_prompt: str
    file_structure: dict
    tech_stack: str

class ArchitectAgent:
    """Agent responsible for planning the application structure."""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
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
