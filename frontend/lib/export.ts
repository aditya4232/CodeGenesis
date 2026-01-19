/**
 * Export Utilities for CodeGenesis
 * Handles project export to ZIP, GitHub, and deployment platforms
 */

import JSZip from "jszip";

// @ts-ignore - file-saver types will be installed with npm install
import { saveAs } from "file-saver";

interface ExportOptions {
    projectName: string;
    files: Record<string, string>;
    includeReadme?: boolean;
    includeGitignore?: boolean;
    includeLicense?: boolean;
}

/**
 * Export project as downloadable ZIP file
 */
export async function exportToZip(options: ExportOptions): Promise<Blob> {
    const { projectName, files, includeReadme = true, includeGitignore = true, includeLicense = true } = options;

    const zip = new JSZip();

    // Add all project files
    Object.entries(files).forEach(([path, content]) => {
        // Remove leading slash if present
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        zip.file(cleanPath, content);
    });

    // Add default files if not present
    if (includeGitignore && !files[".gitignore"] && !files["/.gitignore"]) {
        zip.file(".gitignore", getDefaultGitignore());
    }

    if (includeLicense && !files["LICENSE"] && !files["/LICENSE"]) {
        zip.file("LICENSE", getMITLicense(projectName));
    }

    // Generate ZIP
    const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 }
    });

    return blob;
}

/**
 * Download project as ZIP file
 */
export async function downloadProjectZip(options: ExportOptions): Promise<void> {
    const blob = await exportToZip(options);
    saveAs(blob, `${options.projectName}.zip`);
}

/**
 * Generate package.json for React project
 */
export function generatePackageJson(projectName: string, files: Record<string, string>): string {
    const hasTypeScript = Object.keys(files).some(f => f.endsWith(".ts") || f.endsWith(".tsx"));
    const hasTailwind = Object.values(files).some(c => c.includes("tailwind"));

    const pkg = {
        name: projectName.toLowerCase().replace(/\s+/g, "-"),
        version: "0.1.0",
        private: true,
        scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint"
        },
        dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "next": "^14.0.0"
        },
        devDependencies: {
            ...(hasTypeScript && {
                "typescript": "^5.0.0",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "@types/node": "^20.0.0"
            }),
            ...(hasTailwind && {
                "tailwindcss": "^3.4.0",
                "postcss": "^8.4.0",
                "autoprefixer": "^10.4.0"
            })
        }
    };

    return JSON.stringify(pkg, null, 2);
}

/**
 * Generate default .gitignore
 */
function getDefaultGitignore(): string {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;
}

/**
 * Generate MIT License
 */
function getMITLicense(projectName: string): string {
    const year = new Date().getFullYear();
    return `MIT License

Copyright (c) ${year} ${projectName}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

/**
 * GitHub Export Interface
 */
export interface GitHubExportOptions {
    token: string;
    repoName: string;
    isPrivate: boolean;
    files: Record<string, string>;
    commitMessage?: string;
}

/**
 * Export to GitHub (requires GitHub token)
 */
export async function exportToGitHub(options: GitHubExportOptions): Promise<{ repoUrl: string }> {
    const { token, repoName, isPrivate, files, commitMessage = "Initial commit from CodeGenesis" } = options;

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    };

    // Create repository
    const createRepoResponse = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers,
        body: JSON.stringify({
            name: repoName,
            private: isPrivate,
            auto_init: false
        })
    });

    if (!createRepoResponse.ok) {
        throw new Error(`Failed to create repository: ${await createRepoResponse.text()}`);
    }

    const repo = await createRepoResponse.json();

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", { headers });
    const user = await userResponse.json();

    // Create tree with all files
    const tree = Object.entries(files).map(([path, content]) => ({
        path: path.startsWith("/") ? path.slice(1) : path,
        mode: "100644" as const,
        type: "blob" as const,
        content
    }));

    // Create tree
    const treeResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/trees`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            tree,
            base_tree: null
        })
    });

    if (!treeResponse.ok) {
        throw new Error(`Failed to create tree: ${await treeResponse.text()}`);
    }

    const treeData = await treeResponse.json();

    // Create commit
    const commitResponse = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/commits`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            message: commitMessage,
            tree: treeData.sha
        })
    });

    if (!commitResponse.ok) {
        throw new Error(`Failed to create commit: ${await commitResponse.text()}`);
    }

    const commitData = await commitResponse.json();

    // Update main branch reference
    await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/refs/heads/main`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
            sha: commitData.sha,
            force: true
        })
    });

    return { repoUrl: repo.html_url };
}

/**
 * Generate Vercel deployment configuration
 */
export function generateVercelConfig(): string {
    return JSON.stringify({
        version: 2,
        builds: [
            {
                src: "package.json",
                use: "@vercel/next"
            }
        ]
    }, null, 2);
}

/**
 * Generate Netlify deployment configuration
 */
export function generateNetlifyConfig(): string {
    return `[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
`;
}
