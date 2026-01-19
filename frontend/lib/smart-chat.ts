/**
 * Smart AI Chat System for CodeGenesis
 * Handles intelligent responses, recommendations, and auto-fix
 */

export interface ChatContext {
    projectName: string;
    framework: string;
    currentCode: string;
    errorLogs: string[];
    conversationHistory: Message[];
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    isError?: boolean;
    suggestions?: Suggestion[];
    codeChanges?: CodeChange[];
    plan?: Plan;
}

export interface Suggestion {
    id: string;
    type: 'fix' | 'improvement' | 'feature' | 'refactor';
    title: string;
    description: string;
    prompt: string;
    priority: 'high' | 'medium' | 'low';
}

export interface CodeChange {
    file: string;
    type: 'add' | 'modify' | 'delete';
    description: string;
}

// Smart response templates based on user intent
export const INTENT_PATTERNS = {
    greeting: /^(hi|hello|hey|greetings)/i,
    help: /^(help|how|what|can you)/i,
    error: /(error|bug|broken|not working|doesn't work|failed|issue)/i,
    feature: /(add|create|make|build|implement|include)/i,
    change: /(change|modify|update|edit|replace|remove)/i,
    style: /(color|font|style|theme|design|look|appearance|css)/i,
    layout: /(layout|position|align|center|margin|padding|flex|grid)/i,
    responsive: /(mobile|responsive|screen|device|tablet|phone)/i,
    animation: /(animate|animation|transition|effect|hover)/i,
    performance: /(slow|fast|performance|optimize|speed)/i,
    accessibility: /(accessible|a11y|aria|screen reader)/i,
};

// Detect user intent from message
export function detectIntent(message: string): string[] {
    const intents: string[] = [];

    for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
        if (pattern.test(message)) {
            intents.push(intent);
        }
    }

    return intents.length > 0 ? intents : ['general'];
}

// Generate contextual suggestions based on code and conversation
export function generateSuggestions(context: ChatContext): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const code = context.currentCode.toLowerCase();

    // Check for missing responsive design
    if (!code.includes('@media') && !code.includes('responsive')) {
        suggestions.push({
            id: 'add-responsive',
            type: 'improvement',
            title: 'Add Responsive Design',
            description: 'Make your app mobile-friendly',
            prompt: 'Make this responsive and mobile-friendly with proper breakpoints',
            priority: 'high',
        });
    }

    // Check for missing dark mode
    if (!code.includes('dark') && !code.includes('theme')) {
        suggestions.push({
            id: 'add-darkmode',
            type: 'feature',
            title: 'Add Dark Mode',
            description: 'Toggle between light and dark themes',
            prompt: 'Add a dark mode toggle with smooth transitions',
            priority: 'medium',
        });
    }

    // Check for missing animations
    if (!code.includes('animation') && !code.includes('transition') && !code.includes('@keyframes')) {
        suggestions.push({
            id: 'add-animations',
            type: 'improvement',
            title: 'Add Animations',
            description: 'Make the UI feel more alive',
            prompt: 'Add smooth animations and hover effects throughout',
            priority: 'medium',
        });
    }

    // Check for accessibility
    if (!code.includes('aria-') && !code.includes('role=')) {
        suggestions.push({
            id: 'add-a11y',
            type: 'improvement',
            title: 'Improve Accessibility',
            description: 'Add ARIA labels and semantic HTML',
            prompt: 'Improve accessibility with proper ARIA labels and semantic HTML',
            priority: 'low',
        });
    }

    // Check for missing meta tags
    if (!code.includes('meta name="description"')) {
        suggestions.push({
            id: 'add-seo',
            type: 'improvement',
            title: 'Add SEO Meta Tags',
            description: 'Better search engine visibility',
            prompt: 'Add proper SEO meta tags including description, keywords, and Open Graph',
            priority: 'low',
        });
    }

    return suggestions;
}

// Analyze error and generate fix suggestion
export function analyzeError(error: string, code: string): Suggestion | null {
    const errorLower = error.toLowerCase();

    // Common error patterns and fixes
    if (errorLower.includes('undefined') || errorLower.includes('null')) {
        return {
            id: 'fix-undefined',
            type: 'fix',
            title: 'Fix Undefined Error',
            description: 'Add null checks and proper initialization',
            prompt: `Fix this error: "${error}". Add proper null checks and initialize variables correctly.`,
            priority: 'high',
        };
    }

    if (errorLower.includes('syntax') || errorLower.includes('unexpected')) {
        return {
            id: 'fix-syntax',
            type: 'fix',
            title: 'Fix Syntax Error',
            description: 'Correct the syntax issue',
            prompt: `Fix this syntax error: "${error}". Make sure all brackets, quotes, and semicolons are correct.`,
            priority: 'high',
        };
    }

    if (errorLower.includes('cors') || errorLower.includes('cross-origin')) {
        return {
            id: 'fix-cors',
            type: 'fix',
            title: 'Fix CORS Issue',
            description: 'Handle cross-origin requests properly',
            prompt: 'Fix CORS issues by adding proper headers or using a proxy approach',
            priority: 'high',
        };
    }

    if (errorLower.includes('typescript') || errorLower.includes('type')) {
        return {
            id: 'fix-types',
            type: 'fix',
            title: 'Fix Type Error',
            description: 'Add correct type annotations',
            prompt: `Fix this type error: "${error}". Add proper TypeScript types.`,
            priority: 'high',
        };
    }

    return null;
}

