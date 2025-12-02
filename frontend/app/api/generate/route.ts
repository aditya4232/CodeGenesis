import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
    try {
        const { prompt, model, code } = await req.json();
        const openaiKey = req.headers.get('x-openai-key');
        const anthropicKey = req.headers.get('x-anthropic-key');

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        let generatedCode = '';

        if (model === 'claude-3-5-sonnet' && anthropicKey) {
            const anthropic = new Anthropic({ apiKey: anthropicKey });
            const msg = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 4096,
                messages: [
                    {
                        role: "user",
                        content: `You are an expert software architect and developer. 
            Generate a single HTML file containing the complete solution (HTML, CSS, JS) for the following request: "${prompt}".
            
            ${code ? `Here is the existing code to modify:\n${code}` : ''}
            
            Return ONLY the code, no markdown formatting, no explanations.`
                    }
                ]
            });

            // Handle content block properly
            const contentBlock = msg.content[0];
            if (contentBlock.type === 'text') {
                generatedCode = contentBlock.text;
            }
        } else if (openaiKey) {
            // Default to OpenAI if key exists or if model is gpt-4o
            const openai = new OpenAI({ apiKey: openaiKey });
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert software architect. Generate a single HTML file containing the complete solution. Return ONLY the code, no markdown."
                    },
                    {
                        role: "user",
                        content: `${prompt} ${code ? `\n\nExisting code:\n${code}` : ''}`
                    }
                ],
                model: "gpt-4o",
            });
            generatedCode = completion.choices[0].message.content || '';
        } else {
            return NextResponse.json({
                error: 'No valid API key provided. Please configure your API keys in Settings.'
            }, { status: 401 });
        }

        // Clean up markdown code blocks if present
        generatedCode = generatedCode.replace(/```html/g, '').replace(/```/g, '');

        return NextResponse.json({ code: generatedCode });
    } catch (error: any) {
        console.error('Generation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate code' }, { status: 500 });
    }
}
