@echo off
REM MemoRAG ULTRA - Backend Setup Script (Windows)

echo ==========================================
echo MemoRAG ULTRA v0.3 Beta - Backend Setup
echo ==========================================
echo.

REM Check Python version
echo Checking Python version...
python --version
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Download spaCy model
echo.
echo Downloading spaCy model...
python -m spacy download en_core_web_sm

REM Copy config
echo.
echo Setting up configuration...
if not exist "..\config\config.yaml" (
    copy "..\config\config.example.yaml" "..\config\config.yaml"
    echo Created config.yaml from example
) else (
    echo config.yaml already exists
)

REM Create data directories
echo.
echo Creating data directories...
if not exist "..\data\documents" mkdir "..\data\documents"
if not exist "..\data\indexes" mkdir "..\data\indexes"
if not exist "..\data\cache" mkdir "..\data\cache"
if not exist "..\data\logs" mkdir "..\data\logs"

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Start LM Studio and load a model
echo 2. Update config/config.yaml if needed
echo 3. Run: python -m app.main
echo.
pause
