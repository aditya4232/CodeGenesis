'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Globe } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black overflow-x-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

            <div className="max-w-4xl mx-auto px-4 py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="text-center space-y-4 mb-12">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-4 ring-1 ring-primary/20">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Your privacy is our priority. Transparent, secure, and user-centric.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <PolicySection
                            icon={<Eye className="h-5 w-5 text-blue-400" />}
                            title="1. Data Collection"
                            content="We collect information you provide directly to us, such as when you create an account, input project requirements, or communicate with us. This may include your name, email address, and project specifications."
                        />

                        <PolicySection
                            icon={<Server className="h-5 w-5 text-purple-400" />}
                            title="2. Usage of Data"
                            content={
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Provide, maintain, and improve our services.</li>
                                    <li>Generate code and architecture based on your prompts.</li>
                                    <li>Send you technical notices and support messages.</li>
                                </ul>
                            }
                        />

                        <PolicySection
                            icon={<Lock className="h-5 w-5 text-green-400" />}
                            title="3. Data Security"
                            content="We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your API keys are stored locally."
                        />

                        <PolicySection
                            icon={<Globe className="h-5 w-5 text-orange-400" />}
                            title="4. Third-Party Services"
                            content="We may use third-party services (like AI model providers) to process your requests. We ensure these providers adhere to strict data protection standards."
                        />

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-sm text-muted-foreground flex justify-between items-center mt-8">
                            <div>
                                <p>Last updated: December 2025</p>
                                <p className="mt-1">Contact: privacy@codegenesis.ai</p>
                            </div>
                            <Shield className="h-10 w-10 text-white/10" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function PolicySection({ icon, title, content }: { icon: React.ReactNode, title: string, content: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                    {icon}
                </div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>
            <div className="text-muted-foreground leading-relaxed pl-12">
                {content}
            </div>
        </motion.div>
    )
}
