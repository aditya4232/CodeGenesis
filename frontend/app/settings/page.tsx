"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

            <div className="space-y-8">
                {/* API Keys Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>LLM API Keys (BYOK)</CardTitle>
                        <CardDescription>
                            Enter your own keys to use OpenAI or Anthropic models. Leave blank to use the free Gemini tier.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="openai">OpenAI API Key</Label>
                            <Input id="openai" type="password" placeholder="sk-..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="anthropic">Anthropic API Key</Label>
                            <Input id="anthropic" type="password" placeholder="sk-ant-..." />
                        </div>
                        <Button>Save Keys</Button>
                    </CardContent>
                </Card>

                {/* MCP Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Model Context Protocol (MCP)</CardTitle>
                        <CardDescription>
                            Connect external tools by adding their MCP Server URLs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mcp-url">MCP Server URL</Label>
                            <div className="flex gap-2">
                                <Input id="mcp-url" placeholder="http://localhost:8000/mcp" />
                                <Button variant="secondary">Add</Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="text-sm text-muted-foreground">
                            No servers connected.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
