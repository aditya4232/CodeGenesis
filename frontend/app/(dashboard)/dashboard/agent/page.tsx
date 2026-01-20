"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Bot, Send, Sparkles, FileText, Download, Briefcase,
    GraduationCap, Code2, Server, Globe, FileSpreadsheet,
    Copy, Check, RefreshCw, Trash2, Cpu, Zap, ShieldCheck,
    ChevronLeft, ExternalLink, Terminal, Layers, Layout,
    CheckCircle2, AlertCircle, Info, BookOpen, Image as ImageIcon,
    Monitor, FileJson, Presentation, LayoutTemplate, Share2, Printer, History
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { ConversationHistory } from "@/components/agent/ConversationHistory"
import { ArtifactViewer } from "@/components/agent/ArtifactViewer"
import {
    getUserConversations,
    createConversation,
    getConversation,
    addMessage,
    generateTitle,
    type AgentConversation,
    type AgentMessage
} from "@/lib/agent-db"

// --- Markdown & Visual Parser ---
const MarkdownRenderer = ({ content }: { content: string }) => {
    // Basic Markdown Parser (Regex based for Zero Dependencies)
    const formattedContent = useMemo(() => {
        let text = content;

        // Code Blocks (``` ... ```)
        text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre class="bg-black/40 p-4 rounded-xl border border-white/10 my-4 font-mono text-xs overflow-x-auto text-emerald-300"><code>${code.trim()}</code></pre>`;
        });

        // Tables (| col | col |)
        text = text.replace(/^\|(.+)\|$\n^\|([-| ]+)\|$\n((?:^\|.+\|$\n?)+)/gm, (match, header, separator, rows) => {
            const hCols = header.split('|').filter(Boolean).map((c: string) => c.trim());
            const rRows = rows.split('\n').filter(Boolean).map((r: string) => r.split('|').filter(Boolean).map(c => c.trim()));

            return `
                <div class="overflow-x-auto my-6 rounded-xl border border-white/10">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-white/5 text-white/70 font-mono text-[10px] uppercase tracking-wider">
                            <tr>${hCols.map((c: any) => `<th class="px-4 py-3">${c}</th>`).join('')}</tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            ${rRows.map((row: any) => `<tr>${row.map((c: any) => `<td class="px-4 py-3 text-white/90">${c}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        // Headings (###)
        text = text.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-2 flex items-center gap-2 tracking-tight">$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2 class="text-xl font-extrabold text-white mt-8 mb-4 border-b border-white/5 pb-2">$1</h2>');

        // Bold (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400 font-semibold">$1</strong>');

        // Task Lists (- [ ] or - [x])
        text = text.replace(/^\s*[\*\-]\s+\[ \]\s+(.*$)/gm, '<li class="ml-4 mb-2 text-white/60 list-none flex items-start gap-2"><div class="h-4 w-4 rounded border border-white/20 mt-0.5 shrink-0" /><span>$1</span></li>');
        text = text.replace(/^\s*[\*\-]\s+\[x\]\s+(.*$)/gm, '<li class="ml-4 mb-2 text-emerald-400 list-none flex items-start gap-2"><div class="h-4 w-4 rounded border border-emerald-500 bg-emerald-500/20 mt-0.5 shrink-0 flex items-center justify-center text-[10px]">✓</div><span class="line-through opacity-50">$1</span></li>');

        // Inline Code (`text`)
        text = text.replace(/`([^`]+)`/g, '<code class="bg-indigo-500/10 text-indigo-300 px-1 py-0.5 rounded font-mono text-[10px]">$1</code>');

        // Lists (* or -)
        text = text.replace(/^\s*[\*\-]\s+(.*$)/gm, '<li class="ml-4 mb-1 text-white/70 list-disc marker:text-indigo-500">$1</li>');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30 transition-colors">$1</a>');

        // Line breaks (High-density optimization)
        text = text.replace(/\n\n/g, '<div class="h-2"></div>');

        return text;
    }, [content]);

    return (
        <div
            className="prose prose-invert max-w-none agent-markdown"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
    );
};

// --- Persona Configuration ---
const SYSTEM_PROMPT = `
You are CodeGenesis AI (Neural Core v2.6). 
You are an advanced AI Architectural Entity strictly optimized for technical excellence and visionary design.

**OUTPUT CAPABILITIES:**
- **Markdown Mastery**: Use ### for headers, **bold** for emphasis, and use TABLES (| col | col |) for comparative data or tech stacks.
- **Blueprint Mode**: When designing apps, always provide a structured table for the Tech Stack.
- **MCQ Protocol**: If user request is vague, ask 3-5 specific MCQs.
- **Manifest**: ALWAYS list tasks to be performed and files affected.

**FORMATTING PROTOCOL:**
1. No raw symbols like ** unless they are markdown bold.
2. Tables are MANDATORY for tech stack recommendations.
3. Use bullet points for features.
4. Tone: Visionary, Precise, Architectural.

Example Stack Table:
| Layer | Recommendation | Rationale |
|---|---|---|
| Frontend | Next.js 15 (App Router) | React 19 Support & Server Actions |
| Styling | Tailwind v4 | Performance & Type-safe CSS |
| Backend | Supabase | Real-time DB & Auth |

**ARTIFACT GENERATION API (Strict JSON):**
For Docs, PPTs, Spreadsheets, or Code, you MUST respond with a pure JSON block wrapped in \`\`\`json ... \`\`\`:

1. **Documents/Reports**: Generate professional, well-structured documents with proper HTML formatting:
{
  "type": "doc",
  "title": "Document Title",
  "content": "<div class='document-content'>
    <div class='doc-header'>
      <h1 class='doc-title'>Main Title</h1>
      <p class='doc-subtitle'>Subtitle or tagline</p>
      <div class='doc-meta'>
        <span>Date: [Current Date]</span>
        <span>Version: 1.0</span>
      </div>
    </div>
    
    <div class='doc-section'>
      <h2 class='section-title'>Executive Summary</h2>
      <p class='section-content'>Overview paragraph...</p>
    </div>
    
    <div class='doc-section'>
      <h2 class='section-title'>Section Title</h2>
      <p class='section-content'>Content paragraph with <strong>bold text</strong> and <em>italics</em>.</p>
      
      <h3 class='subsection-title'>Subsection</h3>
      <ul class='doc-list'>
        <li>Bullet point 1</li>
        <li>Bullet point 2</li>
      </ul>
      
      <div class='info-box'>
        <strong>Key Point:</strong> Important information here
      </div>
    </div>
    
    <div class='doc-section'>
      <h2 class='section-title'>Data & Metrics</h2>
      <table class='doc-table'>
        <thead>
          <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr><td>Performance</td><td>98%</td><td>Excellent</td></tr>
        </tbody>
      </table>
    </div>
  </div>"
}

2. **Presentations**: Create engaging slide decks with proper structure:
{
  "type": "ppt",
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Title Slide",
      "content": "<div class='slide-intro'><h1>Main Title</h1><p class='tagline'>Compelling subtitle</p></div>"
    },
    {
      "title": "Content Slide",
      "content": "<ul class='slide-points'><li><strong>Point 1:</strong> Description</li><li><strong>Point 2:</strong> Description</li></ul>"
    }
  ]
}

3. **Spreadsheets/Excel**: 
{ "type": "spreadsheet", "title": "Data Grid Title", "columns": ["Column A", "Column B"], "data": [["Value 1", "Value 2"]] }

4. **Code/Snippets**: 
{ "type": "code", "title": "filename.ext", "language": "javascript", "content": "// Code here" }

**DOCUMENT STYLING GUIDELINES:**
- Use semantic HTML with proper class names
- Structure with clear sections and hierarchies
- Include metadata (date, version, author info)
- Add visual separators and info boxes for key points
- Use tables for data comparison
- Add executive summaries for reports
- Include clear section headings
`;

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | 'doc' | 'ppt' | 'plan' | 'code' | 'spreadsheet' | 'diagram' | 'chart';
    docData?: { title: string; content: string };
    pptData?: { title: string; slides: { title: string; content: string }[] };
    spreadsheetData?: { title: string; columns: string[]; data: string[][] };
    codeData?: { title: string; language: string; content: string };
}

export default function AgentPage() {
    const { user, loading: isLoaded } = useAuth()
    const [conversations, setConversations] = useState<AgentConversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [showHistory, setShowHistory] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "### Neural Interface Link Synchronized\n\nI am the **CodeGenesis Neural Core (v2.5)**. Architectural planning and project projection protocols are online.\n\n*How shall we evolve your project today?*",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [streamingContent, setStreamingContent] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
    const [activeSlide, setActiveSlide] = useState(0)

    const [activeArtifact, setActiveArtifact] = useState<{ type: 'doc' | 'ppt' | 'spreadsheet' | 'code', data: any } | null>(null)

    useEffect(() => {
        const storedKeys = localStorage.getItem("codegenesis_api_keys")
        if (storedKeys) setApiKeys(JSON.parse(storedKeys))
        setIsMounted(true) // For hydration fix
    }, [])

    // Load conversations from database
    useEffect(() => {
        if (user?.uid) {
            loadConversations()
        }
    }, [user])

    const loadConversations = async () => {
        if (!user?.uid) return
        try {
            const convos = await getUserConversations(user.uid)
            setConversations(convos)

            // Auto-select most recent conversation
            if (convos.length > 0 && !activeConversationId) {
                await loadConversation(convos[0].id)
            }
        } catch (error) {
            console.error('Failed to load conversations:', error)
        }
    }

    const loadConversation = async (conversationId: string) => {
        try {
            const conversation = await getConversation(conversationId)
            if (conversation) {
                setActiveConversationId(conversationId)

                // Convert database messages to component format
                const loadedMessages: Message[] = conversation.messages.map((msg: AgentMessage) => ({
                    id: msg.id,
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    timestamp: new Date(msg.created_at),
                    type: msg.message_type || 'text',
                    docData: msg.artifact_data?.docData,
                    pptData: msg.artifact_data?.pptData,
                    spreadsheetData: msg.artifact_data?.spreadsheetData,
                    codeData: msg.artifact_data?.codeData,
                }))

                setMessages(loadedMessages.length > 0 ? loadedMessages : [{
                    id: '1',
                    role: 'assistant',
                    content: "### Neural Interface Link Synchronized\n\nI am the **CodeGenesis Neural Core (v2.5)**. Architectural planning and project projection protocols are online.\n\n*How shall we evolve your project today?*",
                    timestamp: new Date()
                }])
            }
        } catch (error) {
            console.error('Failed to load conversation:', error)
            toast.error('Failed to load conversation')
        }
    }

    const handleNewConversation = async () => {
        if (!user?.uid) {
            toast.error('Please sign in to create conversations')
            return
        }

        setActiveConversationId(null)
        setMessages([{
            id: '1',
            role: 'assistant',
            content: "### Neural Interface Link Synchronized\n\nI am the **CodeGenesis Neural Core (v2.5)**. Architectural planning and project projection protocols are online.\n\n*How shall we evolve your project today?*",
            timestamp: new Date()
        }])
        setActiveArtifact(null)
    }

    const handleSelectConversation = async (conversationId: string) => {
        await loadConversation(conversationId)
    }

    const handleDeleteConversation = async (conversationId: string) => {
        await loadConversations()
        if (conversationId === activeConversationId) {
            handleNewConversation()
        }
    }

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages, streamingContent, isLoading, scrollToBottom])

    const handleClear = () => {
        if (confirm("De-initialize neurals? All session data will be cleared.")) {
            setMessages([{
                id: '1',
                role: 'assistant',
                type: 'text',
                content: "### Neural Link Active\n\nCodeGenesis AI v2.6 ready. Protocols initialized.",
                timestamp: new Date()
            }]);
            setActiveConversationId(null)
            setActiveArtifact(null)
        }
    }

    const handleSend = async (customInput?: string) => {
        const val = customInput || input;
        if (!val.trim() || isLoading) return;

        const provider = "groq"; // Default for agent
        const key = apiKeys[provider];
        if (!key) {
            toast.error(`Please set ${provider} API key in Editor Settings first.`);
            return;
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: val, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setStreamingContent("");

        // Create conversation if needed
        let conversationId = activeConversationId
        if (!conversationId && user?.uid) {
            try {
                const title = generateTitle(val)
                const newConvo = await createConversation(user.uid, title)
                if (newConvo) {
                    conversationId = newConvo.id
                    setActiveConversationId(conversationId)
                }
                await loadConversations() // Refresh sidebar
            } catch (error) {
                console.error('Failed to create conversation:', error)
            }
        }

        // Save user message to database
        if (conversationId && user?.uid) {
            try {
                await addMessage(conversationId, {
                    user_id: user.uid,
                    role: 'user',
                    content: val,
                    message_type: 'text',
                    artifact_data: null
                })
            } catch (error) {
                console.error('Failed to save user message:', error)
            }
        }

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...history, { role: 'user', content: val }],
                    model: "llama-3.3-70b-versatile",
                    provider,
                    apiKey: key,
                    files: {}
                })
            });

            const reader = res.body?.getReader();
            if (!reader) throw new Error("Stream failed");
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                fullResponse += data.content;
                                setStreamingContent(fullResponse);
                            }
                        } catch { }
                    }
                }
            }
            setStreamingContent("");

            // Advanced Parsing for Doc/PPT/Plan
            let finalMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date(),
                type: 'text'
            };

            let jsonData: any = null;
            const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/);
            try {
                if (jsonMatch) jsonData = JSON.parse(jsonMatch[1]);
                else if (fullResponse.trim().startsWith('{')) jsonData = JSON.parse(fullResponse.trim());
            } catch (e) { }

            if (jsonData) {
                if (jsonData.type === 'doc') {
                    finalMessage.type = 'doc';
                    finalMessage.docData = { title: jsonData.title, content: jsonData.content };
                    finalMessage.content = `### Generated Document: ${jsonData.title}`;
                    setActiveArtifact({ type: 'doc', data: finalMessage.docData }); // Auto-open
                } else if (jsonData.type === 'ppt') {
                    finalMessage.type = 'ppt';
                    finalMessage.pptData = { title: jsonData.title, slides: jsonData.slides };
                    finalMessage.content = `### Generated Presentation: ${jsonData.title}`;
                    setActiveArtifact({ type: 'ppt', data: finalMessage.pptData }); // Auto-open
                } else if (jsonData.type === 'plan') {
                    finalMessage.type = 'plan';
                    finalMessage.content = jsonData.content || jsonData.thought || "Implementation Blueprint projected.";
                } else if (jsonData.type === 'spreadsheet') {
                    finalMessage.type = 'spreadsheet';
                    finalMessage.spreadsheetData = { title: jsonData.title, columns: jsonData.columns, data: jsonData.data };
                    finalMessage.content = `### Generated Data Grid: ${jsonData.title}`;
                    setActiveArtifact({ type: 'spreadsheet', data: finalMessage.spreadsheetData });
                } else if (jsonData.type === 'code') {
                    finalMessage.type = 'code';
                    finalMessage.codeData = { title: jsonData.title, language: jsonData.language, content: jsonData.content };
                    finalMessage.content = `### Generated Code: ${jsonData.title}`;
                    setActiveArtifact({ type: 'code', data: finalMessage.codeData });
                } else if (jsonData.type === 'chat') {
                    finalMessage.content = jsonData.content;
                }
            }

            setMessages(prev => [...prev, finalMessage]);

            // Save assistant message to database
            if (conversationId && user?.uid) {
                try {
                    await addMessage(conversationId, {
                        user_id: user.uid,
                        role: 'assistant',
                        content: finalMessage.content,
                        message_type: finalMessage.type || 'text',
                        artifact_data: {
                            docData: finalMessage.docData,
                            pptData: finalMessage.pptData,
                            spreadsheetData: finalMessage.spreadsheetData,
                            codeData: finalMessage.codeData,
                        }
                    })
                    await loadConversations() // Refresh sidebar with updated counts
                } catch (error) {
                    console.error('Failed to save assistant message:', error)
                }
            }

        } catch (error) {
            toast.error("Neural sync error.");
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "**Error**: Failed to establish stable link.", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#050507] text-white overflow-hidden">
            {/* Fullscreen Navigation Bar */}
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-2 transition-all">
                            <ChevronLeft className="h-4 w-4" /> Back to Base
                        </Button>
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <Cpu className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-tight uppercase">CodeGenesis AI <span className="text-emerald-500 ml-1">v2.6</span></h2>
                            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest leading-none">Neural Core Active • MCQ Mode Enabled</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`cursor-pointer transition-all ${activeArtifact ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'} text-[10px] font-mono h-6 px-3`} onClick={() => setActiveArtifact(activeArtifact ? null : { type: 'doc', data: { title: 'Quick Notes', content: '<h3>Scratchpad</h3><p>Start a project to see details here.</p>' } })}>
                        {activeArtifact ? 'ACTION MODE' : 'FOCUS MODE'}
                    </Badge>
                    {user && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-white/20 hover:text-indigo-400"
                            title={showHistory ? "Hide History" : "Show History"}
                        >
                            <History className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleClear} className="text-white/20 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Immersive Shared Workspace */}
            <div className="flex-1 flex min-h-0 overflow-hidden relative">

                {/* Visual Ambient Effects (Global) */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

                {/* Conversation History Sidebar */}
                {showHistory && user && (
                    <ConversationHistory
                        userId={user.uid}
                        activeConversationId={activeConversationId}
                        onSelectConversation={handleSelectConversation}
                        onNewConversation={handleNewConversation}
                        onDeleteConversation={handleDeleteConversation}
                    />
                )}

                {/* LEFT PANE: Chat Interface */}
                {/* LEFT PANE: Chat Interface (Auto-Resizing) */}
                <main className={`flex flex-col h-full transition-all duration-500 ease-[0.2,0,0,1] border-r border-white/5 relative z-10 ${activeArtifact ? 'w-1/2 min-w-[50%]' : showHistory && user ? 'flex-1' : 'w-full max-w-[1200px] mx-auto'}`}>

                    <ScrollArea className="flex-1 min-h-0" scrollHideDelay={0}>
                        <div className="p-6 md:p-10 space-y-6 pb-20">
                            <AnimatePresence mode="popLayout">
                                {messages.map((m) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className={`flex gap-6 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {m.role === 'assistant' && (
                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 flex items-center justify-center shrink-0 border border-white/10 shadow-2xl relative group">
                                                <Bot className="h-4 w-4 text-emerald-400" />
                                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#050507] rounded-full flex items-center justify-center border border-white/10">
                                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        )}

                                        <div className={`flex flex-col gap-2 max-w-full ${m.role === 'user' ? 'items-end' : 'items-start w-full'}`}>
                                            <div className={`p-4 px-6 rounded-[1.5rem] shadow-xl transition-all duration-300 ${m.role === 'user'
                                                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm border border-white/10 max-w-[85%]'
                                                : 'bg-transparent border-none text-gray-200 w-full p-0 shadow-none'
                                                }`}>
                                                <MarkdownRenderer content={m.content} />

                                                {/* Power Modes: Action Cards (Perplexity Style) */}
                                                {m.type === 'doc' && m.docData && (
                                                    <div
                                                        onClick={() => setActiveArtifact({ type: 'doc', data: m.docData })}
                                                        className="mt-4 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white tracking-tight">{m.docData.title}</div>
                                                                <div className="text-[10px] text-white/50 font-mono uppercase tracking-wider mt-0.5">Professional Document • V2.0</div>
                                                            </div>
                                                        </div>
                                                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                            <ChevronLeft className="h-4 w-4 rotate-180" />
                                                        </div>
                                                    </div>
                                                )}

                                                {m.type === 'ppt' && m.pptData && (
                                                    <div
                                                        onClick={() => setActiveArtifact({ type: 'ppt', data: m.pptData })}
                                                        className="mt-4 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
                                                                <Presentation className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white tracking-tight">{m.pptData.title}</div>
                                                                <div className="text-[10px] text-white/50 font-mono uppercase tracking-wider mt-0.5">Presentation Deck • {m.pptData.slides.length} Slides</div>
                                                            </div>
                                                        </div>
                                                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                                            <ChevronLeft className="h-4 w-4 rotate-180" />
                                                        </div>
                                                    </div>
                                                )}

                                                {m.type === 'spreadsheet' && m.spreadsheetData && (
                                                    <div
                                                        onClick={() => setActiveArtifact({ type: 'spreadsheet', data: m.spreadsheetData })}
                                                        className="mt-4 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/20 group-hover:scale-105 transition-transform">
                                                                <FileSpreadsheet className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white tracking-tight">{m.spreadsheetData.title}</div>
                                                                <div className="text-[10px] text-white/50 font-mono uppercase tracking-wider mt-0.5">Data Grid • {m.spreadsheetData.data.length} Rows</div>
                                                            </div>
                                                        </div>
                                                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                                                            <ChevronLeft className="h-4 w-4 rotate-180" />
                                                        </div>
                                                    </div>
                                                )}

                                                {m.type === 'code' && m.codeData && (
                                                    <div
                                                        onClick={() => setActiveArtifact({ type: 'code', data: m.codeData })}
                                                        className="mt-4 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                                                <Code2 className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white tracking-tight">{m.codeData.title}</div>
                                                                <div className="text-[10px] text-white/50 font-mono uppercase tracking-wider mt-0.5"> {m.codeData.language} • Source Code</div>
                                                            </div>
                                                        </div>
                                                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                            <ChevronLeft className="h-4 w-4 rotate-180" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 px-1">
                                                <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">
                                                    {isMounted ? m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </span>
                                            </div>
                                        </div>

                                        {m.role === 'user' && (
                                            <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-1">
                                                <span className="font-bold text-[8px] text-indigo-300">YOU</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {streamingContent && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 w-full">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                        <Bot className="h-4 w-4 text-emerald-400 animate-pulse" />
                                    </div>
                                    <div className="bg-[#0f0f13] border border-white/5 rounded-[1.5rem] rounded-tl-none p-5 px-6 shadow-2xl w-full max-w-[85%]">
                                        <MarkdownRenderer content={streamingContent} />
                                    </div>
                                </motion.div>
                            )}

                            {isLoading && !streamingContent && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                        <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
                                    </div>
                                    <div className="bg-[#0f0f13] border border-white/5 rounded-[1.5rem] rounded-tl-none p-4 flex flex-col gap-3 min-w-[250px]">
                                        <div className="flex items-center gap-3 text-emerald-400 text-[9px] font-mono uppercase tracking-[0.2em]">
                                            Processing Neuro-Blueprint...
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div className="h-full bg-emerald-500" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={scrollRef} className="h-12" />
                        </div>
                    </ScrollArea>

                    {/* Cyber Input Zone */}
                    <div className={`bg-[#0a0a0c]/90 backdrop-blur-3xl border-t border-white/5 shrink-0 z-40 relative transition-all ${activeArtifact ? 'p-3' : 'p-4'}`}>
                        {!activeArtifact && (
                            <div className="max-w-4xl mx-auto flex gap-2 mb-3">
                                <Button variant="ghost" size="sm" className="h-6 text-[9px] text-white/30 hover:text-emerald-400 bg-white/5 border border-white/5 rounded-lg px-2.5 gap-2" onClick={() => setInput((prev: string) => prev + "\nContext URL: ")}>
                                    <Globe className="h-3 w-3" /> Add Link
                                </Button>
                            </div>
                        )}
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="relative group p-[1px] rounded-xl overflow-hidden bg-gradient-to-r from-white/5 via-emerald-500/20 to-white/5 group-focus-within:from-emerald-500/40 transition-all duration-500">
                                <div className="bg-[#050507] rounded-[11px] relative flex items-center">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Enter architectural inquiry..."
                                        className="h-12 px-4 bg-transparent border-none text-sm text-white focus-visible:ring-0 placeholder:text-white/20"
                                    />
                                    <div className="pr-2">
                                        <Button
                                            onClick={() => handleSend()}
                                            disabled={isLoading || !input.trim()}
                                            className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all active:scale-95 flex items-center gap-2 font-bold text-[10px]"
                                        >
                                            <Send className="h-3 w-3" />
                                            <span className="hidden md:inline uppercase tracking-tighter">Project</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {!activeArtifact && (
                                /* Tactical Shortcuts */
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-fade-sides">
                                    {[
                                        { icon: FileText, text: "Create PRD", prompt: "Generate a comprehensive PRD for a modern SaaS app" },
                                        { icon: Presentation, text: "Pitch Deck", prompt: "Create a 5-slide pitch deck for a new AI startup" },
                                        { icon: Layers, text: "System Arch", prompt: "Project high-level architecture" },
                                        { icon: ShieldCheck, text: "Audit", prompt: "Perform a security audit logic" }
                                    ].map((s, i) => (
                                        <Badge
                                            key={i}
                                            variant="outline"
                                            className="cursor-pointer bg-white/5 text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 py-1 px-3 flex items-center gap-2 transition-all border-white/5 hover:border-emerald-500/30 rounded-lg whitespace-nowrap group shrink-0"
                                            onClick={() => handleSend(s.prompt)}
                                        >
                                            <s.icon className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-mono tracking-widest font-bold uppercase">{s.text}</span>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* RIGHT PANE: Action Screen (Docs & PPTs) */}
                <AnimatePresence mode="wait">
                    {activeArtifact && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "50%", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full bg-[#0a0a0c] border-l border-white/10 flex flex-col overflow-hidden relative shadow-2xl z-20"
                        >
                            <ArtifactViewer
                                type={activeArtifact.type}
                                data={activeArtifact.data}
                                onClose={() => setActiveArtifact(null)}
                            />
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Visual Assets */}
            <style jsx global>{`
                .agent-markdown pre { 
                    background: #000 !important;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .agent-markdown blockquote {
                    border-left: 4px solid #10b981;
                    padding-left: 1rem;
                    color: #9ca3af;
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .agent-markdown table { font-family: 'JetBrains Mono', monospace; }
            `}</style>
        </div>
    )
}
