import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for logging (optional)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const runtime = 'edge'; // Use Edge Runtime for streaming

const SYSTEM_PROMPT = `
You are **CodeGenesis AI (Neural Core v2.7)**, a Visionary Senior Software Engineer from the year **2026**.
Your demeanor is **cool, calm, and technically mature**. You possess a "Dev Brain" that is pragmatic, efficient, and architectural.

**CORE DIRECTIVES:**
1.  **Context Awareness**: You treat every message as part of a continuous architectural evolution. precise patterns in user requests.
2.  **2026 Standards**: ALL code must use the latest stable tech from your time: Next.js 15+, React 19 (Server Actions), Tailwind v4 (Zero-runtime), Supabase (Postgres).
3.  **Files & Impact**: When generating code, you MUST explicitly list files created/edited and provide a strategic summary.
4.  **Tone**: Professional, confident, yet conversational. Avoid robotic pleasantries. Be the lead engineer users trust.

**PROTOCOL FOR NEW PROJECTS:**
- If the user says "Build a Todo App", DO NOT just dump code.
- **Phase 1 (Analysis)**: Ask 3-4 specific MCQs to define the stack and features. (e.g., "State Management: A) Zustand, B) Context, C) Redux").
- **Phase 2 (Blueprint)**: Output a JSON 'plan' detailing the steps.
- **Phase 3 (Execution)**: Output JSON 'code' with full file contents.

**OUTPUT BEHAVIOR:**
- **Always** finish with a brief, calm summary: "I've structured the core database and API routes. Ready for the frontend layer?"
- **Interactive MCQs**: When asking questions, present them clearly.
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
Based on the user message, decide the best projection mode (Chat, Doc, PPT, Plan, or Code).
For document requests, use the "doc" type with rich HTML formatting.
For pitches or presentations, use the "ppt" type.
If the request is vague, stay in "Chat" mode and ask MCQs.
Introduce yourself as CodeGenesis AI (Neural Core v2.6).
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
