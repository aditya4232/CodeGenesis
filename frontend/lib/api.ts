const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface GenerateResponse {
    files: Record<string, string>;
    tests: string;
    plan: {
        tech_stack: string;
        files: Record<string, string>;
    };
    status: string;
}

export interface UserAPIConfig {
    apiKey?: string;
    provider?: "openai" | "anthropic" | "gemini" | "a4f" | "custom";
    baseUrl?: string;  // For custom API endpoints
}

export const api = {
    async generateApp(prompt: string, userConfig?: UserAPIConfig): Promise<GenerateResponse> {
        const response = await fetch(`${API_BASE_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                user_api_key: userConfig?.apiKey,
                user_provider: userConfig?.provider,
                user_base_url: userConfig?.baseUrl
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate app");
        }

        return response.json();
    },

    async chat(message: string, context?: string): Promise<{ response: string }> {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message, context }),
        });

        if (!response.ok) {
            throw new Error("Chat request failed");
        }

        return response.json();
    },

    async validateAPIKey(apiKey: string, provider: string): Promise<{ valid: boolean; message: string }> {
        const response = await fetch(`${API_BASE_URL}/api/validate-key`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: "", // Not used for validation
                user_api_key: apiKey,
                user_provider: provider
            }),
        });

        return response.json();
    },

    async healthCheck(): Promise<{ status: string; agents: string[] }> {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.json();
    },
};
