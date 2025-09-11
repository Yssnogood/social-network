import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Header adapté pour la page d'accueil */}
            <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-white">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">SN</span>
                        </div>
                        <span>Social Network</span>
                    </Link>
                    <nav className="flex gap-4 items-center">
                        <Button asChild variant="ghost">
                            <Link href="/login">
                                Login
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">
                                Register
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                <main className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Welcome to Social Network
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-2xl">
                            Connect with friends, share moments, and discover new connections in a modern, beautiful interface.
                        </p>
                    </div>

                    <div className="mb-12 relative">
                        <div className="w-80 h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-zinc-800">
                            <div className="text-6xl">🌐</div>
                        </div>
                        <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-2xl">💬</span>
                        </div>
                        <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center animate-pulse delay-500">
                            <span className="text-xl">👥</span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-col sm:flex-row">
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 h-auto">
                            <Link href="/login">
                                Get Started
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-lg px-8 py-4 h-auto">
                            <Link href="/register">
                                Create Account
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💬</span>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Real-time Chat</h3>
                            <p className="text-zinc-400 text-sm">Stay connected with instant messaging and group conversations</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Join Groups</h3>
                            <p className="text-zinc-400 text-sm">Create and join communities around your interests</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <h3 className="font-semibold text-white mb-2">Share Posts</h3>
                            <p className="text-zinc-400 text-sm">Express yourself with posts, comments, and reactions</p>
                        </div>
                    </div>
                </main>

                <footer className="mt-16 pt-8 text-center text-sm text-zinc-500">
                    <p>© 2025 Social Network. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
