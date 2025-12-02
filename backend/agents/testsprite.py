import os
from typing import Optional
from langchain_core.messages import HumanMessage, SystemMessage
from api_config import api_config

class TestSpriteAgent:
    """Agent responsible for generating test scripts."""
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        """
        Initialize TestSprite Agent.
        
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
            temperature=0.2
        )
    
    def generate_tests(self, files: dict, user_prompt: str) -> str:
        """
        Generate Playwright test script for the application.
        """
        system_prompt = """You are a QA automation expert.
Generate a Playwright test script that validates the core functionality.
Return ONLY the test code. No markdown, no explanations."""

        file_list = "\n".join([f"- {name}: {files[name][:100]}..." for name in files.keys()])
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"""User's App: {user_prompt}
Files in the app:
{file_list}

Generate a basic Playwright test that:
1. Opens the app
2. Tests the main functionality
3. Verifies key elements exist""")
        ]
        
        response = self.llm.invoke(messages)
        
        # Clean the response
        code = response.content.strip()
        if code.startswith("```"):
            lines = code.split("\n")
            code = "\n".join(lines[1:-1])
        
        return code
