/**
 * Tech Stack Configuration for CodeGenesis
 * Frameworks, languages, and modern technologies
 */

export interface Framework {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
    languages: string[];
    features: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isPopular?: boolean;
    isNew?: boolean;
}

export interface TechStack {
    id: string;
    name: string;
    category: 'language' | 'styling' | 'database' | 'api' | 'testing' | 'deployment';
    icon: string;
    description: string;
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    framework: string;
    styling: string;
    features: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    previewImage?: string;
}

// Available Frameworks
export const FRAMEWORKS: Framework[] = [
    // Frontend
    {
        id: 'vanilla',
        name: 'Vanilla JS',
        description: 'Pure HTML, CSS, and JavaScript - no framework',
        icon: '🌐',
        category: 'frontend',
        languages: ['html', 'css', 'javascript'],
        features: ['Simple', 'No build step', 'Fast loading'],
        difficulty: 'beginner',
        isPopular: true,
    },
    {
        id: 'react',
        name: 'React',
        description: 'Component-based UI library by Meta',
        icon: '⚛️',
        category: 'frontend',
        languages: ['javascript', 'typescript', 'jsx', 'tsx'],
        features: ['Virtual DOM', 'Components', 'Hooks', 'Large ecosystem'],
        difficulty: 'intermediate',
        isPopular: true,
    },
    {
        id: 'vue',
        name: 'Vue.js',
        description: 'Progressive JavaScript framework',
        icon: '💚',
        category: 'frontend',
        languages: ['javascript', 'typescript', 'vue'],
        features: ['Reactive', 'Easy to learn', 'Single-file components'],
        difficulty: 'beginner',
        isPopular: true,
    },
    {
        id: 'svelte',
        name: 'Svelte',
        description: 'Compile-time framework with no virtual DOM',
        icon: '🔥',
        category: 'frontend',
        languages: ['javascript', 'typescript', 'svelte'],
        features: ['No runtime', 'Fast', 'Less boilerplate'],
        difficulty: 'intermediate',
        isNew: true,
    },
    {
        id: 'angular',
        name: 'Angular',
        description: 'Full-featured framework by Google',
        icon: '🅰️',
        category: 'frontend',
        languages: ['typescript'],
        features: ['TypeScript', 'RxJS', 'CLI', 'Enterprise-ready'],
        difficulty: 'advanced',
    },

    // Fullstack
    {
        id: 'nextjs',
        name: 'Next.js',
        description: 'React framework with SSR and API routes',
        icon: '▲',
        category: 'fullstack',
        languages: ['javascript', 'typescript', 'jsx', 'tsx'],
        features: ['SSR', 'SSG', 'API Routes', 'Image optimization'],
        difficulty: 'intermediate',
        isPopular: true,
    },
    {
        id: 'nuxt',
        name: 'Nuxt.js',
        description: 'Vue.js framework with SSR',
        icon: '💚',
        category: 'fullstack',
        languages: ['javascript', 'typescript', 'vue'],
        features: ['SSR', 'Auto-routing', 'Modules'],
        difficulty: 'intermediate',
    },
    {
        id: 'sveltekit',
        name: 'SvelteKit',
        description: 'Svelte framework for web apps',
        icon: '🔥',
        category: 'fullstack',
        languages: ['javascript', 'typescript', 'svelte'],
        features: ['SSR', 'Adapters', 'File routing'],
        difficulty: 'intermediate',
        isNew: true,
    },
    {
        id: 'remix',
        name: 'Remix',
        description: 'Full-stack React framework',
        icon: '💿',
        category: 'fullstack',
        languages: ['javascript', 'typescript', 'jsx', 'tsx'],
        features: ['Nested routes', 'Form handling', 'Edge-first'],
        difficulty: 'intermediate',
        isNew: true,
    },
    {
        id: 'astro',
        name: 'Astro',
        description: 'The all-in-one web framework',
        icon: '🚀',
        category: 'fullstack',
        languages: ['javascript', 'typescript', 'astro'],
        features: ['Islands', 'Zero JS by default', 'Multi-framework'],
        difficulty: 'beginner',
        isNew: true,
        isPopular: true,
    },

    // Backend
    {
        id: 'express',
        name: 'Express.js',
        description: 'Fast, unopinionated Node.js framework',
        icon: '🟢',
        category: 'backend',
        languages: ['javascript', 'typescript'],
        features: ['Minimal', 'Middleware', 'REST APIs'],
        difficulty: 'beginner',
        isPopular: true,
    },
    {
        id: 'fastapi',
        name: 'FastAPI',
        description: 'Modern Python API framework',
        icon: '🐍',
        category: 'backend',
        languages: ['python'],
        features: ['Async', 'Type hints', 'Auto docs', 'Fast'],
        difficulty: 'intermediate',
        isPopular: true,
    },
    {
        id: 'django',
        name: 'Django',
        description: 'High-level Python web framework',
        icon: '🎸',
        category: 'backend',
        languages: ['python'],
        features: ['ORM', 'Admin panel', 'Batteries included'],
        difficulty: 'intermediate',
    },
    {
        id: 'flask',
        name: 'Flask',
        description: 'Lightweight Python web framework',
        icon: '🧪',
        category: 'backend',
        languages: ['python'],
        features: ['Minimal', 'Flexible', 'Extensions'],
        difficulty: 'beginner',
    },

    // Mobile
    {
        id: 'react-native',
        name: 'React Native',
        description: 'Build native mobile apps with React',
        icon: '📱',
        category: 'mobile',
        languages: ['javascript', 'typescript', 'jsx', 'tsx'],
        features: ['Cross-platform', 'Native components', 'Hot reload'],
        difficulty: 'intermediate',
        isPopular: true,
    },
    {
        id: 'flutter',
        name: 'Flutter',
        description: 'Google\'s UI toolkit for mobile',
        icon: '🦋',
        category: 'mobile',
        languages: ['dart'],
        features: ['Cross-platform', 'Hot reload', 'Material Design'],
        difficulty: 'intermediate',
        isPopular: true,
    },
];

