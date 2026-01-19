"""
Debugger Agent for CodeGenesis
Analyzes code errors and suggests fixes
"""
import os
import re
import json
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
from langchain_core.messages import HumanMessage, SystemMessage
from api_config import api_config


@dataclass
class DebugResult:
    """Result of debugging analysis"""
    error_type: str  # 'syntax', 'runtime', 'logic', 'type'
    root_cause: str
    suggested_fix: str
    affected_files: List[str]
    confidence: float  # 0-1
    diff: Optional[str] = None


class DebuggerAgent:
    """
    Agent responsible for analyzing code errors and suggesting fixes.
    
    Capabilities:
    - Parse error messages and stack traces
    - Identify root cause of errors
    - Generate fix suggestions with diffs
    - Handle common patterns (import errors, type errors, null refs)
    """
    
    def __init__(self, user_api_key: Optional[str] = None, user_provider: Optional[str] = None, user_base_url: Optional[str] = None):
        """
        Initialize Debugger Agent.
        
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
            temperature=0.3  # Lower temperature for precise debugging
        )
    
    def _classify_error(self, error: str) -> str:
        """Classify the error type based on the error message"""
        error_lower = error.lower()
        
        if any(kw in error_lower for kw in ['syntaxerror', 'unexpected token', 'parsing error']):
            return 'syntax'
        elif any(kw in error_lower for kw in ['typeerror', 'is not a function', 'undefined is not']):
            return 'type'
        elif any(kw in error_lower for kw in ['referenceerror', 'is not defined', 'cannot find']):
            return 'reference'
        elif any(kw in error_lower for kw in ['cannot read', 'null', 'undefined']):
            return 'null_reference'
        elif any(kw in error_lower for kw in ['import', 'module', 'require']):
            return 'import'
        elif any(kw in error_lower for kw in ['network', 'fetch', 'cors', 'api']):
            return 'network'
        else:
            return 'runtime'
    
    def _extract_affected_files(self, error: str, files: Dict[str, str]) -> List[str]:
        """Extract which files are likely affected based on error and stack trace"""
        affected = []
        
        # Look for file references in the error
        file_patterns = [
            r'at\s+(.+\.(?:tsx?|jsx?|py|css))',
            r'in\s+(.+\.(?:tsx?|jsx?|py|css))',
            r'File\s+"([^"]+)"',
            r'(\w+\.(?:tsx?|jsx?|py|css)):\d+',
        ]
        
        for pattern in file_patterns:
            matches = re.findall(pattern, error)
            affected.extend(matches)
        
        # Also check which provided files might contain relevant code
        for filename in files.keys():
            basename = os.path.basename(filename)
            if basename in error or filename in error:
                if filename not in affected:
                    affected.append(filename)
        
        return list(set(affected))[:5]  # Limit to 5 files
    
    def diagnose(self, error: str, files: Dict[str, str]) -> DebugResult:
        """
        Diagnose an error and suggest a fix.
        
        Args:
            error: Error message or stack trace
            files: Dict mapping filenames to their content
            
        Returns:
            DebugResult with analysis and fix suggestion
        """
        error_type = self._classify_error(error)
        affected_files = self._extract_affected_files(error, files)
        
        # Build context for LLM
        files_context = []
        for filename in affected_files:
            if filename in files:
                content = files[filename]
                # Limit file content to avoid token limits
                if len(content) > 2000:
                    content = content[:2000] + "\n... (truncated)"
                files_context.append(f"### {filename}\n```\n{content}\n```")
        
        if not files_context:
            # Include some files anyway
            for filename, content in list(files.items())[:3]:
                if len(content) > 1500:
                    content = content[:1500] + "\n... (truncated)"
                files_context.append(f"### {filename}\n```\n{content}\n```")
        
        system_prompt = """You are an expert debugging assistant. Analyze the error and code to identify the root cause and suggest a fix.

