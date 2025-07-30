'use client';

import { useState, useEffect, useRef } from "react";
import { useCookies } from "next-client-cookies";
import { fetchUsersByUsername } from "../../services/contact";
import { getUserIdFromToken } from "../../services/user";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const cookies = useCookies();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Ferme le dropdown si on clique à l’extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logique de recherche avec timeout
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (query.trim()) {
                const token = cookies.get("jwt");
                const userId = await getUserIdFromToken(token);
                try {
                    const res = await fetchUsersByUsername(query, userId || "error");
                    if ((res && Array.isArray(res)) && res.length > 0) {
                        const mapped = res.map((user: any) => ({
                            id: user.id,
                            username: user.username,
                            avatar: user.avatar_path || '/social-placeholder.png',
                            status: user.status || 'offline',
                        }));
                        setResults(mapped);
                    } else {
                        setResults([]);
                    }
                    setShowDropdown(true);
                } catch (e) {
                    console.error("🔍 search error", e);
                    setResults([]);
                    setShowDropdown(true);
                }
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [query]);

    const startConversation = (userId: number) => {
        router.push(`/contact?start=${userId}`);
        setQuery('');
        setResults([]);
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full max-w-xs z-50" ref={containerRef}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    if (query.trim() && results.length >= 0) {
                        setShowDropdown(true);
                    }
                }}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-1.5 rounded-xl shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition text-sm"
            />

            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>

            {query.trim() && showDropdown && (
                <div className="absolute top-10 left-0 w-full bg-white text-black shadow-lg rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    {results.length > 0 ? (
                        results.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => startConversation(user.id)}
                            >
                                <Image
                                    src={user.avatar}
                                    alt={user.username}
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                />
                                <span>{user.username}</span>
                                {user.status === 'online' && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>
                    )}
                </div>
            )}
        </div>
    );
}
