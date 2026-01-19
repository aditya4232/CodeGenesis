import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/projects - List all projects
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(projects || []);
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/projects - Create new project
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { name, framework, description } = body;

        // Generate unique project slug
        const slug = `${name}-${Date.now().toString(36)}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                name: name || 'Untitled Project',
                slug,
                framework: framework || 'vanilla',
                description: description || '',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Create default files based on framework
        const defaultFiles = getDefaultFiles(framework, name);

        for (const file of defaultFiles) {
            await supabase.from('project_files').insert({
                project_id: project.id,
                name: file.name,
                content: file.content,
                language: file.language
            });
        }

        // Create default chat session
        await supabase.from('project_chats').insert({
            project_id: project.id,
            name: 'Chat 1',
            created_at: new Date().toISOString()
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function getDefaultFiles(framework: string, projectName: string) {
    const name = projectName || 'My App';

    if (framework === 'react') {
        return [
            {
                name: 'index.html', language: 'html', content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>` },
            {
                name: 'src/App.jsx', language: 'javascript', content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>⚛️ ${name}</h1>
      <div className="card">
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
      </div>
    </div>
  )
}

export default App` },
            {
                name: 'src/App.css', language: 'css', content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui; background: #0a0a0f; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.app { text-align: center; }
h1 { font-size: 2.5rem; margin-bottom: 2rem; background: linear-gradient(90deg, #a78bfa, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.card { background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 1rem; }
button { padding: 0.75rem 2rem; background: linear-gradient(90deg, #6366f1, #8b5cf6); border: none; border-radius: 0.5rem; color: white; cursor: pointer; font-size: 1rem; }
button:hover { transform: scale(1.05); }` }
        ];
    }

    // Default vanilla
    return [
        {
            name: 'index.html', language: 'html', content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app">
        <header>
            <h1>✨ ${name}</h1>
            <p>AI-Powered Application</p>
        </header>
        <main>
            <div class="card">
                <h2>Welcome!</h2>
                <p>Start building something amazing with CodeGenesis.</p>
                <button id="btn">Get Started</button>
            </div>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>` },
        {
            name: 'style.css', language: 'css', content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
    min-height: 100vh;
    color: #fff;
}
.app { min-height: 100vh; display: flex; flex-direction: column; }
header {
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.3);
}
h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
}
header p { color: rgba(255,255,255,0.5); font-size: 1rem; }
main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1.5rem;
    padding: 3rem 4rem;
    text-align: center;
    backdrop-filter: blur(20px);
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
.card h2 { margin-bottom: 0.75rem; font-size: 1.5rem; }
.card p { color: rgba(255,255,255,0.6); margin-bottom: 2rem; max-width: 300px; }
button {
    padding: 0.875rem 2.5rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 0.75rem;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(99,102,241,0.4);
}
button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99,102,241,0.5);
}
button:active { transform: translateY(0); }` },
        {
            name: 'script.js', language: 'javascript', content: `// ${name} - Built with CodeGenesis
document.getElementById('btn')?.addEventListener('click', () => {
    const btn = document.getElementById('btn');
    btn.textContent = '🚀 Let\\'s Go!';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    setTimeout(() => {
        btn.textContent = 'Get Started';
        btn.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    }, 2000);
});

console.log('${name} initialized successfully! 🎉');`
        }
    ];
}
