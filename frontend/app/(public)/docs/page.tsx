'use client';

import { motion } from 'framer-motion';
import { Book, Terminal, Code, Settings, FileText } from 'lucide-react';
import Link from 'next/link';
import { Spotlight } from '@/components/ui/spotlight';

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-black overflow-x-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

            <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row gap-12 relative z-10">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    <div className="sticky top-24 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                            <Book className="h-5 w-5 text-primary" /> Documentation
                        </h3>
                        <nav className="space-y-3 text-sm text-muted-foreground">
                            <Link href="#introduction" className="block hover:text-primary transition-colors hover:translate-x-1 duration-200">Introduction</Link>
                            <Link href="#installation" className="block hover:text-primary transition-colors hover:translate-x-1 duration-200">Installation</Link>
                            <Link href="#configuration" className="block hover:text-primary transition-colors hover:translate-x-1 duration-200">Configuration</Link>
                            <Link href="#usage" className="block hover:text-primary transition-colors hover:translate-x-1 duration-200">Usage Guide</Link>
                            <Link href="#api-reference" className="block hover:text-primary transition-colors hover:translate-x-1 duration-200">API Reference</Link>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 space-y-16"
                >
                    <section id="introduction" className="space-y-6">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-xl">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                            v1.0 Docs
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            Introduction
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            CodeGenesis is an autonomous AI software architect capable of planning, building, and deploying
                            full-stack applications. It leverages advanced LLMs (Large Language Models) to understand
                            natural language requirements and translate them into production-ready code.
                        </p>
                    </section>

                    <section id="installation" className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Terminal className="h-6 w-6" />
                            </div>
                            Installation
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground mb-4">Clone the repository and install dependencies:</p>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                <pre className="relative bg-black border border-white/10 p-6 rounded-xl overflow-x-auto">
                                    <code className="text-sm font-mono text-slate-300">{`git clone https://github.com/aditya4232/CodeGenesis.git
cd CodeGenesis

# Install Backend Dependencies
cd backend
python -m venv venv
source venv/bin/activate  # or venv\\Scripts\\activate on Windows
pip install -r requirements.txt

# Install Frontend Dependencies
cd ../frontend
npm install`}</code>
                                </pre>
                            </div>
                        </div>
                    </section>

                    <section id="configuration" className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Settings className="h-6 w-6" />
                            </div>
                            Configuration
                        </h2>
                        <div className="prose prose-invert max-w-none space-y-4">
                            <p className="text-muted-foreground">
                                CodeGenesis requires an API key to function. You can use OpenAI, Anthropic, or any other
                                provider compatible with the Model Context Protocol (MCP).
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                                    <li>Navigate to the <strong className="text-white">Settings</strong> page in the dashboard.</li>
                                    <li>Select your preferred AI Provider (e.g., OpenAI).</li>
                                    <li>Enter your API Key.</li>
                                    <li>(Optional) Configure custom base URLs for local models.</li>
                                </ol>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 items-start">
                                <div className="p-1 bg-yellow-500/20 rounded-full shrink-0">
                                    <Settings className="h-4 w-4 text-yellow-500" />
                                </div>
                                <p className="text-yellow-500 text-sm leading-relaxed">
                                    <strong>Note:</strong> Your API keys are stored locally in your browser and are never sent to our servers.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="usage" className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Code className="h-6 w-6" />
                            </div>
                            Usage Guide
                        </h2>
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white">Creating a New Project</h3>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-2 text-muted-foreground">
                                <p>1. Go to the <strong className="text-white">Dashboard</strong>.</p>
                                <p>2. Click "New Project".</p>
                                <p>3. Describe your application in the chat interface.</p>
                                <p>4. The Architect Agent will propose a plan.</p>
                                <p>5. Approve the plan to start generation.</p>
                            </div>
                        </div>
                    </section>

                    <section id="api-reference" className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <FileText className="h-6 w-6" />
                            </div>
                            API Reference
                        </h2>
                        <p className="text-muted-foreground">
                            For advanced usage and integration, refer to the full API documentation in the repository
                            <code className="mx-2 px-2 py-1 rounded bg-white/10 text-white text-sm">README.md</code> file.
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
