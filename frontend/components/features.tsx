"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Code2, Layers, Zap } from "lucide-react";

const features = [
    {
        title: "Text-to-App Generation",
        description: "Describe your app in plain English. Our AI Architect plans the structure, and the Coding Swarm builds it file by file.",
        icon: Bot,
    },
    {
        title: "Multi-Agent Swarm",
        description: "Specialized agents for Planning, Coding, and QA work together to ensure high-quality, bug-free code.",
        icon: Layers,
    },
    {
        title: "Live Preview Sandbox",
        description: "Watch your app come to life in real-time. Interact with the running application as the AI writes code.",
        icon: Zap,
    },
    {
        title: "OpenLovable Editor",
        description: "Click any element in the preview to edit it instantly. 'Make this blue' is all you need to say.",
        icon: Code2,
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Everything you need to build
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        From idea to deployment in minutes, not months.
                    </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Card key={index} className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
                            <CardHeader>
                                <feature.icon className="w-10 h-10 mb-4 text-primary" />
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
