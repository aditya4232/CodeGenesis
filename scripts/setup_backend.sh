#!/bin/bash
# MemoRAG ULTRA - Backend Setup Script (Linux/Mac)

echo "=========================================="
echo "MemoRAG ULTRA v0.3 Beta - Backend Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Found Python $python_version"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

# Download spaCy model
echo ""
echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Copy config
echo ""
echo "Setting up configuration..."
if [ ! -f "../config/config.yaml" ]; then
    cp ../config/config.example.yaml ../config/config.yaml
    echo "Created config.yaml from example"
else
    echo "config.yaml already exists"
fi

# Create data directories
echo ""
echo "Creating data directories..."
mkdir -p ../data/documents
mkdir -p ../data/indexes
mkdir -p ../data/cache
mkdir -p ../data/logs

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start LM Studio and load a model"
echo "2. Update config/config.yaml if needed"
echo "3. Run: python -m app.main"
echo ""
