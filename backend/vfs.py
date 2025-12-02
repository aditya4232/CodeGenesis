from typing import Dict, Optional

class VirtualFileSystem:
    """In-memory file system for storing generated code."""
    
    def __init__(self):
        self.files: Dict[str, str] = {}
    
    def write_file(self, path: str, content: str) -> None:
        """Write content to a file path."""
        self.files[path] = content
    
    def read_file(self, path: str) -> Optional[str]:
        """Read content from a file path."""
        return self.files.get(path)
    
    def list_files(self) -> list[str]:
        """List all file paths."""
        return list(self.files.keys())
    
    def delete_file(self, path: str) -> bool:
        """Delete a file."""
        if path in self.files:
            del self.files[path]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all files."""
        self.files.clear()
    
    def get_all_files(self) -> Dict[str, str]:
        """Get all files as a dictionary."""
        return self.files.copy()
