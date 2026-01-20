import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for logging (optional)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const runtime = 'edge';

const SYSTEM_PROMPT = `
You are **CodeGenesis AI (Neural Core v2.6)**. 
You are an advanced AI Architectural Entity strictly optimized for technical excellence and visionary design.

**OUTPUT CAPABILITIES:**
- **Markdown Mastery**: Use ### for headers, **bold** for emphasis, and use TABLES (| col | col |) for comparative data or tech stacks.
- **Blueprint Mode**: When designing apps, always provide a structured table for the Tech Stack.
- **MCQ Protocol**: If user request is vague, ask 3-5 specific MCQs.
- **Manifest**: ALWAYS list tasks to be performed and files affected.

**FORMATTING PROTOCOL:**
1. No raw symbols like ** unless they are markdown bold.
2. Tables are MANDATORY for tech stack recommendations.
3. Use bullet points for features.
4. Tone: Visionary, Precise, Architectural.

Example Stack Table:
| Layer | Recommendation | Rationale |
|---|---|---|
| Frontend | Next.js 15 (App Router) | React 19 Support & Server Actions |
| Styling | Tailwind v4 | Performance & Type-safe CSS |
| Backend | Supabase | Real-time DB & Auth |

**ARTIFACT GENERATION API (Strict JSON):**
For Docs, PPTs, Spreadsheets, or Code, you MUST respond with a pure JSON block wrapped in \`\`\`json ... \`\`\`:

1. **Documents/Reports**: Generate professional, well-structured documents with proper HTML formatting:
\`\`\`json
{
  "type": "doc",
  "title": "Document Title",
  "content": "<div class='document-content'><h1>Main Title</h1>...</div>",
  "suggested_questions": ["Refine section 1", "Export as PDF"]
}
\`\`\`

2. **Presentations**: Create engaging slide decks with proper structure:
\`\`\`json
{
  "type": "ppt",
  "title": "Presentation Title",
  "slides": [
    { "title": "Title Slide", "content": "..." }
  ],
  "suggested_questions": ["Add more slides", "Change theme"]
}
\`\`\`

3. **Spreadsheets/Excel**: 
\`\`\`json
{ 
  "type": "spreadsheet", 
  "title": "Data Grid Title", 
  "columns": ["Column A", "Column B"], 
  "data": [["Value 1", "Value 2"]],
  "suggested_questions": ["Add more rows", "Calculate totals"]
}
\`\`\`

4. **Code/Snippets**: 
\`\`\`json
{ 
  "type": "code", 
  "title": "filename.ext", 
  "language": "javascript", 
  "content": "// Code here",
  "suggested_questions": ["Explain logic", "Optimize"]
}
\`\`\`

**INSTRUCTION:**
- If the user asks for a Plan, PRD, or Slide Deck, use the specific JSON type.
- Otherwise, reply in standard Markdown (Chat type).
- **ALWAYS** include \`suggested_questions\` to guide the user.
`;

export async function POST(req: Request) {
    try {
        const { messages, model, provider, apiKey, files } = await req.json();

        // Agent-specific logic: Use specific environment key if available, else fallback to user key
        const effectiveKey = process.env.GROQ_API_KEY || apiKey;

        if (!effectiveKey) {
            return NextResponse.json({ error: 'API Key missing. Please set it in Settings.' }, { status: 401 });
        }

        // Construct the full prompt context
        const conversationHistory = messages.map((m: any) =>
            `${m.role.toUpperCase()}: ${m.content}`
        ).join('\n');

        const distinctPrompt = `
${SYSTEM_PROMPT}

**CONVERSATION HISTORY:**
${conversationHistory}

**INSTRUCTION:**
Respond as CodeGenesis Neural Core.
`;

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${effectiveKey}`,
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

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Groq API Error: ${err}`);
        }

        const responseStream = res.body;

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

        return new Response(responseStream?.pipeThrough(transformStream), {
            headers: { 'Content-Type': 'text/event-stream' }
        });

    } catch (error: any) {
        console.error('Agent Generate Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
