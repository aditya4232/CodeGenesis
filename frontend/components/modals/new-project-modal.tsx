"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Sparkles, Code2, Palette, Zap, Database, Shield, Smartphone } from "lucide-react"

const FRAMEWORKS = [
    { id: 'vanilla', name: 'Vanilla JS', icon: '🌐', desc: 'Pure HTML/CSS/JS' },
    { id: 'react', name: 'React', icon: '⚛️', desc: 'React 19 + Vite' },
    { id: 'nextjs', name: 'Next.js', icon: '▲', desc: 'Full-stack React' },
    { id: 'vue', name: 'Vue.js', icon: '💚', desc: 'Vue 3 + Vite' },
    { id: 'svelte', name: 'Svelte', icon: '🔥', desc: 'SvelteKit' }
]

const STYLING = [
    { id: 'css', name: 'Vanilla CSS', icon: <Palette className="h-4 w-4" /> },
    { id: 'tailwind', name: 'Tailwind', icon: <Zap className="h-4 w-4" /> },
    { id: 'shadcn', name: 'shadcn/ui', icon: <Code2 className="h-4 w-4" /> }
]

const FEATURES = [
    { id: 'typescript', name: 'TypeScript', icon: '📘' },
    { id: 'auth', name: 'Auth', icon: '🔐' },
    { id: 'database', name: 'Database', icon: '🗄️' },
    { id: 'api', name: 'API', icon: '🔌' },
    { id: 'pwa', name: 'PWA', icon: '📱' },
    { id: 'seo', name: 'SEO', icon: '🔍' }
]

export function NewProjectModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        framework: "vanilla",
        styling: "css",
        features: [] as string[]
    })

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("Project name is required")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    framework: formData.framework,
                    description: `${formData.description}\n\nTech: ${formData.framework} + ${formData.styling}\nFeatures: ${formData.features.join(', ') || 'None'}`
                })
            })

            if (res.ok) {
                const project = await res.json()
                toast.success("Project created!")
                onOpenChange(false)
                setStep(1)
                setFormData({ name: "", description: "", framework: "vanilla", styling: "css", features: [] })
                router.push(`/dashboard/editor?id=${project.id}`)
            } else {
                throw new Error("Failed to create")
            }
        } catch (error) {
            toast.error("Failed to create project")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleFeature = (id: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(id)
                ? prev.features.filter(f => f !== id)
                : [...prev.features, id]
        }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] bg-[#09090b] border-white/10 text-white p-0 overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 bg-white/5">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }} />
                </div>

                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                            Create New Project
                        </DialogTitle>
                        <DialogDescription>
                            {step === 1 ? "Choose your tech stack and framework" : "Add project details"}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 1 && (
                        <div className="space-y-6 py-6">
                            {/* Framework */}
                            <div className="space-y-3">
                                <Label className="text-white/80">Framework</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {FRAMEWORKS.map(fw => (
                                        <button
                                            key={fw.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, framework: fw.id }))}
                                            className={`p-3 rounded-xl border text-center transition-all ${formData.framework === fw.id
                                                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                                }`}
                                        >
                                            <span className="text-2xl block mb-1">{fw.icon}</span>
                                            <span className="text-xs font-medium">{fw.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Styling */}
                            <div className="space-y-3">
                                <Label className="text-white/80">Styling</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {STYLING.map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, styling: s.id }))}
                                            className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${formData.styling === s.id
                                                    ? 'border-indigo-500 bg-indigo-500/10'
                                                    : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {s.icon}
                                            <span className="text-sm">{s.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3">
                                <Label className="text-white/80">Features (Optional)</Label>
                                <div className="grid grid-cols-6 gap-2">
                                    {FEATURES.map(f => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => toggleFeature(f.id)}
                                            className={`p-2 rounded-lg border text-center text-xs transition-all ${formData.features.includes(f.id)
                                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                                    : 'border-white/10 hover:border-white/20 text-white/60'
                                                }`}
                                        >
                                            <span className="block mb-0.5">{f.icon}</span>
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 py-6">
                            <div className="space-y-2">
                                <Label>Project Name</Label>
                                <Input
                                    placeholder="my-awesome-app"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="bg-black/40 border-white/10 h-12 text-lg"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    placeholder="Brief description of your project..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="bg-black/40 border-white/10 min-h-[100px]"
                                />
                            </div>

                            {/* Summary */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                <h4 className="text-sm font-medium text-white/80">Project Summary</h4>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs">
                                        {FRAMEWORKS.find(f => f.id === formData.framework)?.name}
                                    </span>
                                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                                        {STYLING.find(s => s.id === formData.styling)?.name}
                                    </span>
                                    {formData.features.map(f => (
                                        <span key={f} className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                                            {FEATURES.find(feat => feat.id === f)?.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        {step === 2 && (
                            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                Back
                            </Button>
                        )}
                        <Button type="button" variant="ghost" onClick={() => { onOpenChange(false); setStep(1) }}>
                            Cancel
                        </Button>
                        {step === 1 ? (
                            <Button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-500 gap-2">
                                Next
                                <span className="text-xs opacity-70">→</span>
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isLoading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 gap-2">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Create Project
                            </Button>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
