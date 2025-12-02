"""
Test suite for CodeGenesis backend API
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

client = TestClient(app)

# Mock API config to avoid actual API calls and validation errors
@pytest.fixture(autouse=True)
def mock_api_config():
    with patch("main.api_config") as mock_config:
        # Mock get_llm to return a mock LLM
        mock_llm = MagicMock()
        mock_llm.invoke.return_value.content = "Mocked response"
        mock_config.get_llm.return_value = mock_llm
        
        # Mock validate_user_api_key
        mock_config.validate_user_api_key.return_value = True
        yield mock_config

class TestHealthEndpoints:
    """Test health check and status endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns correct message"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "CodeGenesis Architect Engine is Online"}
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "agents" in data

class TestGenerateEndpoint:
    """Test code generation endpoint"""
    
    def test_generate_requires_auth(self):
        """Test that generate endpoint requires API key"""
        response = client.post(
            "/api/generate",
            json={"prompt": "Create a simple app"}
        )
        # Should fail or return error because no API key provided
        # Based on our implementation, it returns a 200 with error status in body
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
        assert data["error"] == "API_KEY_REQUIRED"
    
    def test_generate_with_auth(self):
        """Test code generation with API key"""
        with patch("orchestrator.CodeGenesisOrchestrator.generate_app") as mock_generate:
            mock_generate.return_value = {
                "files": {"index.html": "<html></html>"},
                "tests": "test code",
                "plan": {},
                "status": "Completed"
            }
            
            response = client.post(
                "/api/generate",
                json={
                    "prompt": "Create a simple app",
                    "user_api_key": "test-key",
                    "user_provider": "openai"
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert "files" in data
            assert data["status"] == "Completed"

class TestChatEndpoint:
    """Test chatbot endpoint"""
    
    def test_chat_works(self):
        """Test chat endpoint"""
        response = client.post(
            "/api/chat",
            json={"message": "Hello"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
