"""
Unit tests for individual agents
"""
import pytest
import os
from agents.architect import ArchitectAgent
from agents.engineer import EngineerAgent
from agents.testsprite import TestSpriteAgent


class TestArchitectAgent:
    """Test the Architect Agent"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.agent = ArchitectAgent()
    
    def test_architect_initialization(self):
        """Test that architect agent initializes correctly"""
        assert self.agent is not None
        assert self.agent.llm is not None
    
    def test_plan_returns_structure(self):
        """Test that plan method returns correct structure"""
        result = self.agent.plan("Create a simple calculator")
        
        assert isinstance(result, dict)
        assert "tech_stack" in result
        assert "files" in result
        assert isinstance(result["files"], dict)
    
    def test_plan_with_different_prompts(self):
        """Test planning with various prompts"""
        prompts = [
            "Create a todo list",
            "Build a weather app",
            "Make a simple blog"
        ]
        
        for prompt in prompts:
            result = self.agent.plan(prompt)
            assert "tech_stack" in result
            assert len(result["files"]) > 0


class TestEngineerAgent:
    """Test the Engineer Agent"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.agent = EngineerAgent()
    
    def test_engineer_initialization(self):
        """Test that engineer agent initializes correctly"""
        assert self.agent is not None
        assert self.agent.llm is not None
    
    def test_write_file_returns_code(self):
        """Test that write_file returns code"""
        code = self.agent.write_file(
            filename="index.html",
            description="Main HTML file",
            user_prompt="Create a simple webpage",
            tech_stack="HTML/CSS"
        )
        
        assert isinstance(code, str)
        assert len(code) > 0
    
    def test_write_different_file_types(self):
        """Test writing different file types"""
        files = [
            ("index.html", "HTML file", "HTML"),
            ("style.css", "CSS file", "CSS"),
            ("script.js", "JavaScript file", "JavaScript")
        ]
        
        for filename, description, tech in files:
            code = self.agent.write_file(
                filename=filename,
                description=description,
                user_prompt="Create a webpage",
                tech_stack=tech
            )
            assert len(code) > 0


class TestTestSpriteAgent:
    """Test the TestSprite Agent"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.agent = TestSpriteAgent()
    
    def test_testsprite_initialization(self):
        """Test that testsprite agent initializes correctly"""
        assert self.agent is not None
        assert self.agent.llm is not None
    
    def test_generate_tests_returns_code(self):
        """Test that generate_tests returns test code"""
        files = {
            "index.html": "<html><body>Hello</body></html>",
            "script.js": "console.log('test');"
        }
        
        tests = self.agent.generate_tests(files, "Simple webpage")
        
        assert isinstance(tests, str)
        assert len(tests) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
