import Link from "next/link";

export default function SimpleHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/home" className="font-bold text-lg text-white">
                    Social Network
                </Link>
                <Link href="/logout" className="text-sm text-white hover:text-blue-200">
                    Logout
                </Link>
            </div>
        </header>
    );
} 