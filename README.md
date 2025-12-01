# MemoRAG ULTRA

A production-grade, research-level AI knowledge engine that runs fully locally on your laptop.

## 🚀 Features

- **Multi-Modal RAG**: Process PDFs, images, audio, and scanned documents
- **Hybrid Retrieval**: Automatic Speed/Deep mode selection
- **5 AI Agents**: Planner, Retriever, Critic, Verifier, Teacher
- **Continual Learning**: Anti-forgetting memory system
- **3D Knowledge Graph**: Interactive visualization
- **Fact-Checking**: Automated verification with external KBs
- **Semantic Caching**: 10x speedup for similar queries
- **Research Metrics**: RAGAS evaluation + hallucination detection
- **100% Local**: No cloud, no costs, complete privacy

## 📋 Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: 8-16 GB
- **Storage**: ~10 GB free space
- **Python**: 3.11+
- **Node.js**: 18+ (for frontend)
- **LM Studio**: Download from [lmstudio.ai](https://lmstudio.ai)

## 🛠️ Quick Start

### 1. Install LM Studio

1. Download and install [LM Studio](https://lmstudio.ai)
2. Download a quantized model (recommended: `Phi-3-mini-4k-instruct-Q4_K_M` or `Mistral-7B-Instruct-v0.2-Q4_K_M`)
3. Start the local server (default: `http://localhost:1234`)

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp ../config/config.example.yaml ../config/config.yaml
# Edit config.yaml with your LM Studio settings
python -m app.main
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Ingest Example Data

```bash
cd scripts
python ingest_example_data.py
```

## 📚 Documentation

- [Architecture](docs/architecture.md) - System design and components
- [Usage Guide](docs/usage_guide.md) - How to use MemoRAG ULTRA
- [API Reference](docs/api_reference.md) - API endpoints and examples
- [Standout Features](docs/standout_features.md) - What makes this special

## 🎯 Usage

### Upload Documents

1. Open the web interface at `http://localhost:5173`
2. Navigate to "Documents" page
3. Drag and drop files (PDF, TXT, MD, images, audio)
4. Wait for processing to complete

### Ask Questions

1. Go to "Query" page
2. Type your question
3. Select mode (Auto/Speed/Deep) or let the system decide
4. View answer with confidence score and provenance

### Explore Knowledge

1. Visit "Timeline" to see knowledge evolution
2. Check "System Status" for metrics and health
3. View 3D knowledge graph visualization

## 🏗️ Project Structure

```
GiblerXT/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Core config and models
│   │   ├── rag/      # RAG engine
│   │   ├── agents/   # 5 AI agents
│   │   ├── memory/   # Continual learning
│   │   ├── intelligence/  # Active learning
│   │   ├── cache/    # Semantic caching
│   │   ├── factcheck/     # Fact verification
│   │   └── ...
│   └── tests/
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── public/
├── config/          # Configuration files
├── docs/            # Documentation
├── scripts/         # Utility scripts
└── data/            # Data storage
```

## 🔬 Research Features

- **RAGAS Metrics**: Context relevance, answer faithfulness, recall
- **Hallucination Detection**: Automated fact verification
- **A/B Testing**: Compare retrieval strategies
- **Comparative Analysis**: Multi-document synthesis
- **Trend Analysis**: Knowledge evolution over time

## 🎨 Advanced Features

- **Active Learning**: Query suggestions based on knowledge gaps
- **Semantic Caching**: 10x faster for similar queries
- **Multi-Modal**: Process text, images, audio, scanned docs
- **Self-Healing**: Automatic error detection and correction
- **Real-Time Monitoring**: Performance analytics and alerts

## 📊 Performance

- **Speed Mode**: <1.5s response time
- **Deep Mode**: <5s response time
- **Cached Queries**: <0.2s (10x faster)
- **Memory Usage**: ~5 GB RAM
- **Scalability**: 1000+ documents

## 🤝 Contributing

This is a final-year CSE project. Contributions, suggestions, and feedback are welcome!

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [LM Studio](https://lmstudio.ai) - Local LLM inference
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [LangChain](https://langchain.com/) - LLM orchestration
- [FAISS](https://github.com/facebookresearch/faiss) - Vector search

## 📧 Contact

For questions or collaboration: [Your Email/GitHub]

---

**MemoRAG ULTRA** - Your local AI knowledge engine 🧠✨
