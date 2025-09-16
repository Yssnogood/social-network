"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Post, LikePost } from "../../services/post";
import { formatRelativeTime } from "../../services/utils";
import { Heart, MessageCircle } from "lucide-react";

interface PostDetailProps {
  post: Post;
  commentsCount: number;
  jwt: string | undefined;
}

export default function PostDetail({ post, commentsCount, jwt }: PostDetailProps) {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [liked, setLiked] = useState(post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

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

  const handleLike = async () => {
    if (!jwt) return;
    
    try {
      await LikePost(post.id, jwt);
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  return (
    <div id={String(post.id)} className="bg-zinc-800 p-4 rounded-lg shadow-md mb-4 relative">
      {/* User Info */}
      <div className="flex items-center mb-3 relative">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-zinc-700"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleCard}
        >
          {post.userName.avatar_path && (
            <img
              src={
                post.userName.avatar_path.startsWith("http")
                  ? post.userName.avatar_path
                  : `/uploads/${post.userName.avatar_path}`
              }
              alt={`${post.userName.username}'s avatar`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Username */}
        <div
          className="text-white font-semibold cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleCard}
        >
          {post.userName.username}
        </div>

        {/* Hover Card */}
        {showProfileCard && (
          <div
            className="absolute top-12 left-0 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-4 w-64"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-zinc-700">
                {post.userName.avatar_path && (
                  <img
                    src={
                      post.userName.avatar_path.startsWith("http")
                        ? post.userName.avatar_path
                        : `/uploads/${post.userName.avatar_path}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <Link
                  href={`/profile/${post.userName.username}`}
                  className="text-white font-semibold hover:underline"
                >
                  {post.userName.username}
                </Link>
                <div className="text-sm text-zinc-400">
                  Membre depuis{" "}
                  {post.userName.created_at
                    ? new Date(post.userName.created_at).getFullYear()
                    : "?"}
                </div>
              </div>
            </div>
            <div className="text-zinc-300 text-sm mb-3">
              {post.userName.about_me || "Pas de description."}
            </div>
            {post.userName.is_public ? (
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
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-3 text-zinc-300">{post.content}</div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="mb-3">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="max-h-96 rounded-lg mx-auto"
          />
        </div>
      )}

      {/* Likes & Comments */}
            <div className="border-t border-zinc-700 pt-3 mt-3 flex gap-4">
        <button
          className={`text-sm flex items-center gap-1 ${
            liked ? "text-red-500 hover:text-red-400" : "text-zinc-400 hover:text-red-500"
          }`}
          onClick={handleLike}
        >
          <Heart 
            size={18} 
            fill={liked ? "currentColor" : "none"}
          />
          <span>{likesCount}</span> Like
          {likesCount !== 1 ? "s" : ""}
        </button>
        <span className="text-zinc-400 text-sm flex items-center gap-1">
          <MessageCircle size={18} />
          {commentsCount} Comment{commentsCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
