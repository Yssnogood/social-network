"use client";

import { useEffect, useState } from "react";
import ChatModal from "../components/ChatModal";


interface Follower {
	follower_id: number;
	followed_id: number;
	accepted: boolean;
	followed_at: string;
}

export default function FollowersSection({
	followers,
}: {
	followers: Follower[];
	currentUserId: number;
}) {

	const [isChatOpen, setIsChatOpen] = useState(false);
	const [selectedFollower, setSelectedFollower] = useState<number | null>(null);



	useEffect(() => {
		if (!isChatOpen || selectedFollower === null) return;

	}, [isChatOpen, selectedFollower]);



	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">Followers</h3>
			</div>

			{followers.length > 0 ? (
				<div className="space-y-3">
					{followers.map((follower) => (
						<div key={follower.follower_id} className="flex items-center gap-3 p-2">
							<p className="font-medium">User ID: {follower.follower_id}</p>
							<button
								className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
								onClick={() => {
									setSelectedFollower(follower.follower_id);
									setIsChatOpen(true);
								}}
							>
								Chat
							</button>
						</div>
					))}
				</div>
			) : (
				<p className="text-gray-500 text-center py-4">No followers yet</p>
			)}

			{/* Modal Chat */}
			{isChatOpen && selectedFollower !== null && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white dark:bg-gray-900 rounded-lg w-96 p-4 shadow-lg relative">
						<button
							className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
							onClick={() => {
								setIsChatOpen(false);
								setSelectedFollower(null);
							}}
							aria-label="Close chat"
						>
							✕
						</button>
						<h4 className="text-xl font-semibold mb-4">Chat avec User {selectedFollower}</h4>

						<div className="border border-gray-300 dark:border-gray-700 rounded p-2 h-48 overflow-y-auto mb-4 text-gray-800 dark:text-gray-100">
								<p className="text-center text-sm text-gray-400">Aucun message</p>
						</div>

						<div className="flex gap-2">
							<input
								type="text"
								placeholder="Écris un message..."
								className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-gray-100"
								onKeyDown={(e) => e.key === "Enter"}
							/>
							<button
								className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							>
								Envoyer
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
