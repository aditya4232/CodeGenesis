"""
Context Manager for CodeGenesis
Manages conversation memory, project context, and RAG-based retrieval
"""
import os
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import json
import hashlib
from dotenv import load_dotenv

load_dotenv()


@dataclass
class ConversationMessage:
    """A single message in a conversation"""
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: datetime
    project_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class InMemoryContextStore:
    """
    In-memory context store for development.
    Production should use Supabase with pgvector.
    """
    
    def __init__(self, max_conversations: int = 100):
        self.conversations: Dict[str, List[ConversationMessage]] = {}
        self.file_contexts: Dict[str, Dict[str, str]] = {}
        self.max_conversations = max_conversations
    
    def add_message(self, project_id: str, role: str, content: str, metadata: Optional[Dict] = None):
        """Add a message to the conversation history"""
        if project_id not in self.conversations:
            self.conversations[project_id] = []
        
        message = ConversationMessage(
            role=role,
            content=content,
            timestamp=datetime.now(),
            project_id=project_id,
            metadata=metadata
        )
        
        self.conversations[project_id].append(message)
        
        # Limit conversation history to prevent memory issues
        if len(self.conversations[project_id]) > 50:
            self.conversations[project_id] = self.conversations[project_id][-50:]
    
    def get_conversation(self, project_id: str, limit: int = 10) -> List[ConversationMessage]:
        """Get recent conversation messages"""
        if project_id not in self.conversations:
            return []
        return self.conversations[project_id][-limit:]
    
    def set_file_context(self, project_id: str, files: Dict[str, str]):
        """Store current file context for a project"""
        self.file_contexts[project_id] = files
    
    def get_file_context(self, project_id: str) -> Dict[str, str]:
        """Get stored file context for a project"""
        return self.file_contexts.get(project_id, {})
    
    def clear_project(self, project_id: str):
        """Clear all context for a project"""
        if project_id in self.conversations:
            del self.conversations[project_id]
        if project_id in self.file_contexts:
            del self.file_contexts[project_id]


class ContextManager:
    """
    Manages multi-turn conversations with project context.
    
    Features:
    - Conversation memory with sliding window
    - File context tracking
    - Relevant code reference extraction
    - Summary generation for long conversations
    """
    
    def __init__(self, store: Optional[InMemoryContextStore] = None):
        """
        Initialize the context manager.
        
        Args:
            store: Context storage backend (default: in-memory)
        """
        self.store = store or InMemoryContextStore()
    
    def add_conversation(self, project_id: str, role: str, content: str, metadata: Optional[Dict] = None):
        """
        Store a conversation message.
        
        Args:
            project_id: Project identifier
            role: 'user', 'assistant', or 'system'
            content: Message content
            metadata: Optional metadata (e.g., file references, code blocks)
        """
        self.store.add_message(project_id, role, content, metadata)
    
    def get_conversation_context(self, project_id: str, limit: int = 10) -> str:
        """
        Get formatted conversation context for AI prompts.
        
        Args:
            project_id: Project identifier
            limit: Maximum messages to include
            
        Returns:
            Formatted conversation history string
        """
        messages = self.store.get_conversation(project_id, limit)
        
        if not messages:
            return ""
        
        formatted = ["## Previous Conversation:"]
        for msg in messages:
            role_name = "User" if msg.role == "user" else "Assistant"
            formatted.append(f"**{role_name}**: {msg.content[:500]}{'...' if len(msg.content) > 500 else ''}")
        
        return "\n".join(formatted)
    
    def get_file_context(self, project_id: str) -> str:
        """
        Get formatted file context for AI prompts.
        
        Returns file structure and content summaries.
        """
        files = self.store.get_file_context(project_id)
        
        if not files:
            return ""
        
        formatted = ["## Current Project Files:"]
        for filename, content in files.items():
            # Show first few lines of each file
            preview = content[:300] + "..." if len(content) > 300 else content
            lines = preview.split('\n')[:10]
            formatted.append(f"\n### {filename}")
            formatted.append("```")
            formatted.extend(lines)
            formatted.append("```")
        
        return "\n".join(formatted)
    
    def update_project_files(self, project_id: str, files: Dict[str, str]):
        """Update the stored file context for a project"""
        self.store.set_file_context(project_id, files)
    
    def extract_code_references(self, message: str) -> List[str]:
        """
        Extract file and code references from a message.
        
        Returns list of referenced files/components.
        """
        references = []
        
        # Common file patterns
        import re
        file_pattern = r'`([^`]+\.(tsx?|jsx?|py|css|html|json))`'
        matches = re.findall(file_pattern, message, re.IGNORECASE)
        references.extend([m[0] for m in matches])
        
        # Component/function references
        component_pattern = r'\b([A-Z][a-zA-Z]+(?:Component|Page|Layout|Button|Form|Modal))\b'
        components = re.findall(component_pattern, message)
        references.extend(components)
        
        return list(set(references))
    
    def build_context_prompt(
        self, 
        project_id: str, 
        include_conversation: bool = True,
        include_files: bool = True,
        conversation_limit: int = 5
    ) -> str:
        """
        Build a comprehensive context prompt for AI.
        
        Args:
            project_id: Project identifier
            include_conversation: Include conversation history
            include_files: Include file context
            conversation_limit: Max conversation messages
            
        Returns:
            Formatted context string for system prompt
        """
        parts = []
        
        if include_files:
            file_ctx = self.get_file_context(project_id)
            if file_ctx:
                parts.append(file_ctx)
        
        if include_conversation:
            conv_ctx = self.get_conversation_context(project_id, conversation_limit)
            if conv_ctx:
                parts.append(conv_ctx)
        
        if not parts:
            return ""
        
        return "\n\n".join(parts)
    
    def get_relevant_files(self, project_id: str, query: str) -> Dict[str, str]:
        """
        Get files most relevant to a query.
        
        Simple keyword-based matching. For production, use vector similarity.
        """
        all_files = self.store.get_file_context(project_id)
        
        if not all_files:
            return {}
        
        # Extract keywords from query
        keywords = set(query.lower().split())
        keywords.discard('the')
        keywords.discard('and')
        keywords.discard('a')
        keywords.discard('to')
        keywords.discard('in')
        
        # Score files by keyword matches
        scored_files = []
        for filename, content in all_files.items():
            score = 0
            lower_content = content.lower()
            lower_filename = filename.lower()
            
            for keyword in keywords:
                if keyword in lower_filename:
                    score += 3  # Filename match is more important
                if keyword in lower_content:
                    score += 1
            
            if score > 0:
                scored_files.append((filename, content, score))
        
        # Return top 5 most relevant files
        scored_files.sort(key=lambda x: x[2], reverse=True)
        return {f[0]: f[1] for f in scored_files[:5]}
    
    def summarize_conversation(self, project_id: str) -> str:
        """
        Generate a summary of the conversation.
        Useful for very long conversations.
        """
        messages = self.store.get_conversation(project_id, limit=50)
        
        if len(messages) < 5:
            return ""
        
        # Simple summary: key topics mentioned
        all_content = " ".join([m.content for m in messages])
        
        # Extract key topics (simplified - production would use AI)
        topics = set()
        
        # Look for code-related terms
        code_terms = ['component', 'function', 'api', 'database', 'style', 'route', 'page', 'form', 'button']
        for term in code_terms:
            if term in all_content.lower():
                topics.add(term)
        
        if topics:
            return f"Conversation topics: {', '.join(topics)}"
        
        return ""
    
    def clear_project_context(self, project_id: str):
        """Clear all context for a project"""
        self.store.clear_project(project_id)


# Global context manager instance
context_manager = ContextManager()
