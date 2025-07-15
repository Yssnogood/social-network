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

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
			{followers && followers.length > 0 ? (
=======
			{followers.length > 0 ? (
>>>>>>> cd788bf (Revert "init")
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
>>>>>>> ac38a5d (init)

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
