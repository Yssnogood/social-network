import Link from "next/link";

interface BackButtonProps {
    href: string;
    text: string;
}

export default function BackButton({ href, text }: BackButtonProps) {
    return (
        <Link
            href={href}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
        >
            ← {text}
        </Link>
    );
} 