import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/home" className="font-bold text-lg text-white">
                        Social Network
                    </Link>
                    <nav className="flex gap-4 items-center">
                        <button
                            className="text-sm text-white hover:text-blue-200 cursor-pointer flex items-center"
                            aria-label="Notifications"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>

                        <Link
                            href="/logout"
                            className="text-sm text-white hover:text-blue-200"
                        >
                            Logout
                        </Link>

                        <Link
                            href="/profile"
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-blue-100"
                        >
                            <Image
                                src="/social-placeholder.png"
                                alt="Profile"
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                        </Link>
                    </nav>
                </div>
            </header>
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Welcome to Our App</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Your journey starts here
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
