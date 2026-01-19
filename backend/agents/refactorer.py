"""
Refactorer Agent for CodeGenesis
Improves code quality, structure, and performance
"""
import os
import json
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
from langchain_core.messages import HumanMessage, SystemMessage
from api_config import api_config


@dataclass
class RefactorSuggestion:
    """A single refactoring suggestion"""
    category: str  # 'performance', 'readability', 'security', 'best_practice', 'style'
    file: str
    description: str
    before: str
    after: str
    priority: str  # 'high', 'medium', 'low'


@dataclass
class RefactorResult:
    """Result of refactoring analysis"""
    suggestions: List[RefactorSuggestion]
    overall_quality_score: float  # 0-10
    summary: str
    refactored_files: Dict[str, str]  # Optionally, fully refactored versions


class RefactorerAgent:
    """
    Agent responsible for improving code quality and structure.
    
    Capabilities:
    - Identify code smells and anti-patterns
    - Suggest performance improvements
    - Improve readability and maintainability
    - Apply best practices for the tech stack
    - Security vulnerability detection
    """
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        """
        Initialize Refactorer Agent.
        
        Args:
            user_api_key: User's own API key
            user_provider: User's API provider
            user_base_url: Custom base URL (optional)
        """
        self.user_api_key = user_api_key
        self.user_provider = user_provider
        self.user_base_url = user_base_url
        
        self.llm = api_config.get_llm(
            context="user_project",
            user_api_key=user_api_key,
            user_provider=user_provider,
            user_base_url=user_base_url,
            temperature=0.4
        )
    
    def analyze(self, files: Dict[str, str], focus_areas: Optional[List[str]] = None) -> RefactorResult:
        """
        Analyze code and suggest refactoring improvements.
        
        Args:
            files: Dict mapping filenames to their content
            focus_areas: Optional list of areas to focus on: 
                        ['performance', 'readability', 'security', 'best_practice']
        
        Returns:
            RefactorResult with suggestions and overall quality score
        """
        focus = focus_areas or ['performance', 'readability', 'best_practice']
        
        # Build context for LLM
        files_context = []
        for filename, content in list(files.items())[:5]:  # Limit files
            if len(content) > 2000:
                content = content[:2000] + "\n... (truncated)"
            files_context.append(f"### {filename}\n```\n{content}\n```")
        
        focus_str = ", ".join(focus)
        
        system_prompt = f"""You are an expert code reviewer focusing on: {focus_str}.

Analyze the provided code and return suggestions as a valid JSON object:
{{
    "overall_quality_score": 7.5,
    "summary": "Brief overall assessment",
    "suggestions": [
        {{
            "category": "performance|readability|security|best_practice|style",
            "file": "filename.tsx",
            "description": "What should be improved and why",
            "before": "problematic code snippet",
            "after": "improved code snippet",
            "priority": "high|medium|low"
        }}
    ]
}}

Rules:
1. Provide actionable, specific suggestions
2. Include actual code in before/after
3. Limit to 5 most impactful suggestions
4. Be constructive, not overly critical
5. Return ONLY valid JSON"""

        user_prompt = f"""## Files to Analyze:

{chr(10).join(files_context)}

Focus areas: {focus_str}

Analyze and provide improvement suggestions."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        try:
            response = self.llm.invoke(messages)
            content = response.content.strip()
            
            # Clean up the response
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            result = json.loads(content.strip())
            
            suggestions = []
            for s in result.get("suggestions", []):
                suggestions.append(RefactorSuggestion(
                    category=s.get("category", "best_practice"),
                    file=s.get("file", "unknown"),
                    description=s.get("description", ""),
                    before=s.get("before", ""),
                    after=s.get("after", ""),
                    priority=s.get("priority", "medium")
                ))
            
            return RefactorResult(
                suggestions=suggestions,
                overall_quality_score=result.get("overall_quality_score", 5.0),
                summary=result.get("summary", "Analysis complete"),
                refactored_files={}
            )
            
        except json.JSONDecodeError:
            return RefactorResult(
                suggestions=[],
                overall_quality_score=5.0,
                summary="Analysis failed to parse. Raw response available.",
                refactored_files={}
            )
        except Exception as e:
            return RefactorResult(
                suggestions=[],
                overall_quality_score=0.0,
                summary=f"Analysis failed: {str(e)}",
                refactored_files={}
            )
    
    def optimize(self, files: Dict[str, str]) -> Dict[str, str]:
        """
        Apply automatic optimizations to the code.
        
        Returns:
            Dict with optimized file contents
        """
        # Analyze first
        result = self.analyze(files, ['performance', 'best_practice'])
        
        # For now, return original files with a note
        # Full implementation would apply the suggestions
        optimized = {}
        
        for filename, content in files.items():
            # Add optimization comments based on suggestions
            relevant_suggestions = [s for s in result.suggestions if s.file == filename]
            
            if relevant_suggestions:
                comment_lines = [
                    "// CodeGenesis Optimization Notes:",
                    *[f"// - [{s.priority.upper()}] {s.description}" for s in relevant_suggestions[:3]],
                    ""
                ]
                optimized[filename] = "\n".join(comment_lines) + content
            else:
                optimized[filename] = content
        
        return optimized
    
    def apply_refactoring(self, file_content: str, suggestion: RefactorSuggestion) -> str:
        """
        Apply a single refactoring suggestion to file content.
        
        Args:
            file_content: Original file content
            suggestion: The refactoring to apply
            
        Returns:
            Modified file content
        """
        if suggestion.before and suggestion.after:
            # Simple replacement
            if suggestion.before in file_content:
                return file_content.replace(suggestion.before, suggestion.after, 1)
        
        return file_content
    
    def get_quick_improvements(self, code: str, language: str = "typescript") -> List[str]:
        """
        Get quick improvement suggestions without full refactoring.
        
        Returns list of improvement hints.
        """
        hints = []
        
        # Check for common issues
        if language in ["typescript", "javascript"]:
            if "var " in code:
                hints.append("Consider using 'const' or 'let' instead of 'var'")
            if "== " in code and "===" not in code:
                hints.append("Use strict equality (===) instead of loose equality (==)")
            if "console.log" in code:
                hints.append("Remove console.log statements in production code")
            if "any" in code and "typescript" in language.lower():
                hints.append("Avoid using 'any' type - be specific with types")
            if "(e)" in code and "catch" in code:
                hints.append("Handle or log caught errors properly")
        
        elif language == "python":
            if "except:" in code and "Exception" not in code:
                hints.append("Be specific with exception types instead of bare except")
            if "global " in code:
                hints.append("Avoid using global variables")
            if "import *" in code:
                hints.append("Avoid wildcard imports (import *)")
        
        return hints


class DocumenterAgent:
    """
    Agent responsible for generating documentation.
    """
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        self.user_api_key = user_api_key
        self.user_provider = user_provider
        
        self.llm = api_config.get_llm(
            context="user_project",
            user_api_key=user_api_key,
            user_provider=user_provider,
            user_base_url=user_base_url,
            temperature=0.5
        )
    
    def generate_readme(self, files: Dict[str, str], project_description: str) -> str:
        """
        Generate a README.md for the project.
        """
        file_list = "\n".join([f"- {f}" for f in files.keys()])
        
        system_prompt = """Generate a professional README.md file.
Include: Title, Description, Features, Installation, Usage, and License.
Use proper markdown formatting. Be concise but informative."""

        user_prompt = f"""Project Description: {project_description}

Files:
{file_list}

Generate a README.md for this project."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"# Project\n\n{project_description}\n\n## Files\n\n{file_list}"
    
    def add_comments(self, code: str, language: str = "typescript") -> str:
        """
        Add documentation comments to code.
        """
        system_prompt = f"""Add JSDoc/docstring comments to the following {language} code.
Add comments explaining:
- Function purposes and parameters
- Complex logic sections
- Important variables/constants
Keep the original code structure, only add comments."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=code)
        ]
        
        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception:
            return code
