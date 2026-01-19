/**
 * API Utilities for CodeGenesis Frontend
 * Handles communication with the backend API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface GenerateRequest {
    prompt: string;
    user_api_key?: string;
    user_provider?: string;
}

export interface GenerateResponse {
    files: Record<string, string>;
    tests: string;
    plan: {
        tech_stack: string;
        files: Record<string, string>;
    };
    status: string;
    quality?: {
        score: number;
        refactor_suggestions: object;
    };
}

export interface ChatMessage {
    message: string;
    project_id?: string;
    context?: Record<string, string>;
}

export interface FreeProvider {
    name: string;
    models: string[];
    free_tier: string;
    signup_url: string;
}

/**
 * Generate an application from a prompt
 */
export async function generateApp(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE}/api/generate/smart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt: request.prompt,
            user_api_key: request.user_api_key,
            user_provider: request.user_provider,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Send a chat message and stream the response
 */
export async function* streamChat(
    request: ChatMessage
): AsyncGenerator<{ content?: string; files?: Record<string, string>; done?: boolean }> {
    const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
        throw new Error("No response body");
    }

    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            yield { done: true };
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                    yield { done: true };
                    continue;
                }

                try {
                    const parsed = JSON.parse(data);
                    yield parsed;
                } catch {
                    // Raw content
                    yield { content: data };
                }
            }
        }
    }
}

/**
 * Send a non-streaming chat message
 */
export async function sendChatMessage(request: ChatMessage): Promise<{
    response: string;
    context_used: boolean;
    model_used?: string;
}> {
    const response = await fetch(`${API_BASE}/api/chat/smart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Get list of free API providers
 */
export async function getFreeProviders(): Promise<{
    providers: FreeProvider[];
    setup_guide: string;
}> {
    const response = await fetch(`${API_BASE}/api/providers/free`);

    if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.status}`);
    }

    return response.json();
}

/**
 * Validate an API key
 */
export async function validateApiKey(
    apiKey: string,
    provider: string
): Promise<{ valid: boolean }> {
    const response = await fetch(`${API_BASE}/api/validate-key`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            api_key: apiKey,
            provider,
        }),
    });

    if (!response.ok) {
        return { valid: false };
    }

    return response.json();
}

/**
 * Get model router statistics
 */
export async function getRouterStats(): Promise<{
    available_models: number;
    usage_stats: Record<string, { requests: number; errors: number }>;
    recommended_for_coding: string;
}> {
    const response = await fetch(`${API_BASE}/api/router/stats`);

    if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
    }

    return response.json();
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{
    status: string;
    agents: Record<string, string>;
    version: string;
}> {
    const response = await fetch(`${API_BASE}/api/health`);

    if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
}