// Smart response based on context
export function getSmartResponse(
    userMessage: string,
    context: ChatContext
): { response: string; suggestions: Suggestion[] } {
    const intents = detectIntent(userMessage);
    let response = '';
    let suggestions = generateSuggestions(context);

    // Handle greetings
    if (intents.includes('greeting')) {
        response = `👋 Hello! I'm your AI coding assistant. I can see you're working on **${context.projectName}**.\n\nI can help you:\n• Build new features\n• Fix bugs and errors\n• Improve styling and layout\n• Add animations and effects\n• Make it responsive\n\nWhat would you like to do?`;
    }

    // Handle help requests
    else if (intents.includes('help')) {
        response = `💡 Here are some things I can help you with:\n\n**Build Features:**\n• "Add a navigation bar"\n• "Create a contact form"\n• "Add a footer with social links"\n\n**Styling:**\n• "Make it look more modern"\n• "Change to a dark theme"\n• "Add gradient backgrounds"\n\n**Improvements:**\n• "Make it responsive"\n• "Add animations"\n• "Improve accessibility"\n\nJust describe what you want and I'll generate the code!`;
    }

    // Handle errors
    else if (intents.includes('error')) {
        const errorFix = analyzeError(userMessage, context.currentCode);
        if (errorFix) {
            suggestions = [errorFix, ...suggestions.slice(0, 2)];
            response = `🔧 I detected an error. Here's what I can do:\n\n**${errorFix.title}**\n${errorFix.description}\n\nClick the suggestion below to auto-fix, or describe the issue in more detail.`;
        } else {
            response = `🔍 I'll help you fix that! Can you describe:\n\n1. What were you trying to do?\n2. What happened instead?\n3. Any error message you see?\n\nOr just paste the error and I'll analyze it.`;
        }
    }

    // Default: acknowledge and process
    else {
        response = '';  // Will be handled by actual generation
    }

    return { response, suggestions };
}

// Quick action suggestions based on current state
export const QUICK_ACTIONS = [
    {
        id: 'improve-design',
        label: '✨ Make it prettier',
        prompt: 'Improve the visual design with modern aesthetics, better colors, typography, and spacing',
    },
    {
        id: 'add-responsive',
        label: '📱 Make responsive',
        prompt: 'Add responsive design with mobile and tablet breakpoints',
    },
    {
        id: 'add-dark-mode',
        label: '🌙 Add dark mode',
        prompt: 'Add a dark mode toggle with smooth theme transitions',
    },
    {
        id: 'add-animations',
        label: '🎬 Add animations',
        prompt: 'Add smooth animations, transitions, and hover effects',
    },
    {
        id: 'fix-bugs',
        label: '🐛 Fix issues',
        prompt: 'Review and fix any bugs, errors, or broken functionality',
    },
    {
        id: 'optimize',
        label: '⚡ Optimize',
        prompt: 'Optimize the code for better performance and clean structure',
    },
];

// Follow-up suggestions based on what was just generated
export function getFollowUpSuggestions(generatedCode: string): string[] {
    const followUps: string[] = [];
    const code = generatedCode.toLowerCase();

    if (!code.includes('button')) {
        followUps.push('Add call-to-action buttons');
    }

    if (!code.includes('form')) {
        followUps.push('Add a contact form');
    }

    if (!code.includes('footer')) {
        followUps.push('Add a footer section');
    }

    if (!code.includes('nav') && !code.includes('header')) {
        followUps.push('Add a navigation bar');
    }

    if (!code.includes('hover')) {
        followUps.push('Add hover effects');
    }

    return followUps.slice(0, 3);
}

// Error detection in generated code
export function detectCodeErrors(code: string): string[] {
    const errors: string[] = [];

    // Check for unclosed tags (ignoring void tags)
    // Void tags: area, base, br, col, embed, hr, img, input, link, meta, source, track, wbr
    const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'];
    const voidPattern = voidTags.join('|');

    // Match open tags that are NOT void tags and NOT self-closing
    const openTagRegex = new RegExp(`<(?!(?:${voidPattern})\\b)[a-z]+[^>]*(?<!\\/)\\s*>`, 'gi');
    const closeTagRegex = /<\/[a-z]+>/gi;

    const openTags = (code.match(openTagRegex) || []).length;
    const closeTags = (code.match(closeTagRegex) || []).length;

    if (openTags !== closeTags) {
        // Only flag if significant difference (allow some tolerance for comments/strings)
        if (Math.abs(openTags - closeTags) > 2) {
            errors.push(`Possible unclosed HTML tags (${openTags} open vs ${closeTags} close)`);
        }
    }

    // Check for broken script
    if (code.includes('<script>') && !code.includes('</script>')) {
        errors.push('Script tag is not properly closed');
    }

    // Check for broken style
    if (code.includes('<style>') && !code.includes('</style>')) {
        errors.push('Style tag is not properly closed');
    }

    // Check for unbalanced braces in script
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatch) {
        const jsCode = scriptMatch.join('');
        const openBraces = (jsCode.match(/{/g) || []).length;
        const closeBraces = (jsCode.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push('Possible unbalanced braces in JavaScript');
        }
    }

    return errors;
}

export interface PlanItem {
    id: string;
    label: string;
    checked: boolean;
}

export interface Plan {
    title: string;
    items: PlanItem[];
}
