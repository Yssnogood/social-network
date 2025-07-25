"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface User {
  username: string;
  avatar_path?: string;
  about_me?: string;
  created_at?: string;
  is_public?: boolean;
}

interface ProfileHoverCardProps {
  user: User;
  isMobile: boolean;
  children: React.ReactNode;
}

export default function ProfileHoverCard({ user, isMobile, children }: ProfileHoverCardProps) {
  const [showCard, setShowCard] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHover = (enter: boolean) => {
    if (isMobile) return;
    if (enter) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShowCard(true);
    } else {
      timeoutRef.current = setTimeout(() => setShowCard(false), 300);
    }
  };

  const toggleCardMobile = () => {
    if (isMobile) setShowCard((prev) => !prev);
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        onClick={toggleCardMobile}
      >
        {children}
      </div>

      {showCard && (
        <div
          className="absolute top-12 left-0 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 w-64"
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-700">
              {user.avatar_path && (
                <img
                  src={user.avatar_path.startsWith("http") ? user.avatar_path : `/uploads/${user.avatar_path}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <Link href={`/profile/${user.username}`} className="text-white font-semibold hover:underline">
                {user.username}
              </Link>
              <div className="text-sm text-gray-400">
                Membre depuis {user.created_at ? new Date(user.created_at).getFullYear() : "?"}
              </div>
            </div>
          </div>

          <div className="text-gray-300 text-sm mb-3">
            {user.about_me || "Pas de description."}
          </div>

          <div className="flex gap-2">
            {user.is_public ? (
              <>
                <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white">Message</button>
                <button className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded text-white">Suivre</button>
              </>
            ) : (
              <>
                <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white">Demander message</button>
                <button className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded text-white">Demander follow</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
