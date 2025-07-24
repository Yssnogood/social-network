"use client";

import { useState } from "react";
import ChatModal from "../components/ChatModal";
import { FollowerUser } from "@/services/follow";
import Link from "next/link";




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
      <div
        key={follower.id}
        className="flex items-center gap-4 p-2 bg-gray-50 dark:bg-gray-700 rounded"
      >
        {/* Avatar */}
        <img
          src={follower.avatar_path || "/defaultPP.webp"}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover border border-gray-300"
        />

        {/* Nom cliquable */}
        <div className="flex flex-col">
          <Link
            href={`/profile/${follower.username}`}
            className="font-medium text-gray-900 dark:text-white hover:underline"
          >
            {follower.username}
          </Link>
          <span className="text-sm text-gray-500 dark:text-gray-300">
            @{follower.username}
          </span>
        </div>

        {/* Bouton Chat */}
        {isOwnProfile && (
          <button
            className="ml-auto px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
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
