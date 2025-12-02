import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

class TestSpriteAgent:
    """Agent responsible for generating test scripts."""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
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
