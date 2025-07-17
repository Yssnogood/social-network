"use client";

import { useState } from "react";
import ChatModal from "../components/ChatModal";
import { FollowerUser } from "@/services/follow";



export default function FollowersSection({
	followers = [],
	currentUserId,
	currentUsername,
	isOwnProfile
}: {
	followers?: FollowerUser[];
	currentUserId: number;
	currentUsername: string;
	isOwnProfile: boolean;
}) {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [selectedFollower, setSelectedFollower] = useState<number | null>(null);

	const handleCloseModal = () => {
		setIsChatOpen(false);
		setSelectedFollower(null);
	};

	const safeFollowers = Array.isArray(followers) ? followers : [];

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">Followers</h3>
			</div>

			{safeFollowers.length > 0 ? (
  <div className="space-y-3">
    {safeFollowers.map((follower) => (
      <div key={follower.id} className="flex items-center gap-3 p-2">
        <p className="font-medium">
			{follower.username} 
		</p>

        {isOwnProfile && (
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              setSelectedFollower(follower.id);
              setIsChatOpen(true);
            }}
          >
            Chat
          </button>
        )}
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500">Aucun follower pour le moment.</p>
)}


			{isChatOpen && selectedFollower !== null && (
				<ChatModal
					currentUserId={currentUserId}
					currentUsername={currentUsername}
					targetUserId={selectedFollower}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
}
