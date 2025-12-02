"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export default function Settings() {
    const [apiKey, setApiKey] = useState("");
    const [provider, setProvider] = useState<"openai" | "anthropic" | "gemini" | "a4f" | "custom">("openai");
    const [baseUrl, setBaseUrl] = useState("");
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
    const [saved, setSaved] = useState(false);

    // Load saved settings from localStorage
    useEffect(() => {
        const savedKey = localStorage.getItem("user_api_key");
        const savedProvider = localStorage.getItem("user_provider") as any;
        const savedBaseUrl = localStorage.getItem("user_base_url");

        if (savedKey) setApiKey(savedKey);
        if (savedProvider) setProvider(savedProvider);
        if (savedBaseUrl) setBaseUrl(savedBaseUrl);
    }, []);

    const handleValidate = async () => {
        if (!apiKey) return;

        setValidating(true);
        setValidationResult(null);

        try {
            const result = await api.validateAPIKey(apiKey, provider);
            setValidationResult(result);
        } catch (error) {
            setValidationResult({ valid: false, message: "Validation failed" });
        } finally {
            setValidating(false);
        }
    };

    const handleSave = () => {
        if (apiKey) {
            localStorage.setItem("user_api_key", apiKey);
            localStorage.setItem("user_provider", provider);
            if (baseUrl) {
                localStorage.setItem("user_base_url", baseUrl);
            } else {
                localStorage.removeItem("user_base_url");
            }
        } else {
            localStorage.removeItem("user_api_key");
            localStorage.removeItem("user_provider");
            localStorage.removeItem("user_base_url");
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClear = () => {
        setApiKey("");
        setBaseUrl("");
        localStorage.removeItem("user_api_key");
        localStorage.removeItem("user_provider");
        localStorage.removeItem("user_base_url");
        setValidationResult(null);
    };

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">
                Configure your API keys to generate projects
            </p>

            <div className="space-y-8">
                {/* Important Notice */}
                <Card className="border-orange-500/50 bg-orange-500/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="w-5 h-5" />
                            API Key Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>
                            <strong>You must configure your own API key to generate projects.</strong>
                        </p>
                        <p>
                            The platform's AI chatbot and recommendations are free, but project generation requires your own API credentials for cost control and privacy.
                        </p>
                    </CardContent>
                </Card>

                {/* API Keys Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>
                            Choose a provider and enter your API key. You can also use a custom API endpoint.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="provider">Provider</Label>
                            <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="openai">OpenAI (GPT-4o-mini)</SelectItem>
                                    <SelectItem value="anthropic">Anthropic (Claude 3.5 Sonnet)</SelectItem>
                                    <SelectItem value="gemini">Google Gemini (1.5 Flash)</SelectItem>
                                    <SelectItem value="a4f">A4F (Gemini 2.5 Flash)</SelectItem>
                                    <SelectItem value="custom">Custom API Endpoint</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {provider === "custom" && (
                            <div className="space-y-2">
                                <Label htmlFor="baseurl">Custom Base URL</Label>
                                <Input
                                    id="baseurl"
                                    type="url"
                                    placeholder="https://api.example.com/v1"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the base URL for your custom OpenAI-compatible API endpoint
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="apikey">API Key</Label>
                            <Input
                                id="apikey"
                                type="password"
                                placeholder={
                                    provider === "openai" ? "sk-..." :
                                        provider === "anthropic" ? "sk-ant-..." :
                                            provider === "gemini" ? "AIza..." :
                                                "your-api-key"
                                }
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </div>

                        {validationResult && (
                            <div className={`flex items-center gap-2 text-sm ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                                {validationResult.valid ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <XCircle className="w-4 h-4" />
                                )}
                                <span>{validationResult.message}</span>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleValidate}
                                variant="outline"
                                disabled={!apiKey || validating}
                            >
                                {validating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Validate Key
                            </Button>
                            <Button onClick={handleSave} disabled={!apiKey}>
                                {saved ? "Saved!" : "Save Settings"}
                            </Button>
                            <Button onClick={handleClear} variant="destructive">
                                Clear
                            </Button>
                        </div>

                        <Separator />

                        <div className="text-sm text-muted-foreground space-y-2">
                            <p><strong>How it works:</strong></p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Platform features (AI chatbot, recommendations) use our free API</li>
                                <li>Your API key is ONLY used for generating your projects</li>
                                <li>Keys are stored locally in your browser (never sent to our servers)</li>
                                <li>You have full control over your API usage and costs</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Provider Info Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm">OpenAI</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                            <p><strong>Model:</strong> GPT-4o-mini</p>
                            <p><strong>Cost:</strong> ~$0.15 per 1M tokens</p>
                            <p><strong>Get Key:</strong> platform.openai.com</p>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm">Anthropic</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                            <p><strong>Model:</strong> Claude 3.5 Sonnet</p>
                            <p><strong>Cost:</strong> ~$3 per 1M tokens</p>
                            <p><strong>Get Key:</strong> console.anthropic.com</p>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm">Google Gemini</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                            <p><strong>Model:</strong> Gemini 1.5 Flash</p>
                            <p><strong>Cost:</strong> Free tier available</p>
                            <p><strong>Get Key:</strong> makersuite.google.com</p>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm">A4F</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-1">
                            <p><strong>Model:</strong> Gemini 2.5 Flash</p>
                            <p><strong>Cost:</strong> Pay-as-you-go</p>
                            <p><strong>Get Key:</strong> api.a4f.co</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
