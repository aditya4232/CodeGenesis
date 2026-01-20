import { useMemo } from "react"

export const MarkdownRenderer = ({ content }: { content: string }) => {
    // Basic Markdown Parser (Regex based for Zero Dependencies)
    const formattedContent = useMemo(() => {
        let text = content || "";

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
