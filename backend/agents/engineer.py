import os
from typing import Optional
from langchain_core.messages import HumanMessage, SystemMessage
from api_config import api_config

class EngineerAgent:
    """Agent responsible for writing code for individual files."""
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        """
        Initialize Engineer Agent.
        
        Args:
            user_api_key: User's own API key (REQUIRED)
            user_provider: User's API provider (REQUIRED)
            user_base_url: Custom base URL (optional)
        """
        self.user_api_key = user_api_key
        self.user_provider = user_provider
        self.user_base_url = user_base_url
        
        # Get LLM for user projects
        self.llm = api_config.get_llm(
            context="user_project",
            user_api_key=user_api_key,
            user_provider=user_provider,
            user_base_url=user_base_url,
            temperature=0.3
        )
    
    def write_file(self, filename: str, description: str, user_prompt: str, tech_stack: str) -> str:
        """
        Generate code for a specific file.
        """
        system_prompt = f"""You are an expert software engineer.
Generate ONLY the code for the file '{filename}'.
Tech Stack: {tech_stack}
File Purpose: {description}
User's App Idea: {user_prompt}

Return ONLY the raw code. No markdown, no explanations, no ```."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Write the complete code for {filename}")
        ]
        
        response = self.llm.invoke(messages)
        
        # Clean the response
        code = response.content.strip()
        
        # Remove markdown code blocks if present
        if code.startswith("```"):
            lines = code.split("\n")
            # Remove first and last lines (```)
            code = "\n".join(lines[1:-1])
        
        return code
