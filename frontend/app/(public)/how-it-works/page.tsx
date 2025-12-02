'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Cpu, Code, Rocket, Settings, GitBranch, ArrowRight } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-black overflow-x-hidden relative">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 z-0" fill="white" />

            <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-4 mb-20"
                >
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-xl mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                        The Process
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        From Idea to Deployment in <span className="text-primary">Minutes</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        CodeGenesis uses advanced AI agents to orchestrate the entire software development lifecycle.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

                    <div className="space-y-24">
                        <Step
                            number="01"
                            title="Describe Your Vision"
                            description="Simply chat with the Architect Agent. Describe your app idea, requirements, and desired features in plain English. The agent will ask clarifying questions to understand your needs."
                            icon={<MessageSquare className="h-8 w-8 text-blue-500" />}
                            align="left"
                        />

                        <Step
                            number="02"
                            title="AI Architecture Planning"
                            description="The Architect Agent analyzes your requirements and generates a comprehensive technical specification, including database schema, API endpoints, and component structure."
                            icon={<Cpu className="h-8 w-8 text-purple-500" />}
                            align="right"
                        />

                        <Step
                            number="03"
                            title="Configure & Customize"
                            description="Review the proposed plan. Adjust the tech stack, choose your preferred UI library, or modify specific features before coding begins."
                            icon={<Settings className="h-8 w-8 text-yellow-500" />}
                            align="left"
                        />

                        <Step
                            number="04"
                            title="Autonomous Coding"
                            description="The Engineering Agent takes over, writing clean, production-ready code. It handles everything from setting up the project structure to implementing complex logic."
                            icon={<Code className="h-8 w-8 text-green-500" />}
                            align="right"
                        />

                        <Step
                            number="05"
                            title="Version Control & Review"
                            description="All code is committed to a local Git repository. You have full access to the source code and can review every change made by the AI."
                            icon={<GitBranch className="h-8 w-8 text-orange-500" />}
                            align="left"
                        />

                        <Step
                            number="06"
                            title="Deploy & Scale"
                            description="With a single click, deploy your application to the cloud. CodeGenesis supports major providers like Vercel, Netlify, and AWS."
                            icon={<Rocket className="h-8 w-8 text-red-500" />}
                            align="right"
                        />
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 p-12 text-center border border-white/10"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold md:text-5xl mb-4">
                            Ready to Experience It Yourself?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join thousands of developers building the future with AI
                        </p>
                        <Link href="/sign-up">
                            <Button size="lg" className="h-14 px-10 text-lg gap-2 rounded-full group">
                                Start Building for Free
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function Step({ number, title, description, icon, align }: { number: string, title: string, description: string, icon: React.ReactNode, align: 'left' | 'right' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className={`flex flex-col md:flex-row gap-8 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
        >
            <div className={`flex-1 text-center ${align === 'right' ? 'md:text-left' : 'md:text-right'}`}>
                <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 md:hidden`}>
                    {icon}
                </div>
                <h2 className="text-3xl font-bold mb-4">
                    <span className="text-primary mr-2">{number}.</span>
                    {title}
                </h2>
                <p className="text-lg text-muted-foreground">{description}</p>
            </div>

            <div className="relative flex items-center justify-center w-16 h-16 shrink-0 hidden md:flex">
                <div className="absolute inset-0 bg-black border-2 border-primary rounded-full z-10" />
                <div className="relative z-20">
                    {icon}
                </div>
            </div>

            <div className="flex-1">
                <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors group">
                    <div className="p-4 text-center">
                        <span className="text-sm group-hover:text-primary transition-colors">Illustration for {title}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
