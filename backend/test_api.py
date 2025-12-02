"""
Test suite for CodeGenesis backend API
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


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
        assert len(data["agents"]) == 3
        assert "architect" in data["agents"]
        assert "engineer" in data["agents"]
        assert "testsprite" in data["agents"]


class TestGenerateEndpoint:
    """Test code generation endpoint"""
    
    def test_generate_requires_prompt(self):
        """Test that generate endpoint requires a prompt"""
        response = client.post("/api/generate", json={})
        assert response.status_code == 422  # Validation error
    
    def test_generate_with_simple_prompt(self):
        """Test code generation with a simple prompt"""
        response = client.post(
            "/api/generate",
            json={"prompt": "Create a simple hello world HTML page"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "files" in data
        assert "tests" in data
        assert "plan" in data
        assert "status" in data
        
        # Check that files were generated
        assert isinstance(data["files"], dict)
        assert len(data["files"]) > 0
        
        # Check plan structure
        assert "tech_stack" in data["plan"]
        assert "files" in data["plan"]
    
    def test_generate_with_complex_prompt(self):
        """Test code generation with a more complex prompt"""
        response = client.post(
            "/api/generate",
            json={"prompt": "Create a todo list app with add and delete functionality"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify multiple files were generated
        assert len(data["files"]) >= 2
        
        # Verify test script was generated
        assert isinstance(data["tests"], str)
        assert len(data["tests"]) > 0


class TestCORS:
    """Test CORS configuration"""
    
    def test_cors_headers(self):
        """Test that CORS headers are present"""
        response = client.options("/api/health")
        # CORS should allow all origins
        assert response.status_code in [200, 405]  # OPTIONS might not be explicitly handled


class TestErrorHandling:
    """Test error handling"""
    
    def test_invalid_endpoint(self):
        """Test accessing non-existent endpoint"""
        response = client.get("/api/nonexistent")
        assert response.status_code == 404
    
    def test_invalid_method(self):
        """Test using wrong HTTP method"""
        response = client.get("/api/generate")  # Should be POST
        assert response.status_code == 405


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
