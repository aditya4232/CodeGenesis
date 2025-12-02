"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background text-foreground pt-16">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />

            <div className="container z-10 flex flex-col items-center px-4 text-center md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    CodeGenesis v1.0 is Live
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
                >
                    Build Apps at the <br />
                    <span className="text-primary">Speed of Thought</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-[700px] mt-6 text-lg text-muted-foreground md:text-xl"
                >
                    The Autonomous AI Software Architect. Just describe your idea, and our multi-agent swarm plans, codes, and deploys it instantly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col gap-4 mt-8 sm:flex-row"
                >
                    <Link href="/dashboard">
                        <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg shadow-primary/20">
                            Start Building Free <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                            See How It Works
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