Return your analysis as a valid JSON object with this EXACT structure:
{
    "error_type": "syntax|runtime|type|reference|null_reference|import|network|logic",
    "root_cause": "Clear explanation of what's causing the error",
    "suggested_fix": "Detailed description of how to fix it",
    "diff": "Code changes needed (show before/after or the fixed code)",
    "confidence": 0.8
}

Rules:
1. Be specific about what line/code is causing the issue
2. Provide actionable fix suggestions
3. If you're not sure about the fix, set confidence lower
4. The diff should show the actual code changes needed
5. Return ONLY the JSON, no additional text"""

        user_prompt = f"""## Error:
```
{error}
```

## Error Type: {error_type}

## Affected Files:
{chr(10).join(files_context) if files_context else "No specific files identified"}

Analyze this error and provide a fix."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        try:
            response = self.llm.invoke(messages)
            content = response.content.strip()
            
            # Clean up the response (remove markdown if present)
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            result = json.loads(content.strip())
            
            return DebugResult(
                error_type=result.get("error_type", error_type),
                root_cause=result.get("root_cause", "Could not determine root cause"),
                suggested_fix=result.get("suggested_fix", "No fix suggested"),
                affected_files=affected_files,
                confidence=result.get("confidence", 0.5),
                diff=result.get("diff", None)
            )
            
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return DebugResult(
                error_type=error_type,
                root_cause=f"Error analysis failed to parse. Raw response available.",
                suggested_fix="Please review the error manually.",
                affected_files=affected_files,
                confidence=0.3,
                diff=None
            )
        except Exception as e:
            return DebugResult(
                error_type=error_type,
                root_cause=f"Debugging failed: {str(e)}",
                suggested_fix="Please check your API configuration.",
                affected_files=affected_files,
                confidence=0.0
            )
    
    def quick_fix(self, error: str, code: str, filename: str) -> Optional[str]:
        """
        Attempt a quick fix for common error patterns.
        
        Returns fixed code if a quick fix is available, None otherwise.
        """
        error_lower = error.lower()
        
        # Quick fix for missing imports
        if 'is not defined' in error_lower:
            # Extract the undefined identifier
            match = re.search(r"'?(\w+)'?\s+is not defined", error, re.IGNORECASE)
            if match:
                identifier = match.group(1)
                
                # Common React imports
                react_imports = {
                    'useState': "import { useState } from 'react';",
                    'useEffect': "import { useEffect } from 'react';",
                    'useContext': "import { useContext } from 'react';",
                    'useRef': "import { useRef } from 'react';",
                    'useMemo': "import { useMemo } from 'react';",
                    'useCallback': "import { useCallback } from 'react';",
                    'React': "import React from 'react';",
                }
                
                if identifier in react_imports:
                    import_statement = react_imports[identifier]
                    if import_statement not in code:
                        # Add import at the top
                        lines = code.split('\n')
                        # Find where to insert (after existing imports)
                        insert_idx = 0
                        for i, line in enumerate(lines):
                            if line.startswith('import '):
                                insert_idx = i + 1
                        
                        lines.insert(insert_idx, import_statement)
                        return '\n'.join(lines)
        
        # Quick fix for missing semicolons (in some linting errors)
        if 'missing semicolon' in error_lower:
            # This is a simplistic fix
            if not code.strip().endswith(';'):
                return code.strip() + ';'
        
        return None
    
    def analyze_multiple_errors(self, errors: List[str], files: Dict[str, str]) -> List[DebugResult]:
        """
        Analyze multiple errors and return prioritized fixes.
        """
        results = []
        for error in errors[:5]:  # Limit to 5 errors
            result = self.diagnose(error, files)
            results.append(result)
        
        # Sort by confidence and error type priority
        error_priority = {
            'syntax': 1,
            'import': 2,
            'reference': 3,
            'type': 4,
            'null_reference': 5,
            'runtime': 6,
            'network': 7,
            'logic': 8
        }
        
        results.sort(key=lambda r: (error_priority.get(r.error_type, 9), -r.confidence))
        return results
