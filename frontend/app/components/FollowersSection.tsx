"use client";

import { useState } from "react";
import ChatModal from "../components/ChatModal";

interface Follower {
	follower_id: number;
	followed_id: number;
	accepted: boolean;
	followed_at: string;
}

export default function FollowersSection({
	followers,
	currentUserId,
}: {
	followers: Follower[];
	currentUserId: number;
}) {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [selectedFollower, setSelectedFollower] = useState<number | null>(null);

	const handleCloseModal = () => {
		setIsChatOpen(false);
		setSelectedFollower(null);
	};

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

			{isChatOpen && selectedFollower !== null && (
				<ChatModal
					currentUserId={currentUserId}
					targetUserId={selectedFollower}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
}
