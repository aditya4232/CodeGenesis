"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Save, Check, Key, Cpu, Zap } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApiKeysPage() {
    const [keys, setKeys] = useState({
        openai: "",
        anthropic: "",
        openrouter: "",
        groq: "",
        stability: ""
    })
    const [models, setModels] = useState({
        openai: "gpt-4o",
        anthropic: "claude-3-5-sonnet-20240620",
        openrouter: "google/gemini-2.0-flash-exp:free",
        groq: "llama3-70b-8192"
    })
    const [customModels, setCustomModels] = useState({
        openrouter: "",
        groq: ""
    })
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        const storedKeys = localStorage.getItem("user_api_keys")
        const storedModels = localStorage.getItem("user_models")
        if (storedKeys) setKeys(JSON.parse(storedKeys))
        if (storedModels) setModels(JSON.parse(storedModels))
    }, [])

    const handleSave = () => {
        localStorage.setItem("user_api_keys", JSON.stringify(keys))
        localStorage.setItem("user_models", JSON.stringify(models))
        toast.success("Configuration saved successfully")
    }

    const toggleShowKey = (provider: string) => {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
    }

    if (!isClient) return null

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API Configuration</h1>
                <p className="text-muted-foreground">Manage your API keys and model preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* OpenAI */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-green-500" />
                            OpenAI
                        </CardTitle>
                        <CardDescription>Standard industry models.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="relative">
                                <Input
                                    type={showKeys.openai ? "text" : "password"}
                                    value={keys.openai}
                                    onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                                    placeholder="sk-..."
                                    className="pr-10 bg-black/20 border-white/10"
                                />
                                <button
                                    onClick={() => toggleShowKey('openai')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                >
                                    {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        {keys.openai && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={models.openai} onValueChange={(val) => setModels(prev => ({ ...prev, openai: val }))}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Anthropic */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-purple-500" />
                            Anthropic
                        </CardTitle>
                        <CardDescription>High-performance Claude models.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="relative">
                                <Input
                                    type={showKeys.anthropic ? "text" : "password"}
                                    value={keys.anthropic}
                                    onChange={(e) => setKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                                    placeholder="sk-ant-..."
                                    className="pr-10 bg-black/20 border-white/10"
                                />
                                <button
                                    onClick={() => toggleShowKey('anthropic')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                >
                                    {showKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        {keys.anthropic && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={models.anthropic} onValueChange={(val) => setModels(prev => ({ ...prev, anthropic: val }))}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</SelectItem>
                                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* OpenRouter */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-500" />
                            OpenRouter
                        </CardTitle>
                        <CardDescription>Access to various models (Llama, Mistral, Gemini, etc.).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="relative">
                                <Input
                                    type={showKeys.openrouter ? "text" : "password"}
                                    value={keys.openrouter}
                                    onChange={(e) => setKeys(prev => ({ ...prev, openrouter: e.target.value }))}
                                    placeholder="sk-or-..."
                                    className="pr-10 bg-black/20 border-white/10"
                                />
                                <button
                                    onClick={() => toggleShowKey('openrouter')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                >
                                    {showKeys.openrouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        {keys.openrouter && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={models.openrouter}
                                        onValueChange={(val) => {
                                            setModels(prev => ({ ...prev, openrouter: val }))
                                            if (val !== 'custom') setCustomModels(prev => ({ ...prev, openrouter: '' }))
                                        }}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10 flex-1">
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</SelectItem>
                                            <SelectItem value="meta-llama/llama-3-70b-instruct">Llama 3 70B</SelectItem>
                                            <SelectItem value="mistralai/mistral-large">Mistral Large</SelectItem>
                                            <SelectItem value="custom">Custom Model ID</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {models.openrouter === 'custom' && (
                                        <Input
                                            placeholder="e.g. google/gemini-pro"
                                            value={customModels.openrouter}
                                            onChange={(e) => {
                                                setCustomModels(prev => ({ ...prev, openrouter: e.target.value }))
                                                // We don't update main model state here, we'll handle it on save or use effect
                                            }}
                                            className="flex-1 bg-black/20 border-white/10"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Groq */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-orange-500" />
                            Groq
                        </CardTitle>
                        <CardDescription>Ultra-fast inference.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <div className="relative">
                                <Input
                                    type={showKeys.groq ? "text" : "password"}
                                    value={keys.groq}
                                    onChange={(e) => setKeys(prev => ({ ...prev, groq: e.target.value }))}
                                    placeholder="gsk_..."
                                    className="pr-10 bg-black/20 border-white/10"
                                />
                                <button
                                    onClick={() => toggleShowKey('groq')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                >
                                    {showKeys.groq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        {keys.groq && (
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Select value={models.groq} onValueChange={(val) => setModels(prev => ({ ...prev, groq: val }))}>
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="llama3-70b-8192">Llama 3 70B</SelectItem>
                                        <SelectItem value="llama3-8b-8192">Llama 3 8B</SelectItem>
                                        <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 gap-2">
                    <Save className="h-4 w-4" />
                    Save Configuration
                </Button>
            </div>
        </div>
    )
}
