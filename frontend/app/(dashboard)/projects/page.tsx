'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreVertical, GitBranch, Clock } from 'lucide-react';

export default function ProjectsPage() {
    const projects = [
        { id: 1, name: 'E-commerce Platform', description: 'Next.js + Stripe + Supabase', lastEdited: '2 hours ago', status: 'Active', branch: 'main' },
        { id: 2, name: 'AI Chatbot', description: 'Python + LangChain + Streamlit', lastEdited: '1 day ago', status: 'Completed', branch: 'dev' },
        { id: 3, name: 'Portfolio Site', description: 'React + Tailwind + Framer Motion', lastEdited: '3 days ago', status: 'Active', branch: 'main' },
        { id: 4, name: 'Task Manager', description: 'Vue.js + Firebase', lastEdited: '1 week ago', status: 'Archived', branch: 'v1' },
        { id: 5, name: 'Weather App', description: 'React Native + OpenWeatherMap', lastEdited: '2 weeks ago', status: 'Active', branch: 'master' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage and organize your AI-generated applications.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Project
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">All</Button>
                    <Button variant="ghost" size="sm">Active</Button>
                    <Button variant="ghost" size="sm">Archived</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {projects.map((project) => (
                    <Card key={project.id} className="group hover:border-primary/50 transition-all duration-300">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
                                <CardDescription className="line-clamp-1">{project.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 rounded-md bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground text-sm mb-4">
                                Preview
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <GitBranch className="h-3 w-3" />
                                    {project.branch}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {project.lastEdited}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full text-xs h-8">Open in Editor</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
