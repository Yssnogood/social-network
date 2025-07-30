"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Comment } from "../../services/comment";
import { formatRelativeTime } from "../../services/utils";

interface CommentItemProps {
  comment: Comment;
  isOwn: boolean;
}

export default function CommentItem({ comment, isOwn }: CommentItemProps) {
  const user = comment.author;

  const [showProfileCard, setShowProfileCard] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 768);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setShowProfileCard(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hoverTimeout.current = setTimeout(() => {
        setShowProfileCard(false);
      }, 500);
    }
  };

  const toggleCard = () => {
    if (isMobile) {
      setShowProfileCard((prev) => !prev);
    }
  };

  return (
    <div
      className={`bg-gray-800 p-4 rounded-lg shadow-md relative ${
        isOwn ? "border border-blue-500" : ""
      }`}
    >
      <div className="flex items-center mb-2 relative">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-700 cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleCard}
        >
              {user.avatar_path && (
                <img
                  src={
                    user.avatar_path.startsWith("http")
                      ? user.avatar_path
                      : `/uploads/${user.avatar_path}`
                  }
                 alt="Profile"
                 className="w-full h-full object-cover"
                  />
              )}
        </div>

        {/* Username */}
        <div
          className="font-semibold text-white text-sm cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleCard}
        >
          {user?.username || comment.author.username}{" "}
          {isOwn && <span className="text-blue-400 text-xs">(You)</span>}
        </div>

        {/* Hover Card */}
        {user && showProfileCard && (
          <div
            className="absolute top-10 left-0 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 w-64"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-700">
                {user.avatar_path && (
                  <img
                    src={
                      user.avatar_path.startsWith("http")
                        ? user.avatar_path
                        : `/uploads/${user.avatar_path}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <Link
                  href={`/profile/${user.username}`}
                  className="text-white font-semibold hover:underline"
                >
                  {user.username}
                </Link>
                <div className="text-sm text-gray-400">
                  Membre depuis{" "}
                  {user.created_at
                    ? new Date(user.created_at).getFullYear()
                    : "?"}
                </div>
              </div>
            </div>
            <div className="text-gray-300 text-sm mb-3">
              {user.about_me || "Pas de description."}
            </div>
            {!isOwn && (
              user.isPublic ? (
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white">
                    Message
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded text-white">
                    Suivre
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white">
                    Demander message
                  </button>
                  <button className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded text-white">
                    Demander follow
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="text-gray-300">{comment.content}</div>

      {/* Timestamp */}
      <div className="text-xs text-gray-500 mt-1">
        {formatRelativeTime(new Date(comment.createdAt))}
      </div>
    </div>
  );
}
