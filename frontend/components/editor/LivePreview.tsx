"use client";

import { Sandpack, SandpackProvider, SandpackLayout, SandpackPreview, SandpackConsole } from "@codesandbox/sandpack-react";
import { useState, useMemo } from "react";

interface LivePreviewProps {
    files: Record<string, string>;
    showConsole?: boolean;
    showNavigator?: boolean;
    height?: string;
    template?: "react" | "react-ts" | "vanilla" | "vanilla-ts" | "vue" | "vue-ts";
}

/**
 * LivePreview Component
 * 
 * A browser-based code execution environment using Sandpack.
 * Supports React, Vue, and vanilla JS/TS projects.
 */
export function LivePreview({
    files,
    showConsole = false,
    showNavigator = true,
    height = "500px",
    template = "react-ts"
}: LivePreviewProps) {
    const [viewMode, setViewMode] = useState<"preview" | "console" | "split">("preview");

    // Transform files to Sandpack format
    const sandpackFiles = useMemo(() => {
        const transformed: Record<string, string> = {};

        Object.entries(files).forEach(([path, content]) => {
            // Ensure paths start with /
            const normalizedPath = path.startsWith("/") ? path : `/${path}`;
            transformed[normalizedPath] = content;
        });

        // Add default entry point if not present
        if (!transformed["/App.tsx"] && !transformed["/App.jsx"] && !transformed["/index.tsx"]) {
            // Check what we have and create appropriate entry
            const hasHtml = Object.keys(transformed).some(k => k.endsWith(".html"));

            if (!hasHtml) {
                // Create a simple App component wrapper
                transformed["/App.tsx"] = `
import React from 'react';

export default function App() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1>🚀 CodeGenesis Preview</h1>
      <p>Your generated code will appear here...</p>
    </div>
  );
}
`;
            }
        }

        return transformed;
    }, [files]);

    // Determine the best template based on files
    const detectedTemplate = useMemo(() => {
        const fileNames = Object.keys(files);

        if (fileNames.some(f => f.includes(".vue"))) return "vue-ts";
        if (fileNames.some(f => f.endsWith(".tsx"))) return "react-ts";
        if (fileNames.some(f => f.endsWith(".jsx"))) return "react";
        if (fileNames.some(f => f.endsWith(".ts"))) return "vanilla-ts";

        return template;
    }, [files, template]);

    return (
        <div className="live-preview-container" style={{ height, borderRadius: "8px", overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{
                display: "flex",
                gap: "8px",
                padding: "8px 12px",
                background: "#1e1e1e",
                borderBottom: "1px solid #333"
            }}>
                <button
                    onClick={() => setViewMode("preview")}
                    style={{
                        padding: "4px 12px",
                        borderRadius: "4px",
                        border: "none",
                        background: viewMode === "preview" ? "#007acc" : "#333",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    Preview
                </button>
                <button
                    onClick={() => setViewMode("console")}
                    style={{
                        padding: "4px 12px",
                        borderRadius: "4px",
                        border: "none",
                        background: viewMode === "console" ? "#007acc" : "#333",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    Console
                </button>
                <button
                    onClick={() => setViewMode("split")}
                    style={{
                        padding: "4px 12px",
                        borderRadius: "4px",
                        border: "none",
                        background: viewMode === "split" ? "#007acc" : "#333",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    Split
                </button>
            </div>

            {/* Sandpack Preview */}
            <SandpackProvider
                template={detectedTemplate}
                files={sandpackFiles}
                theme="dark"
options={{
                }}
            >
                <SandpackLayout style={{ height: `calc(${height} - 40px)` }}>
                    {(viewMode === "preview" || viewMode === "split") && (
                        <SandpackPreview
                            showOpenInCodeSandbox={false}
                            showRefreshButton={true}
                            style={{ flex: viewMode === "split" ? 1 : 2 }}
                        />
                    )}
                    {(viewMode === "console" || viewMode === "split") && showConsole && (
                        <SandpackConsole style={{ flex: 1 }} />
                    )}
                </SandpackLayout>
            </SandpackProvider>
        </div>
    );
}

/**
 * SimplePreview Component
 * 
 * A simpler version using the all-in-one Sandpack component.
 * Good for quick previews without customization.
 */
export function SimplePreview({ files, height = "400px" }: { files: Record<string, string>, height?: string }) {
    return (
        <Sandpack
            template="react-ts"
            files={files}
            theme="dark"
            options={{
                showNavigator: true,
                showTabs: true,
                editorHeight: height,
                showLineNumbers: true,
                showInlineErrors: true,
            }}
        />
    );
}

/**
 * MultiViewportPreview Component
 * 
 * Shows the preview in multiple viewport sizes (desktop, tablet, mobile).
 */
export function MultiViewportPreview({ files }: { files: Record<string, string> }) {
    const [activeViewport, setActiveViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

    const viewportSizes = {
        desktop: { width: "100%", height: "600px" },
        tablet: { width: "768px", height: "600px" },
        mobile: { width: "375px", height: "667px" }
    };

    return (
        <div className="multi-viewport-preview">
            {/* Viewport Selector */}
            <div style={{
                display: "flex",
                gap: "8px",
                padding: "12px",
                background: "#1e1e1e",
                borderRadius: "8px 8px 0 0"
            }}>
                {(["desktop", "tablet", "mobile"] as const).map((viewport) => (
                    <button
                        key={viewport}
                        onClick={() => setActiveViewport(viewport)}
                        style={{
                            padding: "6px 16px",
                            borderRadius: "4px",
                            border: "none",
                            background: activeViewport === viewport ? "#007acc" : "#333",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "13px",
                            textTransform: "capitalize"
                        }}
                    >
                        {viewport === "desktop" && "🖥️ "}
                        {viewport === "tablet" && "📱 "}
                        {viewport === "mobile" && "📲 "}
                        {viewport}
                    </button>
                ))}
            </div>

            {/* Preview Container */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                background: "#2d2d2d",
                padding: "20px",
                borderRadius: "0 0 8px 8px"
            }}>
                <div style={{
                    width: viewportSizes[activeViewport].width,
                    maxWidth: "100%",
                    transition: "width 0.3s ease"
                }}>
                    <LivePreview
                        files={files}
                        height={viewportSizes[activeViewport].height}
                        showConsole={true}
                    />
                </div>
            </div>
        </div>
    );
}

export default LivePreview;
