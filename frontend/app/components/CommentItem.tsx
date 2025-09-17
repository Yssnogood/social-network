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
      className={`bg-zinc-800 p-4 rounded-lg shadow-md relative ${
        isOwn ? "border border-blue-500" : ""
      }`}
    >
      <div className="flex items-center mb-2 relative">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-zinc-700 cursor-pointer"
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
            className="absolute top-10 left-0 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-4 w-64"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-zinc-700">
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
                <div className="text-sm text-zinc-400">
                  Membre depuis{" "}
                  {user.created_at
                    ? new Date(user.created_at).getFullYear()
                    : "?"}
                </div>
              </div>
            </div>
            <div className="text-zinc-300 text-sm mb-3">
              {user.about_me || "Pas de description."}
            </div>
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="text-zinc-300">{comment.content}</div>

      {/* Comment Image */}
      {comment.imageUrl && (
        <div className="mt-2">
          <img
            src={comment.imageUrl}
            alt="Comment attachment"
            className="rounded-lg max-h-60 object-cover"
          />
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-zinc-500 mt-1">
        {formatRelativeTime(new Date(comment.createdAt))}
      </div>
    </div>
  );
}