// Styling Options
export const STYLING_OPTIONS: TechStack[] = [
    {
        id: 'css',
        name: 'Vanilla CSS',
        category: 'styling',
        icon: '🎨',
        description: 'Plain CSS with modern features',
    },
    {
        id: 'tailwind',
        name: 'Tailwind CSS',
        category: 'styling',
        icon: '🌊',
        description: 'Utility-first CSS framework',
    },
    {
        id: 'scss',
        name: 'SCSS/Sass',
        category: 'styling',
        icon: '💅',
        description: 'CSS preprocessor with variables and nesting',
    },
    {
        id: 'styled-components',
        name: 'Styled Components',
        category: 'styling',
        icon: '💄',
        description: 'CSS-in-JS for React',
    },
    {
        id: 'chakra',
        name: 'Chakra UI',
        category: 'styling',
        icon: '⚡',
        description: 'Accessible component library',
    },
    {
        id: 'shadcn',
        name: 'shadcn/ui',
        category: 'styling',
        icon: '🎭',
        description: 'Beautiful components built with Radix',
    },
];

// Database Options
export const DATABASE_OPTIONS: TechStack[] = [
    {
        id: 'none',
        name: 'No Database',
        category: 'database',
        icon: '❌',
        description: 'Static app with localStorage',
    },
    {
        id: 'supabase',
        name: 'Supabase',
        category: 'database',
        icon: '⚡',
        description: 'Open source Firebase alternative',
    },
    {
        id: 'firebase',
        name: 'Firebase',
        category: 'database',
        icon: '🔥',
        description: 'Google\'s BaaS platform',
    },
    {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'database',
        icon: '🍃',
        description: 'NoSQL document database',
    },
    {
        id: 'postgresql',
        name: 'PostgreSQL',
        category: 'database',
        icon: '🐘',
        description: 'Powerful SQL database',
    },
    {
        id: 'prisma',
        name: 'Prisma',
        category: 'database',
        icon: '◭',
        description: 'Next-gen Node.js ORM',
    },
];

// Feature Options
export const FEATURE_OPTIONS = [
    { id: 'auth', name: 'Authentication', icon: '🔐', description: 'User login/signup' },
    { id: 'darkmode', name: 'Dark Mode', icon: '🌙', description: 'Theme toggle' },
    { id: 'responsive', name: 'Responsive', icon: '📱', description: 'Mobile-friendly' },
    { id: 'animations', name: 'Animations', icon: '✨', description: 'Smooth transitions' },
    { id: 'pwa', name: 'PWA', icon: '📲', description: 'Installable app' },
    { id: 'seo', name: 'SEO', icon: '🔍', description: 'Search optimized' },
    { id: 'api', name: 'API Integration', icon: '🔌', description: 'External APIs' },
    { id: 'forms', name: 'Forms', icon: '📝', description: 'Form handling' },
    { id: 'charts', name: 'Charts', icon: '📊', description: 'Data visualization' },
    { id: 'i18n', name: 'i18n', icon: '🌍', description: 'Multi-language' },
];

