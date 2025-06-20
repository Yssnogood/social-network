import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <main className="flex flex-col items-center text-center max-w-2xl">
                <h1 className="text-4xl font-bold mb-6">Welcome to Social Network</h1>
                <p className="text-xl mb-8">
                    Connect with friends, share moments, and discover new connections.
                </p>

                <Image
                    src="/social-placeholder.png"
                    alt="Social Network"
                    width={300}
                    height={200}
                    className="mb-8"
                    suppressHydrationWarning
                />

                <div className="flex gap-4 flex-col sm:flex-row">
                    <Link
                        href="/login"
                        className="rounded-full bg-foreground text-background px-8 py-3 font-medium text-lg hover:bg-foreground/90 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-full border border-foreground px-8 py-3 font-medium text-lg hover:bg-foreground/10 transition-colors"
                    >
                        Register
                    </Link>
                </div>
            </main>

            <footer className="mt-auto pt-8 text-center text-sm text-gray-500">
                <p>© 2025 Social Network. All rights reserved.</p>
            </footer>
        </div>
    );
}
