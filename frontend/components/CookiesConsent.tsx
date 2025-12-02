"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Cookie, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CookiesConsent() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent")
        if (!consent) {
            setShow(true)
        }
    }, [])

    const accept = () => {
        localStorage.setItem("cookie-consent", "true")
        setShow(false)
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
                >
                    <div className="bg-[#09090b] border border-white/10 rounded-lg p-4 shadow-2xl flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Cookie className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-sm">We use cookies</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    We use cookies to enhance your experience and analyze our traffic.
                                    By continuing, you agree to our use of cookies.
                                </p>
                            </div>
                            <button
                                onClick={() => setShow(false)}
                                className="text-muted-foreground hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-white/10"
                                onClick={() => setShow(false)}
                            >
                                Decline
                            </Button>
                            <Button
                                size="sm"
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={accept}
                            >
                                Accept
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
