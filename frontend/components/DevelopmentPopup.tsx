"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DevelopmentPopup() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show on every load as requested
        setIsVisible(true)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md bg-[#09090b] border border-primary/20 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="bg-primary/10 p-6 text-center border-b border-white/5">
                            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                                <Code2 className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Development Build</h3>
                            <p className="text-primary/80 text-sm font-medium">Beta v0.45 Preview</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                    This is a preview version of CodeGenesis. Features may be unstable or subject to change.
                                </p>
                            </div>

                            <div className="text-center space-y-1 py-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Developed By</p>
                                <p className="font-medium text-white">Aditya Shenvi & Sneha Sah</p>
                            </div>

                            <Button
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={() => setIsVisible(false)}
                            >
                                Enter CodeGenesis
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
