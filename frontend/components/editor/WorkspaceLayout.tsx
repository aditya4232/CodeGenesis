"use client";

import { useState, useCallback } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AIChatPanel } from "./AIChatPanel";
import { CodeEditor, MultiFileEditor } from "./CodeEditor";
import { FileTree } from "./FileTree";
import { LivePreview } from "./LivePreview";

interface WorkspaceLayoutProps {
    initialFiles?: Record<string, string>;
    projectName?: string;
}

/**
 * WorkspaceLayout Component
 * 
 * A VSCode/Cursor-style IDE layout with:
 * - File tree sidebar
 * - Multi-file code editor
 * - Live preview
 * - AI chat panel
 */
export function WorkspaceLayout({
    initialFiles = {},
    projectName = "Untitled Project"
}: WorkspaceLayoutProps) {
    const [files, setFiles] = useState<Record<string, string>>(initialFiles);
    const [activeFile, setActiveFile] = useState<string | null>(
        Object.keys(initialFiles)[0] || null
    );
    const [showChat, setShowChat] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    // Handle file changes from editor
    const handleFileChange = useCallback((filename: string, content: string) => {
        setFiles(prev => ({
            ...prev,
            [filename]: content
        }));
    }, []);

    // Handle new files created from chat
    const handleCodeGenerated = useCallback((newFiles: Record<string, string>) => {
        setFiles(prev => ({
            ...prev,
            ...newFiles
        }));

        // Select first new file
        const firstNewFile = Object.keys(newFiles)[0];
        if (firstNewFile) {
            setActiveFile(firstNewFile);
        }
    }, []);

    // Create new file
    const handleFileCreate = useCallback((filename: string) => {
        const normalizedPath = filename.startsWith("/") ? filename : `/${filename}`;
        setFiles(prev => ({
            ...prev,
            [normalizedPath]: ""
        }));
        setActiveFile(normalizedPath);
    }, []);

    // Delete file
    const handleFileDelete = useCallback((filename: string) => {
        setFiles(prev => {
            const next = { ...prev };
            delete next[filename];
            return next;
        });

        if (activeFile === filename) {
            setActiveFile(Object.keys(files)[0] || null);
        }
    }, [activeFile, files]);

    return (
        <div className="h-screen w-full bg-[#1e1e1e] text-white overflow-hidden flex flex-col">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                        ⚡ CodeGenesis
                    </span>
                    <span className="text-sm text-white/50">|</span>
                    <span className="text-sm text-white/70">{projectName}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${showChat ? "bg-indigo-600 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                            }`}
                    >
                        💬 Chat
                    </button>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${showPreview ? "bg-indigo-600 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                            }`}
                    >
                        👁️ Preview
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button className="px-3 py-1.5 rounded-lg text-sm bg-green-600 hover:bg-green-500 text-white transition-colors">
                        🚀 Deploy
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* File Tree */}
                    <Panel defaultSize={15} minSize={10} maxSize={25}>
                        <FileTree
                            files={files}
                            activeFile={activeFile}
                            onFileSelect={setActiveFile}
                            onFileCreate={handleFileCreate}
                            onFileDelete={handleFileDelete}
                        />
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-white/5 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />

                    {/* Editor + Preview */}
                    <Panel defaultSize={showChat ? 55 : 85} minSize={30}>
                        <PanelGroup direction="horizontal" className="h-full">
                            {/* Code Editor */}
                            <Panel defaultSize={showPreview ? 50 : 100} minSize={30}>
                                <div className="h-full flex flex-col">
                                    {activeFile ? (
                                        <MultiFileEditor
                                            files={files}
                                            activeFile={activeFile}
                                            onFileChange={handleFileChange}
                                            onActiveFileChange={setActiveFile}
                                            height="100%"
                                        />
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-white/30">
                                            <div className="text-center">
                                                <div className="text-6xl mb-4">📁</div>
                                                <p>No file selected</p>
                                                <p className="text-sm mt-2">Create a file or use the AI to generate code</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Panel>

                            {/* Live Preview */}
                            {showPreview && (
                                <>
                                    <PanelResizeHandle className="w-1 bg-white/5 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />
                                    <Panel defaultSize={50} minSize={20}>
                                        <div className="h-full flex flex-col">
                                            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
                                                <span className="text-sm text-white/70">Live Preview</span>
                                                <div className="flex gap-2">
                                                    <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/70">
                                                        🖥️ Desktop
                                                    </button>
                                                    <button className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/50">
                                                        📱 Mobile
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-white">
                                                <LivePreview
                                                    files={files}
                                                    height="100%"
                                                    showConsole={false}
                                                />
                                            </div>
                                        </div>
                                    </Panel>
                                </>
                            )}
                        </PanelGroup>
                    </Panel>

                    {/* AI Chat Panel */}
                    {showChat && (
                        <>
                            <PanelResizeHandle className="w-1 bg-white/5 hover:bg-indigo-500/50 transition-colors cursor-col-resize" />
                            <Panel defaultSize={30} minSize={20} maxSize={50}>
                                <AIChatPanel
                                    projectId={projectName.toLowerCase().replace(/\s+/g, "-")}
                                    onCodeGenerated={handleCodeGenerated}
                                    className="h-full"
                                />
                            </Panel>
                        </>
                    )}
                </PanelGroup>
            </div>

            {/* Status Bar */}
            <footer className="flex items-center justify-between px-4 py-1 bg-[#007acc] text-white text-xs">
                <div className="flex items-center gap-4">
                    <span>⚡ Ready</span>
                    <span>{Object.keys(files).length} files</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Free Tier • Unlimited</span>
                    <span>TypeScript</span>
                </div>
            </footer>
        </div>
    );
}

export default WorkspaceLayout;
