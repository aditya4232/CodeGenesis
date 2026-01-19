"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

interface AIChatPanelProps {
    projectId?: string;
    onCodeGenerated?: (files: Record<string, string>) => void;
    apiEndpoint?: string;
    className?: string;
}

/**
 * AIChatPanel Component
 * 
 * A Cursor/Bolt.new-style AI chat panel with streaming responses,
 * code block handling, and project context awareness.
 */
export function AIChatPanel({
    projectId = "default",
    onCodeGenerated,
    apiEndpoint = "/api/chat/stream",
    className = ""
}: AIChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "👋 Hi! I'm CodeGenesis AI. Describe the app you want to build, and I'll generate the code for you.\n\n**Try saying:**\n- \"Build a todo app with dark mode\"\n- \"Create a landing page for a SaaS product\"\n- \"Make a dashboard with charts\"",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
    };

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setStreamingContent("");

        // Reset textarea height
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
        }

        try {
            // Create streaming connection
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.content,
                    project_id: projectId,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("No response body");
            }

            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);

                        if (data === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                fullContent += parsed.content;
                                setStreamingContent(fullContent);
                            }
                            if (parsed.files && onCodeGenerated) {
                                onCodeGenerated(parsed.files);
                            }
                        } catch {
                            // Non-JSON data, treat as raw content
                            fullContent += data;
                            setStreamingContent(fullContent);
                        }
                    }
                }
            }

            // Add final message
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: fullContent || "I've processed your request. Check the preview to see the results!",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setStreamingContent("");

        } catch (error) {
            console.error("Chat error:", error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `⚠️ Sorry, I encountered an error. Please check your API configuration.\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
            setStreamingContent("");
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, apiEndpoint, projectId, onCodeGenerated]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={`flex flex-col h-full bg-[#1a1a1a] ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-white/90">AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">
                        {messages.length - 1} messages
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                        : "bg-white/5 text-white/90 border border-white/10"
                                    }`}
                            >
                                <MessageContent content={message.content} />
                                <div className="mt-2 text-xs opacity-50">
                                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Streaming indicator */}
                {streamingContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/5 text-white/90 border border-white/10">
                            <MessageContent content={streamingContent} />
                            <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse" />
                        </div>
                    </motion.div>
                )}

                {/* Loading indicator */}
                {isLoading && !streamingContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-sm text-white/50">Thinking...</span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-end gap-2 bg-white/5 rounded-2xl border border-white/10 p-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe what you want to build..."
                        disabled={isLoading}
                        rows={1}
                        className="flex-1 bg-transparent text-white placeholder-white/30 resize-none outline-none px-3 py-2 max-h-[200px]"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                        {isLoading ? (
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-white/30">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <span>Free AI • 10k requests/day</span>
                </div>
            </div>
        </div>
    );
}

/**
 * MessageContent Component
 * 
 * Renders message content with code block highlighting and markdown-like formatting.
 */
function MessageContent({ content }: { content: string }) {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="prose prose-invert prose-sm max-w-none">
            {parts.map((part, index) => {
                if (part.startsWith("```")) {
                    // Extract language and code
                    const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
                    const language = match?.[1] || "text";
                    const code = match?.[2] || part.slice(3, -3);

                    return (
                        <div key={index} className="my-3 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-black/30 text-xs text-white/50">
                                <span>{language}</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="hover:text-white transition-colors"
                                >
                                    📋 Copy
                                </button>
                            </div>
                            <pre className="p-3 bg-black/20 overflow-x-auto text-sm">
                                <code className="text-green-400">{code}</code>
                            </pre>
                        </div>
                    );
                }

                // Format non-code text with basic markdown
                return (
                    <span
                        key={index}
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                            __html: part
                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-black/30 rounded text-indigo-300">$1</code>')
                                .replace(/\n/g, "<br/>")
                        }}
                    />
                );
            })}
        </div>
    );
}

export default AIChatPanel;
