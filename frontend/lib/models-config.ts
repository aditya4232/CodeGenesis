/**
 * AI Models Configuration for CodeGenesis
 * Supports free models, premium models, and custom configurations
 */

export interface ModelConfig {
    id: string;
    name: string;
    provider: Provider;
    description: string;
    contextWindow: number;
    isFree: boolean;
    isRecommended?: boolean;
    tier: 'free' | 'standard' | 'premium';
    capabilities: ('code' | 'reasoning' | 'fast' | 'creative')[];
    multimodal?: boolean;
}

export type Provider =
    | 'openrouter'
    | 'groq'
    | 'google'
    | 'openai'
    | 'anthropic'
    | 'custom';

export interface ProviderConfig {
    id: Provider;
    name: string;
    description: string;
    baseUrl: string;
    keyPrefix: string;
    docsUrl: string;
    hasFreeModels: boolean;
    isCustom?: boolean;
}

// Provider configurations
export const PROVIDERS: Record<Provider, ProviderConfig> = {
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Access 100+ models including free options',
        baseUrl: 'https://openrouter.ai/api/v1',
        keyPrefix: 'sk-or-',
        docsUrl: 'https://openrouter.ai/keys',
        hasFreeModels: true,
    },
    groq: {
        id: 'groq',
        name: 'Groq',
        description: 'Ultra-fast inference with generous free tier',
        baseUrl: 'https://api.groq.com/openai/v1',
        keyPrefix: 'gsk_',
        docsUrl: 'https://console.groq.com/keys',
        hasFreeModels: true,
    },
    google: {
        id: 'google',
        name: 'Google AI Studio',
        description: 'Gemini models with free tier',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        keyPrefix: 'AIza',
        docsUrl: 'https://aistudio.google.com/apikey',
        hasFreeModels: true,
    },
    openai: {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4o and other premium models',
        baseUrl: 'https://api.openai.com/v1',
        keyPrefix: 'sk-',
        docsUrl: 'https://platform.openai.com/api-keys',
        hasFreeModels: false,
    },
    anthropic: {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude models for advanced coding',
        baseUrl: 'https://api.anthropic.com/v1',
        keyPrefix: 'sk-ant-',
        docsUrl: 'https://console.anthropic.com/settings/keys',
        hasFreeModels: false,
    },
    custom: {
        id: 'custom',
        name: 'Custom Provider',
        description: 'Use any OpenAI-compatible API',
        baseUrl: '',
        keyPrefix: '',
        docsUrl: '',
        hasFreeModels: false,
        isCustom: true,
    },
};

// Available models grouped by provider
export const MODELS: ModelConfig[] = [
    // OpenRouter FREE Models (verified working Jan 2025)
    {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B (Free)',
        provider: 'openrouter',
        description: 'Meta\'s latest - FREE and powerful. Best stability.',
        contextWindow: 128000,
        isFree: true,
        isRecommended: true,
        tier: 'free',
        capabilities: ['code', 'reasoning', 'creative'],
    },

    {
        id: 'deepseek/deepseek-chat:free',
        name: 'DeepSeek Chat (Free)',
        provider: 'openrouter',
        description: 'Great for coding - FREE',
        contextWindow: 64000,
        isFree: true,
        tier: 'free',
        capabilities: ['code', 'reasoning'],
    },
    {
        id: 'meta-llama/llama-3.2-11b-vision-instruct:free',
        name: 'Llama 3.2 11B Vision (Free)',
        provider: 'openrouter',
        description: 'Fast, multimodal model for verified tasks',
        contextWindow: 128000,
        isFree: true,
        tier: 'free',
        multimodal: true,
        capabilities: ['code', 'fast', 'reasoning'],
    },

    // Groq Models (Free tier with limits)
    {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        provider: 'groq',
        description: 'Ultra-fast inference - FREE tier available',
        contextWindow: 128000,
        isFree: true,
        tier: 'free',
        capabilities: ['code', 'fast', 'reasoning'],
    },
    {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        provider: 'groq',
        description: 'Lightning fast responses - FREE tier',
        contextWindow: 128000,
        isFree: true,
        tier: 'free',
        capabilities: ['code', 'fast'],
    },
    {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'groq',
        description: 'Mixture of experts - FREE tier',
        contextWindow: 32768,
        isFree: true,
        tier: 'free',
        capabilities: ['code', 'fast', 'creative'],
    },

    // Google AI Studio (Free tier)
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        description: 'Google\'s fastest model - FREE tier',
        contextWindow: 1000000,
        isFree: true,
        isRecommended: true,
        tier: 'free',
        capabilities: ['code', 'fast', 'reasoning'],
        multimodal: true,
    },
    {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        description: 'Long context coding - FREE tier',
        contextWindow: 2000000,
        isFree: true,
        tier: 'free',
        capabilities: ['code', 'reasoning', 'creative'],
        multimodal: true,
    },

    // Premium OpenAI Models
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: 'Most capable OpenAI model',
        contextWindow: 128000,
        isFree: false,
        tier: 'premium',
        capabilities: ['code', 'reasoning', 'creative'],
        multimodal: true,
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        description: 'Affordable and fast',
        contextWindow: 128000,
        isFree: false,
        tier: 'standard',
        capabilities: ['code', 'fast'],
        multimodal: true,
    },

    // Premium Anthropic Models
    {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        description: 'Best for complex coding tasks',
        contextWindow: 200000,
        isFree: false,
        isRecommended: true,
        tier: 'premium',
        capabilities: ['code', 'reasoning', 'creative'],
        multimodal: true,
    },
    {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        description: 'Fast and affordable',
        contextWindow: 200000,
        isFree: false,
        tier: 'standard',
        capabilities: ['code', 'fast'],
    },
];

