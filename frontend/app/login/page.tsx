"use client";

import Link from "next/link";
import React, { useState } from 'react';
import { redirect } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { url } from "@/lib/config";

export default function Login() {
    const cookies = useCookies();
    
    if (cookies.get('jwt') != undefined) {
        redirect('/home');
    }
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const resp = await fetch(url + "/login", {
                method: "POST",
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    password: password
                })
            });
            
            if (resp.ok) {
                const r = await resp.json();
                cookies.set('jwt', r.jwt, {
                    expires: 1,
                    path: '/',
                });
                cookies.set('user', r.user, {
                    expires: 1,
                    path: '/',
                });
                redirect('/home');
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4">
                <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-white">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">SN</span>
                    </div>
                    <span>Social Network</span>
                </Link>
            </div>

            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                                Email address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="bg-zinc-800 border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="bg-zinc-800 border-zinc-700"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-400 text-sm">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                                Create one here
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
