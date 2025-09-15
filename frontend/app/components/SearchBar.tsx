'use client';

import { useState, useEffect, useRef } from "react";
import { useCookies } from "next-client-cookies";
import { getUserIdFromToken } from "../../services/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { searchInstances } from "../../services/search";

export default function SearchBar() {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<any[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);

	const cookies = useCookies();
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		const timeout = setTimeout(async () => {
			if (query.trim()) {
				const token = cookies.get("jwt");
				const userId = await getUserIdFromToken(token);
				try {
					const res = await searchInstances(query, userId ? parseInt(userId) : 0);

					if (res && (Array.isArray(res.users) || Array.isArray(res.groups))) {
						const mapped = [
							...(res.users || []).map((user: any) => ({
								type: "user",
								id: user.id,
								username: user.username,
								avatar: user.avatar_path || '/defaultPP.webp',
								isFollowing: user.is_following,
								isFollowedBy: user.is_followed_by,
							})),
							...(res.groups || []).map((group: any) => ({
								type: "group",
								id: group.id,
								name: group.title,
								description: group.description,
								avatar: '/group.png',
								isMember: group.is_member,
							}))
						];
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

	// Helper functions to determine follow status and group membership
	const getFollowStatus = (isFollowing: boolean, isFollowedBy: boolean) => {
		if (isFollowing && isFollowedBy) return "Suivi mutuel";
		if (isFollowing) return "Vous suivez";
		if (isFollowedBy) return "Vous suit";
		return null;
	};

	const getGroupMembershipStatus = (isMember: boolean) => {
		return isMember ? "Membre" : null;
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
				placeholder="Search..."
				className="pl-10 w-64 bg-zinc-800 border border-zinc-700 text-white rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
			/>

			<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
				</svg>
			</span>

			{query.trim() && showDropdown && (
				<div className="absolute top-10 left-0 w-full bg-white text-black shadow-lg rounded-xl overflow-hidden max-h-64 overflow-y-auto">
					{results.length > 0 ? (
						results.map((item) => (
							<div
								key={`${item.type}-${item.id}`}
								className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 cursor-pointer"
								onClick={() => {
									if (item.type === "user") {
										router.push(`/profile/${item.username}`);
									} else {
										router.push(`/groups/${item.id}`);
									}
									setQuery('');
									setResults([]);
									setShowDropdown(false);
								}}
							>
								<Image
									src={item.avatar}
									alt={item.type === "user" ? item.username : item.name}
									width={30}
									height={30}
									className="rounded-full"
								/>
								<div className="flex flex-col">
									{item.type === "user" && (
										<span>{item.username}</span>
									)}
									{item.type === "group" && (
										<>
											<span className="font-semibold">{item.name}</span>
											{item.description && (
												<p className="text-xs text-gray-500">{item.description}</p>
											)}
										</>
									)}
								</div>

								{item.type === "user" && (
									<span className="ml-auto text-xs text-green-600 font-medium">
										{getFollowStatus(item.isFollowing, item.isFollowedBy)}
									</span>
								)}

								{item.type === "group" && item.isMember && (
									<span className="ml-auto text-xs text-blue-600 font-medium">
										{getGroupMembershipStatus(item.isMember)}
									</span>
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
