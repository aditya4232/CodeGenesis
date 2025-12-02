import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

class EngineerAgent:
    """Agent responsible for writing code for individual files."""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
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