// MCP (Model Context Protocol) Options
export const MCP_OPTIONS = [
    {
        id: 'supabase-mcp',
        name: 'Supabase MCP',
        icon: '⚡',
        description: 'Database operations via MCP',
        features: ['CRUD operations', 'Real-time', 'Auth'],
    },
    {
        id: 'firebase-mcp',
        name: 'Firebase MCP',
        icon: '🔥',
        description: 'Firebase services via MCP',
        features: ['Firestore', 'Auth', 'Storage'],
    },
    {
        id: 'github-mcp',
        name: 'GitHub MCP',
        icon: '🐙',
        description: 'GitHub operations via MCP',
        features: ['Repos', 'Issues', 'PRs'],
    },
    {
        id: 'web-search-mcp',
        name: 'Web Search MCP',
        icon: '🔍',
        description: 'Search the web for info',
        features: ['Research', 'Documentation', 'Examples'],
    },
];

// Project Templates
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: 'landing-page',
        name: 'Landing Page',
        description: 'Beautiful marketing landing page',
        framework: 'vanilla',
        styling: 'css',
        features: ['responsive', 'animations', 'seo'],
        difficulty: 'beginner',
        estimatedTime: '2-5 mins',
    },
    {
        id: 'dashboard',
        name: 'Admin Dashboard',
        description: 'Analytics dashboard with charts',
        framework: 'react',
        styling: 'tailwind',
        features: ['darkmode', 'responsive', 'charts'],
        difficulty: 'intermediate',
        estimatedTime: '5-10 mins',
    },
    {
        id: 'ecommerce',
        name: 'E-commerce Store',
        description: 'Online shop with cart',
        framework: 'nextjs',
        styling: 'tailwind',
        features: ['responsive', 'forms', 'api'],
        difficulty: 'advanced',
        estimatedTime: '10-15 mins',
    },
    {
        id: 'blog',
        name: 'Blog Platform',
        description: 'Content-focused blog site',
        framework: 'astro',
        styling: 'css',
        features: ['seo', 'darkmode', 'responsive'],
        difficulty: 'beginner',
        estimatedTime: '3-5 mins',
    },
    {
        id: 'saas',
        name: 'SaaS App',
        description: 'Full SaaS application',
        framework: 'nextjs',
        styling: 'shadcn',
        features: ['auth', 'darkmode', 'api', 'forms'],
        difficulty: 'advanced',
        estimatedTime: '15-20 mins',
    },
    {
        id: 'portfolio',
        name: 'Portfolio',
        description: 'Personal portfolio website',
        framework: 'vanilla',
        styling: 'css',
        features: ['responsive', 'animations', 'seo'],
        difficulty: 'beginner',
        estimatedTime: '2-5 mins',
    },
];

// Helper functions
export const getFrameworkById = (id: string) => FRAMEWORKS.find(f => f.id === id);
export const getFrameworksByCategory = (category: Framework['category']) =>
    FRAMEWORKS.filter(f => f.category === category);
export const getPopularFrameworks = () => FRAMEWORKS.filter(f => f.isPopular);
export const getNewFrameworks = () => FRAMEWORKS.filter(f => f.isNew);

// Generate prompt based on selections
export function generateProjectPrompt(config: {
    projectType: string;
    framework: string;
    styling: string;
    features: string[];
    description: string;
    database?: string;
}): string {
    const framework = getFrameworkById(config.framework);
    const styling = STYLING_OPTIONS.find(s => s.id === config.styling);
    const features = config.features
        .map(f => FEATURE_OPTIONS.find(o => o.id === f)?.name)
        .filter(Boolean)
        .join(', ');

    let prompt = `Create a ${config.projectType}`;

    if (framework) {
        prompt += ` using ${framework.name}`;
    }

    if (styling && styling.id !== 'css') {
        prompt += ` with ${styling.name} for styling`;
    }

    if (config.description) {
        prompt += `. ${config.description}`;
    }

    if (features) {
        prompt += `. Include these features: ${features}`;
    }

    prompt += `. Make it modern, beautiful, and professional with animations and a polished UI.`;

    return prompt;
}
