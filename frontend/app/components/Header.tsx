"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useCookies } from "next-client-cookies";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import { Input } from "@/components/ui/input";
import { Bell, MessageCircle, Search, User, Users, Home } from "lucide-react";
import { useState } from "react";

export interface Notification {
	id: number;
	user_id: number;
	type: string;
	content: string;
	read: boolean;
	reference_id?: number;
	reference_type?: string;
	created_at: string;
}

export interface HeaderProps {
	username: string | undefined;
	notifications: Notification[];
	showNotifications: boolean;
	onToggleNotifications: () => void;
}

export default function Header({
	username,
	notifications = [],
	showNotifications = false,
	onToggleNotifications,
}: HeaderProps) {
	const cookies = useCookies();
	const router = useRouter();
	const pathname = usePathname();
	const [searchQuery, setSearchQuery] = useState("");

	const handleLogout = async () => {
		const jwt = cookies.get("jwt");
		if (!jwt) {
			router.push("/");
			return;
		}

		try {
			await fetch("/api/logout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ jwt }),
			});
		} catch (err) {
			console.error("Erreur lors de la déconnexion :", err);
		}

		cookies.remove("jwt");
		cookies.remove("user");
		router.push("/");
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	};

	const isActive = (path: string) => pathname === path;

	return (
		<header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/90">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link
					href="/home"
					className="flex items-center space-x-2 text-xl font-bold text-white hover:text-blue-400 transition-colors"
				>
					<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
						<span className="text-white text-sm font-bold">SN</span>
					</div>
					<span>Social Network</span>
				</Link>

				{/* Navigation */}
				<nav className="hidden md:flex items-center space-x-6">
					<Link
						href="/home"
						className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive("/home")
								? "bg-blue-600 text-white"
								: "text-zinc-300 hover:text-white hover:bg-zinc-800"
							}`}
					>
						<Home size={18} />
						<span>Home</span>
					</Link>
					<Link
						href="/groups"
						className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive("/groups") || pathname.startsWith("/groups/")
								? "bg-blue-600 text-white"
								: "text-zinc-300 hover:text-white hover:bg-zinc-800"
							}`}
					>
						<Users size={18} />
						<span>Groups</span>
					</Link>
					<Link
						href="/contact"
						className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive("/contact")
								? "bg-blue-600 text-white"
								: "text-zinc-300 hover:text-white hover:bg-zinc-800"
							}`}
					>
						<MessageCircle size={18} />
						<span>Messages</span>
					</Link>
				</nav>

				{/* Search */}
				<div className="hidden sm:flex items-center space-x-2 w-64">
					<SearchBar />
				</div>


				{/* Right side actions */}
				<div className="flex items-center space-x-3">
					{/* Notifications */}
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggleNotifications}
						className="relative text-zinc-300 hover:text-white"
					>
						<Bell size={20} />
						{notifications.length > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{notifications.length}
							</span>
						)}
					</Button>

					{/* Profile */}
					<Link href={`/profile/${username}`}>
						<Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white">
							<User size={20} />
						</Button>
					</Link>

					{/* Logout */}
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						className="text-zinc-300 border-zinc-700 hover:bg-zinc-800"
					>
						Logout
					</Button>
				</div>
			</div>

			{/* Mobile Navigation */}
			<div className="md:hidden border-t border-zinc-800 bg-zinc-900">
				<nav className="flex items-center justify-around py-2">
					<Link
						href="/home"
						className={`flex flex-col items-center p-2 ${isActive("/home") ? "text-blue-400" : "text-zinc-400"
							}`}
					>
						<Home size={20} />
						<span className="text-xs mt-1">Home</span>
					</Link>
					<Link
						href="/groups"
						className={`flex flex-col items-center p-2 ${isActive("/groups") || pathname.startsWith("/groups/") ? "text-blue-400" : "text-zinc-400"
							}`}
					>
						<Users size={20} />
						<span className="text-xs mt-1">Groups</span>
					</Link>
					<Link
						href="/contact"
						className={`flex flex-col items-center p-2 ${isActive("/contact") ? "text-blue-400" : "text-zinc-400"
							}`}
					>
						<MessageCircle size={20} />
						<span className="text-xs mt-1">Messages</span>
					</Link>
					<Link
						href={`/profile/${username}`}
						className={`flex flex-col items-center p-2 ${pathname.includes(`/profile/${username}`) ? "text-blue-400" : "text-zinc-400"
							}`}
					>
						<User size={20} />
						<span className="text-xs mt-1">Profile</span>
					</Link>
				</nav>
			</div>

			{/* Notifications Panel */}
			{showNotifications && (
				<div className="absolute right-4 top-16 z-50">
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-4 w-80">
						<h3 className="font-semibold text-white mb-3">Notifications</h3>
						{notifications.length === 0 ? (
							<p className="text-zinc-400 text-sm">No new notifications</p>
						) : (
							<div className="space-y-2">
								{notifications.slice(0, 5).map((notification) => (
									<div key={notification.id} className="p-2 bg-zinc-800 rounded text-sm text-zinc-300">
										{notification.content}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
