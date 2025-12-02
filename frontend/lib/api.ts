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

export const api = {
    async generateApp(prompt: string): Promise<GenerateResponse> {
        const response = await fetch(`${API_BASE_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate app");
        }

        return response.json();
    },

    async healthCheck(): Promise<{ status: string; agents: string[] }> {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.json();
    },
};
