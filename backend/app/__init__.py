"""
MemoRAG ULTRA - Version 0.3 Beta
Production-grade AI Knowledge Engine
"""

__version__ = "0.3.0-beta"
__author__ = "MemoRAG ULTRA Team"
__license__ = "MIT"

# Version history
VERSION_HISTORY = {
    "0.3.0-beta": {
        "date": "2025-12-02",
        "features": [
            "Complete backend with hybrid RAG engine",
            "Continual learning with importance scoring",
            "Memory consolidation and conflict detection",
            "React frontend with 4 pages",
            "12 REST API endpoints",
            "Knowledge graph with entity extraction",
            "Multi-format document processing",
            "System monitoring and metrics"
        ],
        "stats": {
            "files": "60+",
            "lines_of_code": "8000+",
            "api_endpoints": 12,
            "features": "130+",
            "phases_complete": "5/19"
        }
    },
    "0.2.0-alpha": {
        "date": "2025-12-01",
        "features": [
            "Basic RAG implementation",
            "Document ingestion",
            "Vector search"
        ]
    },
    "0.1.0-alpha": {
        "date": "2025-11-30",
        "features": [
            "Project initialization",
            "Basic structure"
        ]
    }
}

def get_version():
    """Get current version"""
    return __version__

def get_version_info():
    """Get detailed version information"""
    return VERSION_HISTORY.get(__version__, {})
