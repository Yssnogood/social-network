"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";
import Notifications from "./NotificationPanel";

export interface HeaderProps {
	username: string | undefined;
	notifications: string[];
	showNotifications: boolean;
	onToggleNotifications: () => void;
}
export default function Header({
	username,
	notifications,
	showNotifications,
	onToggleNotifications,
}: HeaderProps) {
	const cookies = useCookies();
	const router = useRouter();

	const handleLogout = async () => {
		const jwt = cookies.get("jwt");

		if (!jwt) {
			router.push("/");
			return;
		}

		try {
			await fetch("/api/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ jwt }),
			});
		} catch (err) {
			console.error("Erreur lors de la déconnexion :", err);
		}

		cookies.remove("jwt");
		cookies.remove("user");
		router.push("/");
	};

	return (
		<header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
			<div className="container mx-auto flex justify-between items-center">
				<Link href="/home" className="font-bold text-lg text-white">
					Social Network
				</Link>
				<nav className="flex gap-4 items-center">
					<Link
						href="/contact"
						className="text-sm text-white hover:text-blue-200"
					>
						<button
							className="text-sm text-white hover:text-blue-200 cursor-pointer flex items-center"
							aria-label="Messages"
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
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</button>
					</Link>

					<button
						onClick={onToggleNotifications}
						className="relative text-sm text-white hover:text-blue-200 cursor-pointer flex items-center"
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
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>

						{showNotifications && (
							<div className="absolute right-0 top-6 z-50">
								<Notifications notifications={notifications} />
							</div>
						)}
					</button>

					<button
						onClick={handleLogout}
						className="text-sm text-white hover:text-blue-200"
					>
						Logout
					</button>

					<Link
						href={`/profile/${username}`}
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
	);
}
