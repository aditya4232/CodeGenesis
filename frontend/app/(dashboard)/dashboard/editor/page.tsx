"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Send, Download, Code2, Eye, Sparkles, Plus, Trash2,
    Settings as SettingsIcon, Loader2, Image as ImageIcon, Link, MessageSquarePlus, FileEdit,
    Archive, Globe, Palette, ExternalLink, Save, Monitor, Smartphone, Tablet,
    FolderTree, X, CheckCircle2, AlertCircle, Terminal as TerminalIcon, GitBranch,
    Home, FolderKanban, Settings2, ChevronDown, Undo2, Redo2, Copy, History,
    Play, Square, LayoutTemplate, MousePointer2, RefreshCw, Key, ArrowRight, CheckSquare, Rocket
} from "lucide-react"
import { toast } from "sonner"
import { downloadProjectAsZip } from "@/lib/zip-utils"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NewProjectModal } from "@/components/modals/new-project-modal"
import { Checkbox } from "@/components/ui/checkbox"

// --- Markdown & Visual Parser ---
const MarkdownRenderer = ({ content }: { content: string }) => {
    // Basic Markdown Parser (Regex based for Zero Dependencies)
    const formattedContent = useCallback(() => {
        let text = content;

        // Code Blocks (``` ... ```)
        text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre class="bg-black/40 p-4 rounded-xl border border-white/10 my-4 font-mono text-[10px] overflow-x-auto text-emerald-300"><code>${code.trim()}</code></pre>`;
        });

        // Tables (| col | col |)
        text = text.replace(/^\|(.+)\|$\n^\|([-| ]+)\|$\n((?:^\|.+\|$\n?)+)/gm, (match, header, separator, rows) => {
            const hCols = header.split('|').filter(Boolean).map((c: string) => c.trim());
            const rRows = rows.split('\n').filter(Boolean).map((r: string) => r.split('|').filter(Boolean).map(c => c.trim()));

            return `
                <div class="overflow-x-auto my-4 rounded-xl border border-white/10 bg-white/5">
                    <table class="w-full text-[11px] text-left">
                        <thead class="bg-white/5 text-white/50 font-mono uppercase tracking-wider">
                            <tr>${hCols.map((c: any) => `<th class="px-3 py-2 font-semibold">${c}</th>`).join('')}</tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            ${rRows.map((row: any) => `<tr>${row.map((c: any) => `<td class="px-3 py-2 text-white/80">${c}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        // Headings (###)
        text = text.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-white mt-8 mb-4 tracking-tight border-b border-white/10 pb-4">$1</h1>');
        text = text.replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold text-white mt-4 mb-2">$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2 class="text-base font-extrabold text-white mt-6 mb-3 border-b border-white/5 pb-1">$1</h2>');

        // Bold (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-400 font-semibold">$1</strong>');

        // Task Lists (- [ ] or - [x])
        text = text.replace(/^\s*[\*\-]\s+\[ \]\s+(.*$)/gm, '<li class="ml-4 mb-2 text-white/60 list-none flex items-start gap-2"><div class="h-4 w-4 rounded border border-white/20 mt-0.5 shrink-0" /><span>$1</span></li>');
        text = text.replace(/^\s*[\*\-]\s+\[x\]\s+(.*$)/gm, '<li class="ml-4 mb-2 text-emerald-400 list-none flex items-start gap-2"><div class="h-4 w-4 rounded border border-emerald-500 bg-emerald-500/20 mt-0.5 shrink-0 flex items-center justify-center text-[10px]">✓</div><span class="line-through opacity-50">$1</span></li>');

        // Inline Code (`text`)
        text = text.replace(/`([^`]+)`/g, '<code class="bg-indigo-500/10 text-indigo-300 px-1 py-0.5 rounded font-mono text-[10px]">$1</code>');

        // Lists (* or -)
        text = text.replace(/^\s*[\*\-]\s+(.*$)/gm, '<li class="ml-4 mb-1 text-white/70 list-disc marker:text-indigo-500">$1</li>');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 transition-colors">$1</a>');

        // Line breaks
        text = text.replace(/\n\n/g, '<div class="h-2"></div>');

        return text;
    }, [content]);

    return (
        <div
            className="prose prose-invert max-w-none text-xs leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedContent() }}
        />
    );
};

// Dynamic imports for heavy components
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then(mod => mod.default), { ssr: false, loading: () => <div className="h-full w-full bg-[#1e1e1e] animate-pulse" /> })
const MonacoDiffEditor = dynamic(() => import("@monaco-editor/react").then(mod => mod.DiffEditor), { ssr: false })

// Types
interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'plan' | 'code' | 'doc';
    planData?: PlanData;
    filesChanged?: string[];
    timestamp?: string;
}
interface PlanData {
    content: string;
    steps: { id: string; title: string; description: string; status?: 'pending' | 'completed' }[];
}
interface ProjectFile { name: string; content: string; language: string; isModified?: boolean; previousContent?: string }
interface ChatSession { id: string; name: string; messages: Message[]; createdAt: string }
interface ProjectConfig { name: string; framework: string; styling: string; features: string[] }

const FRAMEWORKS = {
    vanilla: { name: 'Vanilla', icon: '🌐', color: 'bg-yellow-500' },
    react: { name: 'React', icon: '⚛️', color: 'bg-cyan-500' },
    nextjs: { name: 'Next.js', icon: '▲', color: 'bg-white' },
    vue: { name: 'Vue', icon: '💚', color: 'bg-green-500' },
    svelte: { name: 'Svelte', icon: '🔥', color: 'bg-orange-500' }
}

const PROVIDERS = {
    groq: { name: "Groq", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"], color: "bg-orange-500" },
    openrouter: { name: "OpenRouter", models: ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-3-70b-instruct", "anthropic/claude-3-haiku"], color: "bg-blue-500" },
    openai: { name: "OpenAI", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"], color: "bg-green-500" }
}

const FILE_ICONS: Record<string, string> = { 'html': '🌐', 'css': '🎨', 'js': '📒', 'jsx': '⚛️', 'ts': '📘', 'tsx': '⚛️', 'json': '📋' }
const getFileIcon = (n: string) => FILE_ICONS[n.split('.').pop() || ''] || '📄'

export default function EditorPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const projectId = searchParams.get("id")

    // Core State
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>({ name: "Untitled Project", framework: "vanilla", styling: "css", features: [] })
    const [files, setFiles] = useState<ProjectFile[]>([])
    const [activeFile, setActiveFile] = useState("index.html")
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
    const [activeChatId, setActiveChatId] = useState('')

    // UI State
    const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'diff' | 'terminal' | 'visual'>('preview')
    const [input, setInput] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [streamingCode, setStreamingCode] = useState("")
    const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ System ready...'])
    const [showSettings, setShowSettings] = useState(false)
    const [showNewProject, setShowNewProject] = useState(false)
    const [previewKey, setPreviewKey] = useState(0)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Settings
    const [provider, setProvider] = useState<keyof typeof PROVIDERS>("groq")
    const [model, setModel] = useState(PROVIDERS["groq"].models[0])
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({})

    // Initialize
    useEffect(() => {
        const storedKeys = localStorage.getItem("codegenesis_api_keys")
        if (storedKeys) setApiKeys(JSON.parse(storedKeys))

        if (projectId) {
            loadProject()
        } else {
            setChatSessions([{
                id: '1', name: 'New Chat', createdAt: new Date().toISOString(),
                messages: [{ role: 'assistant', content: '### Neural link Established\n\nI am **CodeGenesis AI** (v2.6). I have initialized my architectural protocols.\n\nWhat visionary project shall we project onto the digital canvas today?', type: 'text' }]
            }])
            setActiveChatId('1')
        }
    }, [projectId])

    // Update model when provider changes
    useEffect(() => {
        setModel(PROVIDERS[provider].models[0])
    }, [provider])

    // Scroll to bottom of chat
    const scrollToBottom = useCallback(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            // Fallback for some browsers/situations
            const viewport = chatEndRef.current.closest('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [chatSessions, streamingCode, scrollToBottom])

    const loadProject = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/data`)
            if (res.ok) {
                const data = await res.json()
                setProjectConfig({
                    name: data.project.name || "Untitled",
                    framework: data.project.framework || 'vanilla',
                    styling: 'css',
                    features: []
                })
                if (data.files?.length) {
                    setFiles(data.files.map((f: any) => ({ name: f.name, content: f.content, language: f.language || 'plaintext' })))
                    setActiveFile(data.files[0].name)
                }
                if (data.chats?.length) {
                    setChatSessions(data.chats.map((c: any) => ({
                        id: c.id, name: c.name, createdAt: c.created_at,
                        messages: c.messages || []
                    })))
                    setActiveChatId(data.chats[0].id)
                } else {
                    setChatSessions([{ id: '1', name: 'Main Chat', messages: [], createdAt: new Date().toISOString() }])
                    setActiveChatId('1')
                }
            } else {
                toast.error("Project not found")
                router.push('/dashboard')
            }
        } catch (e) { toast.error("Failed to load project") }
    }

    const saveKeys = (newKeys: Record<string, string>) => {
        setApiKeys(newKeys)
        localStorage.setItem("codegenesis_api_keys", JSON.stringify(newKeys))
        toast.success("API keys saved")
    }

    // AI Generation Handler
    const handleSend = async (customInput?: string) => {
        const textToSend = customInput || input
        if (!textToSend.trim() || isGenerating) return

        const key = apiKeys[provider]
        if (!key) {
            toast.error(`Please set ${provider} API key in Settings`)
            setShowSettings(true)
            return
        }

        const userMsg: Message = { role: 'user', content: textToSend, type: 'text' }
        setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMsg] } : c))

        setIsGenerating(true)
        setInput("")
        setTerminalOutput(prev => [...prev, `$ User: ${textToSend}`, `$ Processing...`])

        try {
            // Prepare context
            const currentChat = chatSessions.find(c => c.id === activeChatId)
            const history = currentChat ? [...currentChat.messages, userMsg].map(m => ({ role: m.role, content: m.content })) : []
            const fileContext = files.reduce((acc, f) => ({ ...acc, [f.name]: f.content }), {})

            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history,
                    model,
                    provider,
                    apiKey: key,
                    files: fileContext
                })
            })

            const reader = res.body?.getReader()
            if (!reader) throw new Error("Stream failed")

            const decoder = new TextDecoder()
            let fullResponse = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            if (data.content) {
                                fullResponse += data.content
                                setStreamingCode(fullResponse)
                            }
                        } catch { }
                    }
                }
            }

            // Extract JSON blocks for specialized handling
            let finalMessage: Message = { role: 'assistant', content: fullResponse, type: 'text' }
            let newFiles = [...files]
            let filesChanged: string[] = []

            // Attempt to parse JSON - either inside markdown blocks or raw
            // Attempt to parse JSON - Robust Strategy
            let jsonData: any = null
            const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/)

            if (jsonMatch) {
                try { jsonData = JSON.parse(jsonMatch[1]) } catch { }
            }

            if (!jsonData) {
                const firstOpen = fullResponse.indexOf('{');
                const lastClose = fullResponse.lastIndexOf('}');
                if (firstOpen !== -1 && lastClose > firstOpen) {
                    try { jsonData = JSON.parse(fullResponse.substring(firstOpen, lastClose + 1)) } catch { }
                }
            }

            if (jsonData) {
                try {
                    if (jsonData.type === 'plan') {
                        finalMessage = {
                            role: 'assistant',
                            content: jsonData.content || jsonData.thought || "I've created a plan:",
                            type: 'plan',
                            planData: {
                                content: jsonData.content || jsonData.thought,
                                steps: jsonData.steps
                            }
                        }
                        setTerminalOutput(prev => [...prev, `$ Plan proposed. Waiting for user approval.`])
                    }
                    else if (jsonData.type === 'doc') {
                        finalMessage = {
                            role: 'assistant',
                            content: jsonData.content || "Generating document...",
                            type: 'doc'
                        }
                    }
                    else if (jsonData.type === 'chat') {
                        finalMessage = {
                            role: 'assistant',
                            content: jsonData.content || jsonData.thought || fullResponse,
                            type: 'text'
                        }
                    }
                    else if (jsonData.type === 'code') {
                        finalMessage = {
                            role: 'assistant',
                            content: jsonData.thought || jsonData.content || "Generating code...",
                            type: 'code',
                            filesChanged: jsonData.files?.map((f: any) => f.name) || []
                        }

                        // Apply file changes
                        if (jsonData.files && Array.isArray(jsonData.files)) {
                            jsonData.files.forEach((f: any) => {
                                const idx = newFiles.findIndex(existing => existing.name === f.name)
                                const newFileObj = {
                                    name: f.name,
                                    content: f.content,
                                    language: f.name.split('.').pop() || 'plaintext',
                                    isModified: true,
                                    previousContent: idx >= 0 ? newFiles[idx].content : ''
                                }

                                if (idx >= 0) newFiles[idx] = newFileObj
                                else newFiles.push(newFileObj)

                                filesChanged.push(f.name)
                                if (!activeFile && f.name.includes('html')) setActiveFile(f.name)
                            })
                            setFiles(newFiles)
                            setPreviewKey(k => k + 1)
                            setTerminalOutput(prev => [...prev, `$ Applied changes to ${filesChanged.length} files.`])
                        }
                    }
                } catch (e) {
                    console.error("Specialized JSON processing failed", e)
                }
            }

            setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, finalMessage] } : c))

            // Background Save
            if (projectId) {
                await fetch(`/api/projects/${projectId}/data`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: newFiles, chats: chatSessions, projectName: projectConfig.name })
                })
            }

        } catch (e: any) {
            toast.error(e.message)
            setTerminalOutput(prev => [...prev, `$ Error: ${e.message}`])
        } finally {
            setIsGenerating(false)
            setStreamingCode("")
        }
    }

    const getPreviewHtml = useCallback(() => {
        const html = files.find(f => f.name.includes('.html'))?.content || ''
        const css = files.find(f => f.name.endsWith('.css'))?.content || ''
        const js = files.find(f => f.name.endsWith('.js'))?.content || ''

        if (!html && files.length > 0) return `<html><body><h2 style="color:white;font-family:sans-serif;text-align:center;margin-top:20%">No HTML file found</h2></body></html>`
        if (!html) return ''

        let preview = html
        if (!preview.includes('<style>') && css) preview = preview.replace('</head>', `<style>${css}</style></head>`)
        if (!preview.includes('<script>') && js) preview = preview.replace('</body>', `<script>${js}</script></body>`)

        // Visual Editor Script
        const visualEditorScript = `
            <script>
                (function() {
                    const style = document.createElement('style');
                    style.innerHTML = '.cg-editable:hover { outline: 2px solid #6366f1 !important; outline-offset: 4px !important; border-radius: 4px !important; cursor: pointer !important; }';
                    document.head.appendChild(style);

                    document.addEventListener('mouseover', e => {
                        const el = e.target.closest('h1, h2, h3, p, button, a, span');
                        if (el) {
                            el.style.outline = '2px solid #6366f1';
                            el.style.cursor = 'pointer';
                            el.classList.add('cg-editable');
                        }
                    });

                    document.addEventListener('mouseout', e => {
                        if (e.target.style) e.target.style.outline = '';
                    });

                    document.addEventListener('click', e => {
                        const el = e.target.closest('h1, h2, h3, p, button, a, span');
                        if (!el) return;
                        e.preventDefault();
                        e.stopPropagation();
                        const text = prompt('Neural Edit:', el.innerText.trim());
                        if (text !== null) el.innerText = text;
                    });
                })();
            </script>
        `;
        if (activeTab === 'visual') preview += visualEditorScript;

        return preview;
    }, [files, activeTab])


    const fw = FRAMEWORKS[projectConfig.framework as keyof typeof FRAMEWORKS]
    const activeFileContent = files.find(f => f.name === activeFile)?.content || ''
    const hasFiles = files.length > 0

    return (
        <TooltipProvider>
            <div className="h-screen flex flex-col bg-[#09090b] text-white overflow-hidden">
                {/* Header */}
                <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:bg-white/5 font-semibold">
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    CodeGenesis
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#151515] border-white/10 w-56">
                                <DropdownMenuItem onClick={() => router.push('/dashboard')}><Home className="h-4 w-4 mr-2" /> Dashboard</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/dashboard/projects')}><FolderKanban className="h-4 w-4 mr-2" /> Projects</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={() => setShowSettings(true)}><Settings2 className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-4 w-px bg-white/10" />

                        <div className="flex items-center gap-2">
                            <span className="text-xl">{fw?.icon}</span>
                            <input
                                value={projectConfig.name}
                                onChange={(e) => setProjectConfig(p => ({ ...p, name: e.target.value }))}
                                className="bg-transparent border-none focus:ring-0 font-medium w-40 truncate text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Model Selector Group */}
                        <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
                            <Select value={provider} onValueChange={(val: any) => setProvider(val)}>
                                <SelectTrigger className="w-[120px] h-8 bg-transparent border-none text-xs gap-2 focus:ring-0"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-[#151515] border-white/10 text-white">
                                    {Object.keys(PROVIDERS).map(k => <SelectItem key={k} value={k}>{PROVIDERS[k as keyof typeof PROVIDERS].name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger className="w-[180px] h-8 bg-transparent border-none text-xs gap-2 focus:ring-0 text-white/70"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-[#151515] border-white/10 text-white">
                                    {PROVIDERS[provider].models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/5" onClick={() => loadProject()}>
                                        <Undo2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reset / Reload</TooltipContent>
                            </Tooltip>

                            <Button variant="outline" size="sm" className="h-9 bg-white/5 border-white/10 gap-2 hover:bg-white/10" onClick={() => downloadProjectAsZip(projectConfig.name, files)}>
                                <Download className="h-4 w-4" /> Export
                            </Button>

                            <Button size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-500 gap-2 shadow-lg shadow-indigo-500/20" onClick={() => setShowNewProject(true)}>
                                <Plus className="h-4 w-4" /> New
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Main Workspace */}
                <ResizablePanelGroup direction="horizontal" className="flex-1">
                    {/* Sidebar (Chat & Files) */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-[#0c0c0e] border-r border-white/5 flex flex-col">
                        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                            <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none px-2 h-11 items-center gap-2">
                                <TabsTrigger value="chat" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-md px-4 py-1.5 text-xs text-white/50 transition-all">Chat</TabsTrigger>
                                <TabsTrigger value="files" className="data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-md px-4 py-1.5 text-xs text-white/50 transition-all">Files</TabsTrigger>
                            </TabsList>

                            <TabsContent value="chat" className="flex-1 flex flex-col data-[state=inactive]:hidden m-0 relative overflow-hidden min-h-0">
                                <ScrollArea className="flex-1 min-h-0 w-full">
                                    <div className="p-4 flex flex-col min-h-full">
                                        {chatSessions.find(c => c.id === activeChatId)?.messages.length === 0 && (
                                            <div className="text-center text-white/40 mt-10">
                                                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50 text-indigo-500" />
                                                <p className="text-sm font-bold text-white">CodeGenesis AI v2.6</p>
                                                <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Neural Core Active</p>
                                                <div className="mt-4 px-6 text-xs text-white/40 leading-relaxed">
                                                    Initialize a build by describing your vision. I will analyze requirements via MCQ protocol and project the architecture.
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-6 pb-4">
                                            {chatSessions.find(c => c.id === activeChatId)?.messages.map((m, i) => (
                                                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[95%] rounded-2xl px-5 py-3 text-sm shadow-sm ${m.role === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                        : 'bg-[#1a1a1c] border border-white/5 text-gray-200 rounded-tl-sm'
                                                        }`}>
                                                        {/* Text Content */}
                                                        {/* Doc UI */}
                                                        {m.type === 'doc' ? (
                                                            <div className="bg-[#0c0c0e] p-8 rounded-2xl border border-white/10 shadow-2xl my-2 max-w-3xl w-full mx-auto relative overflow-hidden group">
                                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                                    <FileEdit className="h-24 w-24 text-indigo-500" />
                                                                </div>
                                                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5 relative z-10">
                                                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                                        <FileEdit className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs font-mono uppercase tracking-widest text-indigo-400">Generated Report</div>
                                                                        <div className="text-sm text-white/60">Neural Analysis v2.7</div>
                                                                    </div>
                                                                </div>
                                                                <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-indigo-300 relative z-10" dangerouslySetInnerHTML={{ __html: m.content }} />
                                                            </div>
                                                        ) : (
                                                            <MarkdownRenderer content={m.content} />
                                                        )}

                                                        {/* Plan UI */}
                                                        {m.type === 'plan' && m.planData && (
                                                            <div className="mt-4 bg-black/20 rounded-xl p-3 border border-white/5 space-y-3">
                                                                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                                                                    <GitBranch className="h-3.5 w-3.5" /> Implementation Plan
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {m.planData.steps.map((step) => (
                                                                        <div key={step.id} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                                                                            <div className="mt-0.5">
                                                                                <CheckSquare className="h-4 w-4 text-white/20" />
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-xs font-medium text-white">{step.title}</div>
                                                                                <div className="text-[10px] text-white/50">{step.description}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 mt-2 h-8 text-xs gap-2"
                                                                    onClick={() => handleSend("Looks good, proceed with generating the code.")}
                                                                >
                                                                    <Play className="h-3 w-3" /> Approve & Build
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Files Changed UI */}
                                                        {m.filesChanged && m.filesChanged.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                                                                {m.filesChanged.map(f => (
                                                                    <Badge key={f} variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer px-2 py-0.5" onClick={() => { setActiveFile(f); setActiveTab('code') }}>
                                                                        <FileEdit className="h-3 w-3 mr-1" /> {f}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-white/20 mt-1 px-1">{m.role === 'user' ? 'You' : 'CodeGenesis AI'}</span>
                                                </div>
                                            ))}

                                            {/* Streaming Indicator */}
                                            {isGenerating && (
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-[#1a1a1c] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-3">
                                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                                            {streamingCode ? 'Writing code...' : 'Thinking...'}
                                                        </div>
                                                        {streamingCode && (
                                                            <div className="mt-2 text-xs text-gray-500 font-mono line-clamp-3 opacity-50">
                                                                {streamingCode.slice(-100)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>
                                    </div>
                                </ScrollArea>

                                <div className="p-4 bg-[#0a0a0a] border-t border-white/10 space-y-3">
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-white/30 hover:text-white bg-white/5 border border-white/5 rounded-lg px-2 gap-1.5" onClick={() => setInput(prev => prev + "\nContext URL: ")}>
                                            <Globe className="h-3 w-3" /> Add Link
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-white/30 hover:text-white bg-white/5 border border-white/5 rounded-lg px-2 gap-1.5" onClick={() => toast.info("Image upload coming soon to Neural Core.")}>
                                            <ImageIcon className="h-3 w-3" /> Add Image
                                        </Button>
                                    </div>
                                    <div className="relative group">
                                        <Textarea
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSend()
                                                }
                                            }}
                                            placeholder="Ask CodeGenesis AI to build or edit..."
                                            className="bg-[#151515] border-white/10 min-h-[80px] max-h-[200px] pr-12 pt-3 resize-none text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-xl transition-all group-focus-within:bg-[#1a1a1a]"
                                        />
                                        <Button
                                            size="icon"
                                            className="absolute bottom-2 right-2 h-9 w-9 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-105"
                                            onClick={() => handleSend()}
                                            disabled={isGenerating || !input.trim()}
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="files" className="flex-1 data-[state=inactive]:hidden m-0">
                                <div className="p-2">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-white/60 mb-2 gap-2" onClick={() => {
                                        const name = prompt("File name:")
                                        if (name) {
                                            setFiles(prev => [...prev, { name, language: 'plaintext', content: '' }])
                                            setActiveFile(name)
                                            setActiveTab('code')
                                        }
                                    }}>
                                        <Plus className="h-3 w-3" /> New File
                                    </Button>
                                    {files.map(f => (
                                        <div
                                            key={f.name}
                                            onClick={() => { setActiveFile(f.name); setActiveTab('code') }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs mb-1 group transition-colors ${activeFile === f.name ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            <span>{getFileIcon(f.name)}</span>
                                            <span className="flex-1 truncate">{f.name}</span>
                                            {f.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                            <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-400 transition-opacity" onClick={(e) => {
                                                e.stopPropagation()
                                                setFiles(prev => prev.filter(file => file.name !== f.name))
                                            }} />
                                        </div>
                                    ))}
                                    {files.length === 0 && (
                                        <div className="text-center text-white/20 mt-10 text-xs">
                                            No files yet.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>

                    <ResizableHandle className="bg-white/5 w-1 hover:bg-indigo-500 transition-colors" />

                    {/* Editor Area */}
                    <ResizablePanel defaultSize={75}>
                        <div className="h-full flex flex-col bg-[#1e1e1e]">
                            {/* Tabs */}
                            <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] h-11">
                                <div className="flex">
                                    <button onClick={() => setActiveTab('preview')} className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-indigo-500 bg-[#1e1e1e] text-white' : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                                        <Eye className="h-3.5 w-3.5" /> Preview
                                    </button>
                                    <button onClick={() => setActiveTab('code')} className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'code' ? 'border-indigo-500 bg-[#1e1e1e] text-white' : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                                        <Code2 className="h-3.5 w-3.5" /> Code
                                    </button>
                                    <button onClick={() => setActiveTab('visual')} className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'visual' ? 'border-indigo-500 bg-[#1e1e1e] text-white' : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                                        <MousePointer2 className="h-3.5 w-3.5" /> Visual
                                    </button>
                                    <button onClick={() => setActiveTab('diff')} className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === 'diff' ? 'border-indigo-500 bg-[#1e1e1e] text-white' : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                                        <GitBranch className="h-3.5 w-3.5" /> Diff
                                    </button>
                                </div>

                                <div className="flex items-center px-4 gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button onClick={() => setPreviewKey(k => k + 1)} className="text-white/40 hover:text-white transition-colors p-1" ><RefreshCw className="h-3.5 w-3.5" /></button>
                                        </TooltipTrigger>
                                        <TooltipContent>Reload Preview</TooltipContent>
                                    </Tooltip>
                                    <div className="h-3 w-px bg-white/10" />
                                    <button onClick={() => setActiveTab('terminal')} className={`flex items-center gap-2 text-xs transition-colors px-2 py-1 rounded-md ${activeTab === 'terminal' ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/40 hover:text-white'}`}>
                                        <TerminalIcon className="h-3.5 w-3.5" /> Terminal
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
                                {/* Empty State */}
                                {!hasFiles && !isGenerating && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 space-y-6 animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 ring-4 ring-white/5">
                                            <Code2 className="h-10 w-10 text-indigo-400" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <h3 className="text-lg font-semibold text-white/80">Start Building</h3>
                                            <p className="text-sm max-w-xs mx-auto">Generate clear plans and production-ready code with CodeGenesis.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 max-w-lg w-full px-8">
                                            {["Create a SaaS Landing Page", "Build a Todo App with LocalStorage", "Design a Crypto Dashboard", "Create a Login & Signup Flow"].map(q => (
                                                <Button key={q} variant="outline" className="border-white/10 hover:bg-white/5 hover:border-indigo-500/50 bg-[#151515] h-auto py-3 text-xs justify-start text-left text-gray-400 hover:text-white transition-all" onClick={() => setInput(q)}>
                                                    <Sparkles className="h-3.5 w-3.5 mr-2 text-indigo-500" /> {q}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Preview */}
                                {(activeTab === 'preview' || activeTab === 'visual') && hasFiles && (
                                    <div className="absolute inset-0 bg-[#000] flex flex-col items-center justify-center p-8 text-black">
                                        <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-6xl h-full flex flex-col transition-all border border-gray-800 ring-4 ring-gray-900/50">
                                            <div className="h-9 bg-[#e5e5e5] flex items-center px-4 gap-2 border-b border-gray-300">
                                                <div className="flex gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                                </div>
                                                <div className="flex-1 text-center flex justify-center">
                                                    <div className="bg-white px-3 w-1/2 rounded-md text-[11px] py-1 text-gray-500 font-mono flex items-center justify-center gap-1 shadow-sm border border-gray-200">
                                                        <Globe className="h-3 w-3 opacity-50" />
                                                        localhost:3000
                                                    </div>
                                                </div>
                                                <div className="w-10"></div>
                                            </div>
                                            <div className="flex-1 relative bg-white">
                                                <iframe
                                                    key={previewKey}
                                                    srcDoc={getPreviewHtml()}
                                                    className="w-full h-full border-none bg-white font-sans"
                                                    sandbox="allow-scripts allow-modals"
                                                />
                                                {activeTab === 'visual' && (
                                                    <div className="absolute inset-0 pointer-events-none border-4 border-indigo-500/30 z-10 flex items-end justify-center pb-8 animate-in fade-in duration-300">
                                                        <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-xl shadow-indigo-600/30 text-sm flex items-center gap-2 pointer-events-auto hover:scale-105 transition-transform">
                                                            <MousePointer2 className="h-4 w-4" /> Visual Editing Mode
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Code */}
                                {activeTab === 'code' && hasFiles && (
                                    <MonacoEditor
                                        height="100%"
                                        theme="vs-dark"
                                        path={activeFile}
                                        defaultLanguage={files.find(f => f.name === activeFile)?.language || 'html'}
                                        value={activeFileContent}
                                        onChange={(val) => setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: val || '' } : f))}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            smoothScrolling: true
                                        }}
                                    />
                                )}

                                {/* Diff */}
                                {activeTab === 'diff' && hasFiles && (
                                    <MonacoDiffEditor
                                        height="100%"
                                        theme="vs-dark"
                                        original={files.find(f => f.name === activeFile)?.previousContent || ''}
                                        modified={activeFileContent}
                                        options={{
                                            readOnly: true,
                                            renderSideBySide: true,
                                            fontSize: 13,
                                            padding: { top: 16 }
                                        }}
                                    />
                                )}

                                {/* Terminal Overlay */}
                                {activeTab === 'terminal' && (
                                    <div className="absolute inset-0 bg-[#0c0c0e]/95 backdrop-blur-md font-mono p-4 text-sm overflow-auto z-20">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                                            <span className="text-white/40 text-xs">TERMINAL</span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/10" onClick={() => setActiveTab('code')}><X className="h-3 w-3" /></Button>
                                        </div>
                                        <div className="text-emerald-500 mb-2">➜  {projectConfig.name.toLowerCase().replace(/\s+/g, '-')} git:(main) </div>
                                        {terminalOutput.map((line, i) => (
                                            <div key={i} className={`mb-1 ${line.startsWith('$ Error') ? 'text-red-400' : 'text-gray-300'}`}>
                                                {line}
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-emerald-500">➜</span>
                                            <input
                                                className="bg-transparent border-none focus:ring-0 text-white w-full p-0 focus:outline-none placeholder-white/20"
                                                autoFocus
                                                placeholder="Type a command..."
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value
                                                        setTerminalOutput(p => [...p, `➜ ${val}`, `$ Command not found: ${val} (Terminal is simulated)`])
                                                        e.currentTarget.value = ''
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>

                <NewProjectModal open={showNewProject} onOpenChange={setShowNewProject} />

                {/* Settings Dialog */}
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogContent className="bg-[#09090b] border-white/10 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Settings</DialogTitle>
                            <DialogDescription>Manage your API keys and code preferences.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-4">
                                {Object.entries(PROVIDERS).map(([key, info]) => (
                                    <div key={key} className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor={key} className="text-right text-xs uppercase text-muted-foreground">{info.name}</Label>
                                        <Input
                                            id={key}
                                            type="password"
                                            value={apiKeys[key] || ''}
                                            onChange={(e) => setApiKeys(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="col-span-3 bg-white/5 border-white/10 focus:border-indigo-500"
                                            placeholder={`Enter ${info.name} API Key`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowSettings(false)}>Cancel</Button>
                            <Button onClick={() => { saveKeys(apiKeys); setShowSettings(false) }} className="bg-indigo-600 hover:bg-indigo-500">Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    )
}
