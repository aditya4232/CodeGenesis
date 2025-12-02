"use client";

import Editor from "@monaco-editor/react";
import { FileCode } from "lucide-react";

export function CodeEditor() {
    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            <div className="flex items-center px-4 py-2 border-b border-[#333] bg-[#252526] text-white text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] rounded-t-md border-t border-l border-r border-[#333]">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span>App.tsx</span>
                </div>
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    defaultValue="// CodeGenesis generated code will appear here"
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                    }}
                />
            </div>
        </div>
    );
}
