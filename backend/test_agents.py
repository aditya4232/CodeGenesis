"""
Unit tests for individual agents
"""
import pytest
import os
from unittest.mock import patch, MagicMock
from agents.architect import ArchitectAgent
from agents.engineer import EngineerAgent
from agents.testsprite import TestSpriteAgent

# Mock API config for all tests
@pytest.fixture(autouse=True)
def mock_api_config():
    with patch("agents.architect.api_config") as mock_config1, \
         patch("agents.engineer.api_config") as mock_config2, \
         patch("agents.testsprite.api_config") as mock_config3:
        
        mock_llm = MagicMock()
        mock_llm.invoke.return_value.content = "Mocked response"
        
        mock_config1.get_llm.return_value = mock_llm
        mock_config2.get_llm.return_value = mock_llm
        mock_config3.get_llm.return_value = mock_llm
        
        yield

class TestArchitectAgent:
    """Test the Architect Agent"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.agent = ArchitectAgent(user_api_key="test", user_provider="openai")
    
    def test_architect_initialization(self):
        """Test that architect agent initializes correctly"""
        assert self.agent is not None
        assert self.agent.llm is not None
    
    def test_plan_returns_structure(self):
        """Test that plan method returns correct structure"""
        # Mock the LLM response to return valid JSON for planning
        self.agent.llm.invoke.return_value.content = '{"tech_stack": "React", "files": {"index.html": "content"}}'
        
        result = self.agent.plan("Create a simple calculator")
        
        assert isinstance(result, dict)
        assert "tech_stack" in result
        assert "files" in result

class TestEngineerAgent:
    """Test the Engineer Agent"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.agent = EngineerAgent(user_api_key="test", user_provider="openai")
    
    def test_engineer_initialization(self):
        """Test that engineer agent initializes correctly"""
        assert self.agent is not None
        assert self.agent.llm is not None
    
    def test_write_file_returns_code(self):
        """Test that write_file returns code"""
        self.agent.llm.invoke.return_value.content = "<html>Hello</html>"
        
        code = self.agent.write_file(
            filename="index.html",
            description="Main HTML file",
            user_prompt="Create a simple webpage",
            tech_stack="HTML/CSS"
        )
        
        assert isinstance(code, str)
        assert len(code) > 0

class TestTestSpriteAgent:
    """Test the TestSprite Agent"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.agent = TestSpriteAgent(user_api_key="test", user_provider="openai")
    
    def test_testsprite_initialization(self):
        """Test that testsprite agent initializes correctly"""
        assert self.agent is not None
        assert self.agent.llm is not None
    
    def test_generate_tests_returns_code(self):
        """Test that generate_tests returns test code"""
        self.agent.llm.invoke.return_value.content = "test code"
        
        files = {
            "index.html": "<html><body>Hello</body></html>",
            "script.js": "console.log('test');"
        }
        
        tests = self.agent.generate_tests(files, "Simple webpage")
        
        assert isinstance(tests, str)
        assert len(tests) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
