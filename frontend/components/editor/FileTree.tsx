"use client";

import { useState, useMemo } from "react";

interface FileTreeProps {
    files: Record<string, string>;
    activeFile: string | null;
    onFileSelect: (filename: string) => void;
    onFileCreate?: (filename: string) => void;
    onFileDelete?: (filename: string) => void;
    onFileRename?: (oldName: string, newName: string) => void;
}

interface FileNode {
    name: string;
    path: string;
    type: "file" | "folder";
    children?: FileNode[];
}

/**
 * Build a tree structure from flat file paths
 */
function buildFileTree(files: Record<string, string>): FileNode[] {
    type TreeEntry = { node: FileNode; childMap: Map<string, TreeEntry> };
    const root: Map<string, TreeEntry> = new Map();

    Object.keys(files).forEach((filePath) => {
        const parts = filePath.replace(/^\//, "").split("/");
        let currentMap = root;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const path = "/" + parts.slice(0, index + 1).join("/");

            if (!currentMap.has(part)) {
                currentMap.set(part, {
                    node: {
                        name: part,
                        path: path,
                        type: isFile ? "file" : "folder",
                        children: isFile ? undefined : [],
                    },
                    childMap: new Map(),
                });
            }

            if (!isFile) {
                currentMap = currentMap.get(part)!.childMap;
            }
        });
    });

    // Convert Map to sorted array
    function toArray(map: Map<string, TreeEntry>): FileNode[] {
        return Array.from(map.values())
            .map(({ node, childMap }) => ({
                ...node,
                children: node.children !== undefined ? toArray(childMap) : undefined,
            }))
            .sort((a, b) => {
                // Folders first, then alphabetically
                if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
    }

    return toArray(root);
}

/**
 * Get file icon based on extension
 */
function getFileIcon(filename: string, isFolder: boolean): string {
    if (isFolder) return "📁";

    const ext = filename.split(".").pop()?.toLowerCase();

    const iconMap: Record<string, string> = {
        ts: "📘",
        tsx: "⚛️",
        js: "📒",
        jsx: "⚛️",
        py: "🐍",
        html: "🌐",
        css: "🎨",
        scss: "🎨",
        json: "📋",
        md: "📝",
        vue: "💚",
        svg: "🖼️",
        png: "🖼️",
        jpg: "🖼️",
        gif: "🖼️",
        test: "🧪",
        spec: "🧪",
    };

    // Check for test files
    if (filename.includes(".test.") || filename.includes(".spec.")) {
        return "🧪";
    }

    return iconMap[ext || ""] || "📄";
}

interface FileTreeNodeProps {
    node: FileNode;
    level: number;
    activeFile: string | null;
    expandedFolders: Set<string>;
    onToggleFolder: (path: string) => void;
    onFileSelect: (path: string) => void;
}

function FileTreeNode({
    node,
    level,
    activeFile,
    expandedFolders,
    onToggleFolder,
    onFileSelect,
}: FileTreeNodeProps) {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = activeFile === node.path;
    const isFolder = node.type === "folder";

    return (
        <div>
            <div
                onClick={() => (isFolder ? onToggleFolder(node.path) : onFileSelect(node.path))}
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    paddingLeft: `${level * 16 + 8}px`,
                    cursor: "pointer",
                    background: isActive ? "#094771" : "transparent",
                    color: isActive ? "#fff" : "#ccc",
                    fontSize: "13px",
                    borderRadius: "4px",
                    margin: "1px 4px",
                    transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = "#2a2d2e";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                    }
                }}
            >
                {/* Expand/Collapse Arrow for folders */}
                {isFolder && (
                    <span
                        style={{
                            marginRight: "4px",
                            fontSize: "10px",
                            transition: "transform 0.2s",
                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                    >
                        ▶
                    </span>
                )}

                {/* File/Folder Icon */}
                <span style={{ marginRight: "6px" }}>
                    {isFolder && isExpanded ? "📂" : getFileIcon(node.name, isFolder)}
                </span>

                {/* Name */}
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {node.name}
                </span>
            </div>

            {/* Children */}
            {isFolder && isExpanded && node.children && (
                <div>
                    {node.children.map((child) => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            activeFile={activeFile}
                            expandedFolders={expandedFolders}
                            onToggleFolder={onToggleFolder}
                            onFileSelect={onFileSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * FileTree Component
 * 
 * A VS Code-style file explorer for navigating project files.
 */
export function FileTree({
    files,
    activeFile,
    onFileSelect,
    onFileCreate,
    onFileDelete,
    onFileRename,
}: FileTreeProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));
    const [searchQuery, setSearchQuery] = useState("");

    const tree = useMemo(() => buildFileTree(files), [files]);

    const filteredTree = useMemo(() => {
        if (!searchQuery) return tree;

        // Filter files by search query
        const query = searchQuery.toLowerCase();

        function filterNodes(nodes: FileNode[]): FileNode[] {
            return nodes.reduce<FileNode[]>((acc, node) => {
                if (node.type === "file" && node.name.toLowerCase().includes(query)) {
                    acc.push(node);
                } else if (node.type === "folder" && node.children) {
                    const filteredChildren = filterNodes(node.children);
                    if (filteredChildren.length > 0) {
                        acc.push({ ...node, children: filteredChildren });
                    }
                }
                return acc;
            }, []);
        }

        return filterNodes(tree);
    }, [tree, searchQuery]);

    const handleToggleFolder = (path: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const fileCount = Object.keys(files).length;

    return (
        <div style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#252526",
            borderRight: "1px solid #1e1e1e"
        }}>
            {/* Header */}
            <div style={{
                padding: "12px",
                borderBottom: "1px solid #1e1e1e",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <span style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    color: "#888",
                    letterSpacing: "1px",
                    fontWeight: 600
                }}>
                    Explorer
                </span>
                <span style={{ fontSize: "11px", color: "#666" }}>
                    {fileCount} files
                </span>
            </div>

            {/* Search */}
            <div style={{ padding: "8px" }}>
                <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "6px 10px",
                        background: "#3c3c3c",
                        border: "1px solid #3c3c3c",
                        borderRadius: "4px",
                        color: "#ccc",
                        fontSize: "12px",
                        outline: "none"
                    }}
                />
            </div>

            {/* File Tree */}
            <div style={{
                flex: 1,
                overflow: "auto",
                padding: "4px 0"
            }}>
                {filteredTree.length === 0 ? (
                    <div style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#666",
                        fontSize: "12px"
                    }}>
                        {searchQuery ? "No files found" : "No files yet"}
                    </div>
                ) : (
                    filteredTree.map((node) => (
                        <FileTreeNode
                            key={node.path}
                            node={node}
                            level={0}
                            activeFile={activeFile}
                            expandedFolders={expandedFolders}
                            onToggleFolder={handleToggleFolder}
                            onFileSelect={onFileSelect}
                        />
                    ))
                )}
            </div>

            {/* Actions */}
            {(onFileCreate || onFileDelete) && (
                <div style={{
                    padding: "8px",
                    borderTop: "1px solid #1e1e1e",
                    display: "flex",
                    gap: "4px"
                }}>
                    {onFileCreate && (
                        <button
                            onClick={() => {
                                const name = prompt("Enter file name:");
                                if (name) onFileCreate(name);
                            }}
                            style={{
                                flex: 1,
                                padding: "6px",
                                background: "#0e639c",
                                border: "none",
                                borderRadius: "4px",
                                color: "white",
                                fontSize: "12px",
                                cursor: "pointer"
                            }}
                        >
                            + New File
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default FileTree;
