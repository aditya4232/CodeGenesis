'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Clock, Code2, Sparkles, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';
import { getUserProjects, type Project } from '@/lib/supabase';
import Link from 'next/link';

import { NewProjectModal } from '@/components/modals/new-project-modal';

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

    useEffect(() => {
        const loadProjects = async () => {
            if (user?.id) {
                const userProjects = await getUserProjects(user.id);
                setProjects(userProjects);
                setIsLoading(false);
            }
        };

        if (isLoaded && user) {
            loadProjects();
        }
    }, [user, isLoaded]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const stats = [
        { label: 'Total Projects', value: projects.length, icon: Code2, color: 'text-blue-500' },
        { label: 'Active', value: projects.filter(p => p.status === 'in_progress').length, icon: TrendingUp, color: 'text-green-500' },
        { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-background p-10 text-white shadow-2xl ring-1 ring-white/10">
                <div className="relative z-10 max-w-2xl space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            {getGreeting()}, {user?.firstName || 'Developer'}! 👋
                        </h1>
                        <p className="mt-4 text-lg text-gray-300">
                            {projects.length === 0
                                ? "Ready to build something amazing? Let's get started with your first project."
                                : `You have ${projects.length} project${projects.length !== 1 ? 's' : ''} in your workspace. Keep building!`
                            }
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex gap-4 pt-4"
                    >
                        <Button onClick={() => setIsNewProjectOpen(true)} size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                            <Sparkles className="h-5 w-5" />
                            New Project
                        </Button>
                        <Link href="/dashboard/editor">
                            <Button size="lg" variant="outline" className="gap-2 bg-white/5 hover:bg-white/10 border-white/10">
                                <Code2 className="h-5 w-5" />
                                Open Editor
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute -bottom-20 right-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
            </section>

            {/* Stats Cards */}
            <section className="grid gap-6 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </section>

            {/* Recent Projects */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {projects.length === 0 ? 'Get Started' : 'Recent Projects'}
                    </h2>
                    {projects.length > 0 && (
                        <Button variant="ghost" className="gap-2">
                            View All <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        // Skeleton Loading State
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="h-[250px] flex flex-col justify-between">
                                <CardHeader className="space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-24 w-full rounded-md" />
                                </CardContent>
                                <CardFooter>
                                    <Skeleton className="h-4 w-1/3" />
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        // Actual Projects
                        <>
                            {projects.slice(0, 5).map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                {project.name}
                                                <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'in_progress' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    project.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                                                        project.status === 'deployed' ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>{project.description || 'No description'}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {project.tech_stack?.slice(0, 3).map((tech, i) => (
                                                    <span key={i} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.tech_stack && project.tech_stack.length > 3 && (
                                                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                                                        +{project.tech_stack.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="text-xs text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {new Date(project.updated_at).toLocaleDateString()}
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}

                            {/* Create New Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: projects.length * 0.1 }}
                            >
                                <Card
                                    onClick={() => setIsNewProjectOpen(true)}
                                    className="flex h-full flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer group min-h-[250px]"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                                        <Plus className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold">Create New Project</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Start from scratch or template</p>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </div>
            </section>
            <NewProjectModal open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
        </div>
    );
}
