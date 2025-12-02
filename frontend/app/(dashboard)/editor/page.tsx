'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Play, Save, Download, FileCode, Terminal as TerminalIcon, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditorPage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setLogs(prev => [...prev, `> Analyzing prompt: "${prompt}"...`]);

        // Simulate generation process
        setTimeout(() => {
            setLogs(prev => [...prev, '> Architect Agent: Planning file structure...']);
        }, 1000);

        setTimeout(() => {
            setLogs(prev => [...prev, '> Engineer Agent: Writing code for components...']);
        }, 2500);

        setTimeout(() => {
            setLogs(prev => [...prev, '> TestSprite: Generating test cases...']);
            setIsGenerating(false);
        }, 4000);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Left Panel - File Explorer */}
            <Card className="w-64 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 font-medium flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Files
                </div>
                <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {['src', 'components', 'App.tsx', 'index.css', 'package.json'].map((file) => (
                        <div key={file} className="px-3 py-2 rounded-md hover:bg-accent cursor-pointer text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <FileCode className="h-4 w-4 opacity-50" />
                            {file}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Center Panel - Code Editor */}
            <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">App.tsx</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-accent">TypeScript</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost"><Save className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost"><Play className="h-4 w-4 text-emerald-500" /></Button>
                    </div>
                </div>
                <div className="flex-1 p-4 font-mono text-sm bg-[#0d0d0d] text-gray-300 overflow-auto">
                    <pre>
                        <code>{`import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-4xl font-bold">Hello CodeGenesis</h1>
      <p className="mt-4 text-slate-400">
        Start building your AI-powered application today.
      </p>
    </div>
  );
}`}</code>
                    </pre>
                </div>
            </Card>

            {/* Right Panel - AI Chat & Terminal */}
            <div className="w-80 flex flex-col gap-6">
                {/* AI Chat */}
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 font-medium flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-primary" />
                        AI Architect
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Cpu className="h-4 w-4 text-primary" />
                            </div>
                            <div className="bg-accent rounded-lg p-3 text-sm text-muted-foreground">
                                Describe the app you want to build, and I'll handle the rest.
                            </div>
                        </div>
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xs font-mono text-primary/80 pl-11"
                            >
                                {log}
                            </motion.div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-border bg-background/50">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Describe your app..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                disabled={isGenerating}
                                className="bg-background"
                            />
                            <Button size="icon" onClick={handleGenerate} disabled={isGenerating} variant={isGenerating ? "outline" : "default"}>
                                {isGenerating ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Terminal Output */}
                <Card className="h-48 flex flex-col overflow-hidden bg-black border-border/50">
                    <div className="p-2 border-b border-white/10 bg-white/5 text-xs font-mono text-muted-foreground flex items-center gap-2">
                        <TerminalIcon className="h-3 w-3" />
                        Terminal
                    </div>
                    <div className="flex-1 p-3 font-mono text-xs text-emerald-500/80 overflow-y-auto">
                        <div>$ npm run dev</div>
                        <div>ready - started server on 0.0.0.0:3000, url: http://localhost:3000</div>
                        <div>event - compiled client and server successfully in 1245 ms (156 modules)</div>
                        <div>wait  - compiling...</div>
                        <div>event - compiled client and server successfully in 321 ms (156 modules)</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
