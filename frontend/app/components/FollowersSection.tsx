"use client";

import { FollowerUser } from "@/services/follow";
import Link from "next/link";




export default function FollowersSection({
	followers = [],
}: {
	followers?: FollowerUser[];
}) {

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


      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500">Aucun follower pour le moment.</p>
)}


		</div>
	);
}
