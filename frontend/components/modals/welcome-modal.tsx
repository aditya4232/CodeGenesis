"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Rocket, Key, Settings, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function WelcomeModal() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Check if user has seen the welcome modal
        const hasSeenWelcome = localStorage.getItem("has-seen-welcome-v0.45")
        if (!hasSeenWelcome) {
            setOpen(true)
        }
    }, [])

    const handleClose = () => {
        setOpen(false)
        localStorage.setItem("has-seen-welcome-v0.45", "true")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px] bg-[#09090b] border-white/10 text-white">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">Welcome to CodeGenesis Beta v0.45</DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        The autonomous AI software architect that builds production-ready applications.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Beta Notice */}
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-yellow-500 mb-1">Development in Progress</h4>
                                <p className="text-sm text-slate-400">
                                    You are using an early beta version. Features are being added daily.
                                    Please report any bugs you encounter.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Getting Started Steps */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Getting Started</h3>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="mt-1 bg-primary/20 p-1.5 rounded-full">
                                <Key className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">1. Setup API Keys</h4>
                                <p className="text-sm text-slate-400 mb-2">
                                    To use the AI architect, you need to configure your API keys.
                                </p>
                                <div className="text-xs bg-black/50 p-2 rounded border border-white/10 mb-2">
                                    <span className="text-green-400">Recommended:</span> Anthropic (Claude 3.5 Sonnet) or OpenAI (GPT-4o)
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="mt-1 bg-purple-500/20 p-1.5 rounded-full">
                                <Settings className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="font-medium">2. Configure Preferences</h4>
                                <p className="text-sm text-slate-400">
                                    Customize your coding style, theme, and default model in settings.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Link href="/dashboard/settings" className="w-full sm:w-auto" onClick={handleClose}>
                        <Button variant="outline" className="w-full gap-2 border-white/10 hover:bg-white/5">
                            <Settings className="h-4 w-4" />
                            Go to Settings
                        </Button>
                    </Link>
                    <Button onClick={handleClose} className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
                        <Check className="h-4 w-4" />
                        Start Building
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
