"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Clock, Download } from "lucide-react"
import { toast } from "sonner"

export default function DataSettingsPage() {
    const handleExport = () => {
        toast.success("Export Started", {
            description: "We are preparing your data export. You will receive an email shortly."
        })
    }

    const handleDelete = () => {
        toast.error("Action Required", {
            description: "Please contact support to permanently delete your account."
        })
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
                <p className="text-muted-foreground">
                    Control your data, export projects, and manage retention policies.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Retention Policy */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Data Retention Policy
                        </CardTitle>
                        <CardDescription>
                            How long we keep your data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                            <p className="font-medium text-blue-400 mb-2">30-Day Auto-Deletion</p>
                            <p className="text-slate-300">
                                To ensure privacy and security, all temporary chat history and generated artifacts are automatically deleted 30 days after creation.
                                Your saved projects and code repositories are retained indefinitely until you delete them.
                            </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Next scheduled cleanup:</span>
                            <span>Tomorrow at 00:00 UTC</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Data */}
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-green-500" />
                            Export Data
                        </CardTitle>
                        <CardDescription>
                            Download a copy of all your projects and settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={handleExport} className="border-white/10 hover:bg-white/5">
                            Request Data Export
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-red-950/10 border-red-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Delete Account</h4>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and all associated data.
                                </p>
                            </div>
                            <Button variant="destructive" onClick={handleDelete} className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
