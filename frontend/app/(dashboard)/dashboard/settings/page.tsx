"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, Settings, Database, Shield, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="grid gap-6">
                <Link href="/dashboard/settings/api-keys">
                    <Card className="hover:bg-white/5 transition-colors cursor-pointer border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Key className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">API Keys</CardTitle>
                                    <CardDescription>Configure OpenAI, Anthropic, and other API keys</CardDescription>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/settings/preferences">
                    <Card className="hover:bg-white/5 transition-colors cursor-pointer border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Settings className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Preferences</CardTitle>
                                    <CardDescription>Customize editor, theme, and default models</CardDescription>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/settings/data">
                    <Card className="hover:bg-white/5 transition-colors cursor-pointer border-white/10 bg-black/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <Database className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Data Management</CardTitle>
                                    <CardDescription>Export data, retention policy, and account deletion</CardDescription>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
