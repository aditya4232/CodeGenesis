"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function Pricing() {
    return (
        <section id="pricing" className="py-24">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Start for free, upgrade when you scale.
                    </p>
                </div>
                <div className="max-w-md mx-auto">
                    <div className="flex flex-col p-8 bg-background border rounded-3xl shadow-2xl border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 px-4 py-1 text-xs font-bold text-white bg-primary rounded-bl-xl">
                            POPULAR
                        </div>
                        <h3 className="text-2xl font-bold">Community Edition</h3>
                        <div className="mt-4 text-5xl font-extrabold">
                            $0 <span className="text-xl font-normal text-muted-foreground">/mo</span>
                        </div>
                        <p className="mt-2 text-muted-foreground">For hobbyists and students.</p>
                        <ul className="flex flex-col gap-4 mt-8">
                            {[
                                "Unlimited Projects",
                                "Access to Gemini Free Tier",
                                "Bring Your Own Key (OpenAI/Anthropic)",
                                "Community Support",
                                "Public Deployments",
                            ].map((feature) => (
                                <li key={feature} className="flex items-center">
                                    <Check className="w-5 h-5 mr-3 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/dashboard" className="w-full mt-8">
                            <Button className="w-full h-12 text-lg font-semibold">
                                Get Started Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
