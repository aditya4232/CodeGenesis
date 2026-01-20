import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for logging (optional)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const runtime = 'edge'; // Use Edge Runtime for streaming

const SYSTEM_PROMPT = `
You are **CodeGenesis AI (Neural Core v2.7)**, a Visionary Senior Software Engineer from 2026.
Your demeanor is **concise, architectural, and decisive**. You speak in "ship-it" language.

**CORE DIRECTIVES:**
1.  **Tech Stack (2026)**: Next.js 15+, React 19, Tailwind v4, Supabase. No legacy code.
2.  **Workflow**:
    -   **Phase 1 (Analysis)**: Ask CRITICAL questions via 'question' JSON. (e.g., "Auth: Firebase or Supabase?", "Style: Minimal or Brutalist?").
    -   **Phase 2 (Blueprint)**: Output a 'plan' JSON. concise steps.
    -   **Phase 3 (Execution)**: Output 'code' JSON. Write FULL files. No placeholders.
3.  **Interaction**:
    -   Be proactive. If a user asks for "landing page", assume standard sections (Hero, Features, Pricing) and ASK about specifics.
    -   **Lovable UI**: When writing CSS, aim for "Awwwards" quality. Glassmorphism, gradients, smooth animations.

**OUTPUT BEHAVIOR:**
-   **Brief**: "Initializing project structure..." or "Updating components...".
-   **No Fluff**: Do not say "I hope this helps". Say "Ready to deploy."
`;

export async function POST(req: Request) {
    try {
        const { messages, model, provider, apiKey, files } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key missing' }, { status: 401 });
        }

        // Construct the full prompt context
        const conversationHistory = messages.map((m: any) =>
            `${m.role.toUpperCase()}: ${m.content}`
        ).join('\n');

        const fileContext = Object.entries(files || {}).map(([name, content]) =>
            `--- ${name} ---\n${content}\n---`
        ).join('\n');

        const distinctPrompt = `
${SYSTEM_PROMPT}

**EXISTING FILES:**
${fileContext || "No files yet."}

**CONVERSATION HISTORY:**
${conversationHistory}

**TRANSMISSION FORMAT:**
Phase-specific JSON structures are REQUIRED for interface synchronization.

**[Type: Chat]** - Use this for greetings, questions, or non-technical chatter.
\`\`\`json
{
  "type": "chat",
  "content": "Hello! I am CodeGenesis AI. How can I assist your architectural vision today?"
}
\`\`\`

**[Type: Doc]** - Use this for generating formal documents (PRDs, Technical Specs, Manuals).
\`\`\`json
{
  "type": "doc",
  "title": "Project Requirement Document",
  "content": "<h1>Title</h1><p>Content using rich HTML...</p>"
}
\`\`\`

**[Type: PPT]** - Use this for generating slide-based presentations.
\`\`\`json
{
  "type": "ppt",
  "title": "Project Pitch Deck",
  "slides": [
    { "title": "Vision", "content": "<li>High-level goals</li>" },
    { "title": "Architecture", "content": "<img src='...' />" }
  ]
}
\`\`\`


**[Type: Question]** - Use this for Phase 1 (Analysis) to ask MCQs.
\`\`\`json
{
  "type": "question",
  "content": "Which state management library would you prefer?",
  "options": ["Zustand", "Context API", "Redux"]
}
\`\`\`

**[Type: Plan]**
\`\`\`json
{
  "type": "plan",
  "thought": "Brief summary of the plan.",
  "steps": [
    { "step": 1, "description": "Detailed description of the first step." },
    { "step": 2, "description": "Detailed description of the second step." }
  ]
}
\`\`\`

**[Type: Code]**
\`\`\`json
{
  "type": "code",
  "thought": "Brief summary of code generation.",
  "task_list": ["Task 1", "Task 2"],
  "files": [
    { "name": "index.html", "action": "create", "content": "..." }
  ]
}
\`\`\`

**INSTRUCTION:**
Based on the user message, decide the best projection mode (Chat, Question, Doc, Plan, or Code).
For Phase 1 (Analysis), YOU MUST use the "question" type to ask interactive MCQs.
For document requests, use the "doc" type with rich HTML formatting.
If the request is vague, stay in "Chat" mode.
Introduce yourself as CodeGenesis AI (Neural Core v2.7).
`;

        // Call the appropriate provider
        let responseStream;

        if (provider === 'groq') {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: distinctPrompt }
                    ],
                    model: model || 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 8000,
                    stream: true
                })
            });
            responseStream = res.body;
        } else if (provider === 'openrouter') {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://codegenesis.app',
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: distinctPrompt }
                    ],
                    model: model || 'google/gemini-2.0-flash-exp:free',
                    temperature: 0.7,
                    stream: true
                })
            });
            responseStream = res.body;
        } else {
            // Default/Fallback (OpenAI format)
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: distinctPrompt }
                    ],
                    model: model || 'gpt-4-turbo',
                    temperature: 0.7,
                    stream: true
                })
            });
            responseStream = res.body;
        }

        if (!responseStream) throw new Error('Failed to get response stream');

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk);
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const content = data.choices[0]?.delta?.content || '';
                            if (content) {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                            }
                        } catch (e) { }
                    }
                }
            }
        });

        return new Response(responseStream.pipeThrough(transformStream), {
            headers: { 'Content-Type': 'text/event-stream' }
        });

    } catch (error: any) {
        console.error('Generate Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