// Helper functions
export const getFreeModels = () => MODELS.filter(m => m.isFree);
export const getModelsByProvider = (provider: Provider) => MODELS.filter(m => m.provider === provider);
export const getRecommendedModels = () => MODELS.filter(m => m.isRecommended);

export const getModelById = (id: string): ModelConfig | undefined => {
    return MODELS.find(m => m.id === id);
};

export const getProviderForModel = (modelId: string): ProviderConfig | undefined => {
    const model = getModelById(modelId);
    if (!model) return undefined;
    return PROVIDERS[model.provider];
};

// Project idea suggestions
export const PROJECT_IDEAS = [
    {
        title: "Todo App with Local Storage",
        description: "A beautiful todo list with categories, due dates, and persistence",
        prompt: "Create a modern todo app with categories, priority levels, due dates, and local storage persistence. Include a dark theme, smooth animations, and a clean minimal UI.",
        techStack: "HTML/CSS/JS",
        difficulty: "beginner"
    },
    {
        title: "Weather Dashboard",
        description: "Real-time weather with beautiful visualizations",
        prompt: "Build a weather dashboard that shows current weather, 5-day forecast, and weather maps. Use mock data but design it as if it's connected to a weather API. Include temperature graphs and animated weather icons.",
        techStack: "HTML/CSS/JS",
        difficulty: "intermediate"
    },
    {
        title: "Portfolio Website",
        description: "A stunning personal portfolio with animations",
        prompt: "Create a professional portfolio website with a hero section, about me, projects grid, skills showcase, and contact form. Use modern design with gradient backgrounds, glassmorphism effects, and smooth scroll animations.",
        techStack: "HTML/CSS/JS",
        difficulty: "beginner"
    },
    {
        title: "Expense Tracker",
        description: "Track spending with charts and categories",
        prompt: "Build an expense tracker with income/expense logging, categories, date filtering, and visual charts. Include a dashboard with spending summaries, pie charts for categories, and line graphs for trends over time.",
        techStack: "HTML/CSS/JS",
        difficulty: "intermediate"
    },
    {
        title: "Pomodoro Timer",
        description: "Productivity timer with task management",
        prompt: "Create a Pomodoro timer app with customizable work/break intervals, task list integration, session tracking, and ambient sounds. Include a beautiful circular progress indicator and statistics.",
        techStack: "HTML/CSS/JS",
        difficulty: "beginner"
    },
    {
        title: "AI Chat Interface",
        description: "Beautiful chat UI like ChatGPT",
        prompt: "Build a chat interface similar to ChatGPT with message bubbles, typing indicators, code syntax highlighting, markdown support, and conversation history. Include a dark theme and smooth animations.",
        techStack: "HTML/CSS/JS",
        difficulty: "intermediate"
    },
    {
        title: "Kanban Board",
        description: "Drag-and-drop task management",
        prompt: "Create a Kanban board with draggable task cards, multiple columns (Todo, In Progress, Done), task labels, and local storage persistence. Include smooth drag animations and a modern design.",
        techStack: "HTML/CSS/JS",
        difficulty: "advanced"
    },
    {
        title: "Recipe Finder",
        description: "Search and save favorite recipes",
        prompt: "Build a recipe finder app with search functionality, category filters, recipe cards with images, detailed recipe view with ingredients and instructions, and a favorites system with local storage.",
        techStack: "HTML/CSS/JS",
        difficulty: "intermediate"
    },
];

// Prompt enhancement suggestions
export const PROMPT_SUGGESTIONS = [
    "Add smooth animations and transitions",
    "Include a dark/light theme toggle",
    "Make it fully responsive for mobile",
    "Add loading states and skeletons",
    "Include form validation with error messages",
    "Add keyboard shortcuts",
    "Include accessibility features (ARIA labels)",
    "Add data persistence with localStorage",
    "Include a search/filter feature",
    "Add sorting functionality",
];

// Model recommendations based on use case
export const getRecommendedModelForTask = (taskType: 'simple' | 'complex' | 'creative'): ModelConfig => {
    switch (taskType) {
        case 'simple':
            return MODELS.find(m => m.id === 'llama-3.1-8b-instant') || MODELS[0];
        case 'complex':
            return MODELS.find(m => m.id === 'gemini-2.0-flash') || MODELS[0];
        case 'creative':
            return MODELS.find(m => m.id === 'meta-llama/llama-3.3-70b-instruct:free') || MODELS[0];
        default:
            return MODELS[0];
    }
};
