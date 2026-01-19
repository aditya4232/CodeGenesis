"use client";

import Editor, { Monaco, OnMount, OnChange } from "@monaco-editor/react";
import { useState, useRef, useCallback } from "react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
    file: string;
    content: string;
    onChange?: (value: string) => void;
    onSave?: (value: string) => void;
    language?: string;
    readOnly?: boolean;
    height?: string;
    showMinimap?: boolean;
}

/**
 * Detect language from file extension
 */
function getLanguageFromFile(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'json': 'json',
        'md': 'markdown',
        'yaml': 'yaml',
        'yml': 'yaml',
        'sql': 'sql',
        'sh': 'shell',
        'bash': 'shell',
        'vue': 'vue',
        'svelte': 'svelte',
    };

    return languageMap[ext || ''] || 'plaintext';
}

/**
 * CodeEditor Component
 * 
 * Monaco-based code editor with AI-ready features.
 */
export function CodeEditor({
    file,
    content,
    onChange,
    onSave,
    language,
    readOnly = false,
    height = "100%",
    showMinimap = false
}: CodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const detectedLanguage = language || getLanguageFromFile(file);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        setIsLoading(false);

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (onSave) {
                onSave(editor.getValue());
            }
        });

        // Configure TypeScript/JavaScript
        if (['typescript', 'javascript'].includes(detectedLanguage)) {
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
            });

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ESNext,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                jsx: monaco.languages.typescript.JsxEmit.React,
                allowNonTsExtensions: true,
                allowJs: true,
            });
        }
    };

    const handleChange: OnChange = useCallback((value) => {
        if (onChange && value !== undefined) {
            onChange(value);
        }
    }, [onChange]);

    return (
        <div style={{ height, position: "relative" }}>
            {isLoading && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#1e1e1e",
                    color: "#888",
                    zIndex: 10
                }}>
                    Loading editor...
                </div>
            )}

            <Editor
                height={height}
                language={detectedLanguage}
                value={content}
                onChange={handleChange}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                options={{
                    readOnly,
                    minimap: { enabled: showMinimap },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                    fontLigatures: true,
                    tabSize: 2,
                    wordWrap: "on",
                    formatOnPaste: true,
                    formatOnType: true,
                    autoIndent: "full",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: "on",
                    glyphMargin: true,
                    folding: true,
                    bracketPairColorization: { enabled: true },
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    padding: { top: 10 },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    parameterHints: { enabled: true },
                }}
                loading={<div style={{ color: "#888", padding: "20px" }}>Loading Monaco Editor...</div>}
            />
        </div>
    );
}

interface DiffEditorProps {
    original: string;
    modified: string;
    language?: string;
    height?: string;
}

/**
 * DiffEditor Component
 * 
 * Monaco-based diff editor for showing code changes.
 */
export function DiffEditor({
    original,
    modified,
    language = "typescript",
    height = "400px"
}: DiffEditorProps) {
    return (
        <Editor
            height={height}
            language={language}
            value={modified}
            theme="vs-dark"
            options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
            }}
        />
    );
}

interface MultiFileEditorProps {
    files: Record<string, string>;
    activeFile: string;
    onFileChange: (filename: string, content: string) => void;
    onActiveFileChange: (filename: string) => void;
    height?: string;
}

/**
 * MultiFileEditor Component
 * 
 * Editor with file tabs for multi-file projects.
 */
export function MultiFileEditor({
    files,
    activeFile,
    onFileChange,
    onActiveFileChange,
    height = "500px"
}: MultiFileEditorProps) {
    const fileNames = Object.keys(files);

    return (
        <div style={{ height }}>
            {/* File Tabs */}
            <div style={{
                display: "flex",
                background: "#252526",
                borderBottom: "1px solid #1e1e1e",
                overflowX: "auto",
                padding: "0 8px"
            }}>
                {fileNames.map((filename) => (
                    <button
                        key={filename}
                        onClick={() => onActiveFileChange(filename)}
                        style={{
                            padding: "8px 16px",
                            border: "none",
                            borderBottom: activeFile === filename ? "2px solid #007acc" : "2px solid transparent",
                            background: activeFile === filename ? "#1e1e1e" : "transparent",
                            color: activeFile === filename ? "#fff" : "#888",
                            cursor: "pointer",
                            fontSize: "13px",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {getFileIcon(filename)} {filename.split('/').pop()}
                    </button>
                ))}
            </div>

            {/* Editor */}
            <CodeEditor
                file={activeFile}
                content={files[activeFile] || ""}
                onChange={(value) => onFileChange(activeFile, value)}
                height={`calc(${height} - 36px)`}
            />
        </div>
    );
}

/**
 * Get file icon based on extension
 */
function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const iconMap: Record<string, string> = {
        'ts': '📘',
        'tsx': '⚛️',
        'js': '📒',
        'jsx': '⚛️',
        'py': '🐍',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'md': '📝',
        'vue': '💚',
    };

    return iconMap[ext || ''] || '📄';
}

export default CodeEditor;
