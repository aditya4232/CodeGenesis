"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
    Download, Share2, Printer, ZoomIn, ZoomOut, Copy,
    Check, FileText, Presentation, FileSpreadsheet, Code2,
    ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react'
import { toast } from 'sonner'
import { 
    exportDocumentToPDF, 
    exportSpreadsheetToPDF, 
    exportToExcel,
    exportPresentationToPPTX,
    copyToClipboard,
    downloadTextFile
} from '@/lib/export-utils'

interface ArtifactViewerProps {
    type: 'doc' | 'ppt' | 'spreadsheet' | 'code'
    data: any
    onClose: () => void
}

export function ArtifactViewer({ type, data, onClose }: ArtifactViewerProps) {
    const [activeSlide, setActiveSlide] = useState(0)
    const [zoom, setZoom] = useState(100)
    const [copied, setCopied] = useState(false)

    // Handle export based on type
    const handleExport = async () => {
        try {
            if (type === 'doc') {
                await exportDocumentToPDF(data.title, data.content)
                toast.success('Document exported to PDF')
            } else if (type === 'ppt') {
                await exportPresentationToPPTX(data.title, data.slides)
                toast.success('Presentation exported to PPTX')
            } else if (type === 'spreadsheet') {
                await exportToExcel(data.title, data.columns, data.data)
                toast.success('Spreadsheet exported to Excel')
            } else if (type === 'code') {
                downloadTextFile(`${data.title}`, data.content)
                toast.success('Code downloaded')
            }
        } catch (error) {
            toast.error('Export failed')
            console.error('Export error:', error)
        }
    }

    const handleCopy = async () => {
        let textToCopy = ''
        
        if (type === 'code') {
            textToCopy = data.content
        } else if (type === 'doc') {
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = data.content
            textToCopy = tempDiv.textContent || ''
        } else if (type === 'spreadsheet') {
            textToCopy = data.data.map((row: string[]) => row.join('\t')).join('\n')
        }
        
        const success = await copyToClipboard(textToCopy)
        if (success) {
            setCopied(true)
            toast.success('Copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handlePrint = () => {
        window.print()
        toast.success('Opening print dialog')
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0c]">
            {/* Toolbar */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a] sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    {type === 'doc' && <FileText className="h-4 w-4 text-indigo-400" />}
                    {type === 'ppt' && <Presentation className="h-4 w-4 text-pink-400" />}
                    {type === 'spreadsheet' && <FileSpreadsheet className="h-4 w-4 text-green-400" />}
                    {type === 'code' && <Code2 className="h-4 w-4 text-blue-400" />}
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider line-clamp-1">
                        {data.title}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Zoom controls for documents */}
                    {type === 'doc' && (
                        <div className="flex items-center gap-1 mr-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setZoom(Math.max(50, zoom - 10))}
                                className="h-8 w-8 p-0"
                            >
                                <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-white/60 w-12 text-center">{zoom}%</span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setZoom(Math.min(200, zoom + 10))}
                                className="h-8 w-8 p-0"
                            >
                                <ZoomIn className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 text-[10px] gap-2 bg-white/5 border-white/10"
                    >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="h-8 text-[10px] gap-2 bg-white/5 border-white/10"
                    >
                        <Printer className="h-3 w-3" />
                        Print
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="h-8 text-[10px] gap-2 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    >
                        <Download className="h-3 w-3" />
                        Export
                    </Button>

                    <div className="h-4 w-px bg-white/10" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 text-white/40 hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 bg-[#111115]">
                {/* Document Viewer */}
                {type === 'doc' && (
                    <div className="p-12 max-w-4xl mx-auto">
                        <div 
                            className="bg-white text-gray-900 rounded-sm shadow-2xl min-h-[800px] p-16 print:shadow-none"
                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                        >
                            <div 
                                className="prose prose-slate max-w-none prose-headings:font-serif prose-p:font-serif"
                                dangerouslySetInnerHTML={{ __html: data.content }}
                            />
                        </div>
                    </div>
                )}

                {/* Presentation Viewer */}
                {type === 'ppt' && (
                    <div className="p-8 h-full flex flex-col justify-center">
                        <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group max-w-5xl mx-auto w-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
                            
                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-16 text-center">
                                <span className="text-[10px] text-white/40 font-mono mb-6 uppercase tracking-[0.3em]">
                                    Slide {activeSlide + 1} of {data.slides.length}
                                </span>
                                
                                <h2 className="text-4xl font-bold text-white mb-8 max-w-3xl">
                                    {data.slides[activeSlide]?.title}
                                </h2>
                                
                                <div 
                                    className="prose prose-invert max-w-2xl text-lg"
                                    dangerouslySetInnerHTML={{ __html: data.slides[activeSlide]?.content }}
                                />
                            </div>

                            {/* Navigation Controls */}
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                                    disabled={activeSlide === 0}
                                    className="h-10 w-10 rounded-full"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => setActiveSlide(Math.min(data.slides.length - 1, activeSlide + 1))}
                                    disabled={activeSlide === data.slides.length - 1}
                                    className="h-10 w-10 rounded-full"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Slide Indicators */}
                        <div className="mt-8 flex justify-center gap-2">
                            {data.slides.map((_: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSlide(idx)}
                                    className={`h-2 rounded-full transition-all ${
                                        idx === activeSlide ? 'w-8 bg-pink-500' : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Spreadsheet Viewer */}
                {type === 'spreadsheet' && (
                    <div className="p-8">
                        <div className="bg-[#0f0f13] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#18181b] text-white/70 font-mono text-xs uppercase border-b border-white/5 sticky top-0">
                                        <tr>
                                            {data.columns.map((col: string, idx: number) => (
                                                <th key={idx} className="px-6 py-4 font-bold tracking-wider text-left whitespace-nowrap">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.data.map((row: string[], rIdx: number) => (
                                            <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                                                {row.map((cell: string, cIdx: number) => (
                                                    <td key={cIdx} className="px-6 py-4 text-white/80 font-mono whitespace-nowrap">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Code Viewer */}
                {type === 'code' && (
                    <div className="flex flex-col h-full bg-[#0d0d10]">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1a1a1c]">
                            <span className="text-xs font-mono text-blue-400">{data.language}</span>
                            <span className="text-xs text-white/40">{data.content.split('\n').length} lines</span>
                        </div>
                        <div className="p-6 overflow-auto font-mono text-sm flex-1">
                            <pre className="text-white/90 leading-relaxed">
                                <code>{data.content}</code>
                            </pre>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
