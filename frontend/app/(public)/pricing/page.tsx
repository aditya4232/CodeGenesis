'use client';

import { motion } from 'framer-motion';
import { Check, Github, Sparkles, Zap, Code2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black">
            {/* Hero Section */}
            <section className="pt-20 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            Start Building for Free
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Open source, forever free. No credit card required. Build unlimited projects with your own API keys.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Free Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative"
                        >
                            <div className="absolute -inset-px bg-gradient-to-b from-primary/50 to-primary/0 rounded-2xl blur-sm" />
                            <div className="relative bg-black border border-white/10 rounded-2xl p-8 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Open Source</h3>
                                        <p className="text-muted-foreground mt-1">For developers & builders</p>
                                    </div>
                                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-medium text-green-500">Popular</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold text-white">$0</span>
                                        <span className="text-muted-foreground">/forever</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    <FeatureItem text="Unlimited projects" />
                                    <FeatureItem text="Full source code access" />
                                    <FeatureItem text="Bring your own API keys" />
                                    <FeatureItem text="Local deployment" />
                                    <FeatureItem text="MCP protocol support" />
                                    <FeatureItem text="Community support" />
                                    <FeatureItem text="Regular updates" />
                                </ul>

                                <Link href="https://github.com/aditya4232/CodeGenesis" target="_blank" className="block">
                                    <Button className="w-full h-12 text-base font-semibold gap-2 bg-white text-black hover:bg-white/90">
                                        <Github className="h-5 w-5" />
                                        Clone on GitHub
                                    </Button>
                                </Link>

                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    ⭐ Star us on GitHub to support development
                                </p>
                            </div>
                        </motion.div>

                        {/* Self-Hosted Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 h-full backdrop-blur-sm">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white">Self-Hosted</h3>
                                    <p className="text-muted-foreground mt-1">Deploy on your infrastructure</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold text-white">Free</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        You only pay for your cloud costs
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    <FeatureItem text="Everything in Open Source" />
                                    <FeatureItem text="Deploy to Vercel/Netlify" />
                                    <FeatureItem text="Custom domain support" />
                                    <FeatureItem text="Environment variables" />
                                    <FeatureItem text="Automatic deployments" />
                                    <FeatureItem text="Production-ready setup" />
                                    <FeatureItem text="Deployment guides" />
                                </ul>

                                <Link href="/docs" className="block">
                                    <Button variant="outline" className="w-full h-12 text-base font-semibold gap-2 border-white/10 hover:bg-white/5">
                                        <Code2 className="h-5 w-5" />
                                        View Documentation
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground">Everything you need to know about CodeGenesis</p>
                    </motion.div>

                    <div className="grid gap-6">
                        <FAQItem
                            question="Why is it free?"
                            answer="CodeGenesis is open source because we believe powerful development tools should be accessible to everyone. You bring your own API keys, so you control the costs."
                        />
                        <FAQItem
                            question="What API keys do I need?"
                            answer="You'll need API keys from OpenAI, Anthropic, or other LLM providers. You can use any provider that supports the OpenAI API format."
                        />
                        <FAQItem
                            question="Can I use this commercially?"
                            answer="Yes! CodeGenesis is MIT licensed, which means you can use it for any purpose, including commercial projects."
                        />
                        <FAQItem
                            question="How do I get support?"
                            answer="Join our Discord community for help, or open an issue on GitHub. We also have comprehensive documentation and video tutorials."
                        />
                        <FAQItem
                            question="Can I contribute?"
                            answer="Absolutely! We welcome contributions. Check out our GitHub repository for contribution guidelines and open issues."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/20 p-12 text-center border border-white/10"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Start Building?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Clone the repository and start building production-ready applications in minutes
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="https://github.com/aditya4232/CodeGenesis" target="_blank">
                                    <Button size="lg" className="gap-2 h-12 px-8">
                                        <Github className="h-5 w-5" />
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link href="/docs">
                                    <Button size="lg" variant="outline" className="gap-2 h-12 px-8 border-white/10 hover:bg-white/5">
                                        <Code2 className="h-5 w-5" />
                                        Read Documentation
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-slate-300">{text}</span>
        </li>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary/30 transition-colors"
        >
            <h3 className="text-lg font-semibold mb-2 text-white">{question}</h3>
            <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </motion.div>
    );
}
