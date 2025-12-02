# CodeGenesis - Autonomous AI Software Architect

> **Text-to-App Platform** | Build applications at the speed of thought

CodeGenesis is a production-ready, open-source platform that uses a multi-agent AI swarm to autonomously plan, code, test, and deploy full-stack applications from natural language descriptions.

## 🌟 Features

- **Text-to-App Generation**: Describe your app in plain English, get a complete codebase
- **Multi-Agent Swarm**:
  - **Architect Agent**: Plans file structure and tech stack
  - **Engineer Agent**: Writes code for each file
  - **TestSprite Agent**: Generates Playwright tests automatically
- **OpenLovable Editor**: Click-to-edit visual interface (Coming Soon)
- **Live Preview**: See your app running in real-time
- **Production Ready**: Clerk authentication, Supabase data collection, Admin dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Google Gemini API Key (Free tier available)

### Installation

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CodeGenesis
```

#### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file in `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running Locally

#### Terminal 1 - Backend

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
uvicorn main:app --reload --port 8000
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 📖 Usage

1. **Sign Up**: Create an account using Clerk authentication
2. **Dashboard**: Click "New Project" to start
3. **Editor**: Describe your app in the chat (e.g., "Create a todo list with add/delete")
4. **Watch**: The AI agents plan, code, and test your app in real-time
5. **Preview**: See the generated app running live

## 🏗️ Architecture

```
CodeGenesis/
├── frontend/          # Next.js 14 + Tailwind + Clerk
│   ├── app/           # Pages (Landing, Dashboard, Editor, Admin)
│   ├── components/    # UI Components (Chat, Code Editor, Preview)
│   └── lib/           # API Client, Utils
├── backend/           # FastAPI + LangGraph
│   ├── agents/        # Architect, Engineer, TestSprite
│   ├── orchestrator.py # LangGraph Workflow
│   ├── vfs.py         # Virtual File System
│   └── main.py        # API Endpoints
```

## 🔑 API Keys Setup

### Gemini API (Free)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `backend/.env`

### Clerk (Free)

1. Sign up at [Clerk.com](https://clerk.com)
2. Create a new application
3. Copy keys to `frontend/.env.local`

### Supabase (Free)

1. Create project at [Supabase.com](https://supabase.com)
2. Get URL and anon key from Settings > API
3. Add to `backend/.env`

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

## 📄 License

MIT License - Free to use for personal and commercial projects

## 🎓 Built For

Final Year CSE Project 2025 - Showcasing cutting-edge AI agent orchestration

---

**Made with ❤️ using LangGraph, Gemini, Next.js, and FastAPI**
