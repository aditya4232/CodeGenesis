'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Cpu, Zap, Globe, Shield, Star, Users, Rocket, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Spotlight } from '@/components/ui/spotlight';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 z-0" fill="white" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black" />
          <div className="container relative mx-auto px-4 text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-4xl space-y-8"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary backdrop-blur-xl">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                Beta v0.45 • The Journey Begins
              </div>

              <h1 className="text-5xl font-bold tracking-tight md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                Architect Software <br />
                <span className="text-primary">Autonomously</span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                CodeGenesis is an autonomous AI software architect.
                Describe your vision, and watch as it plans, builds, and deploys production-ready applications.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="h-12 px-8 text-base gap-2 rounded-full group">
                    Start Building Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-white/10 bg-white/5 hover:bg-white/10">
                    How it Works
                  </Button>
                </Link>
              </div>

              {/* Beta Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="pt-12"
              >
                <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Rocket className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">Beta v0.45</div>
                      <div className="text-xs text-muted-foreground">Early Access</div>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">Open Source</div>
                      <div className="text-xs text-muted-foreground">MIT Licensed</div>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Star className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">Community</div>
                      <div className="text-xs text-muted-foreground">Join the Journey</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[100px] rounded-full -z-10" />
        </section>


        {/* Features Grid */}
        <section id="features" className="py-24 bg-black/50 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-bold md:text-4xl mb-4"
              >
                Why CodeGenesis?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground max-w-2xl mx-auto"
              >
                Built for developers who want to focus on architecture and logic, not boilerplate.
              </motion.p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<Code2 className="h-8 w-8 text-blue-500" />}
                title="Full-Stack Generation"
                description="Generates complete frontend and backend code, database schemas, and API documentation."
                delay={0}
              />
              <FeatureCard
                icon={<Cpu className="h-8 w-8 text-purple-500" />}
                title="AI Architect Agent"
                description="Intelligent planning system that understands complex requirements and edge cases."
                delay={0.1}
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-yellow-500" />}
                title="Instant Deployment"
                description="One-click deployment to Vercel, Netlify, or your own cloud infrastructure."
                delay={0.2}
              />
              <FeatureCard
                icon={<Globe className="h-8 w-8 text-green-500" />}
                title="Modern Tech Stack"
                description="Built on Next.js 16, Tailwind CSS v4, TypeScript, and Python FastAPI."
                delay={0.3}
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-red-500" />}
                title="Secure by Design"
                description="Implements best security practices, input validation, and auth flows automatically."
                delay={0.4}
              />
              <FeatureCard
                icon={<Sparkles className="h-8 w-8 text-cyan-500" />}
                title="Self-Healing Code"
                description="Automatically detects and fixes runtime errors and build issues."
                delay={0.5}
              />
            </div>
          </div>
        </section>

        {/* Early Adopters */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold md:text-4xl mb-4">Be an Early Adopter</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join us in shaping the future of AI-powered development. Your feedback matters.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <EarlyAdopterCard
                icon={<Code2 className="h-6 w-6" />}
                title="Shape the Product"
                description="Your feedback directly influences our roadmap and feature development"
              />
              <EarlyAdopterCard
                icon={<Users className="h-6 w-6" />}
                title="Join the Community"
                description="Connect with fellow developers building the future of AI coding"
              />
              <EarlyAdopterCard
                icon={<Star className="h-6 w-6" />}
                title="Early Access"
                description="Get first access to new features and updates as we grow"
              />
            </div>
          </div>
        </section>

        {/* Meet the Makers */}
        <section className="py-24 bg-black/50 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold md:text-4xl mb-4">Meet the Makers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The passionate developers behind CodeGenesis.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <MakerCard
                name="Aditya Shenvi"
                role="Lead Developer & Architect"
                linkedin="https://www.linkedin.com/in/adityashenvi/"
                github="https://github.com/aditya4232"
              />
              <MakerCard
                name="Sneha Sah"
                role="Frontend Engineer & UI/UX"
                linkedin="https://www.linkedin.com/in/sneha-sah-760b40250/"
                github="https://github.com/amyy45"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 p-12 text-center border border-white/10"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold md:text-5xl mb-4">
                  Ready to Build Something Amazing?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Start building production-ready applications with AI. Join our beta and help shape the future.
                </p>
                <Link href="/sign-up">
                  <Button size="lg" className="h-14 px-10 text-lg gap-2 rounded-full">
                    Get Started for Free
                    <Rocket className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 group"
    >
      <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function EarlyAdopterCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300 group text-center"
    >
      <div className="mb-4 mx-auto p-4 rounded-full bg-primary/10 w-fit group-hover:scale-110 transition-transform">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}


function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}
