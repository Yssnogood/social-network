"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Post, LikePost } from "../../services/post";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User } from "lucide-react";

interface PostItemProps {
  post: Post;
  jwt: string | undefined;
}

export default function PostItem({ post, jwt }: PostItemProps) {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [liked, setLiked] = useState(post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  // Detect mobile device
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card id={String(post.id)} className="border-zinc-800 bg-zinc-900 mb-4">
      <CardHeader className="pb-3">
        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={toggleCard}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 cursor-pointer border-2 border-zinc-600">
                {post.userName.avatar_path ? (
                  <img
                    src={
                      post.userName.avatar_path.startsWith("http")
                        ? post.userName.avatar_path
                        : `/uploads/${post.userName.avatar_path}`
                    }
                    alt={`${post.userName.username}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </div>

              {/* Profile hover card */}
              {showProfileCard && (
                <div className="absolute top-12 left-0 z-50 w-72 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-700">
                      {post.userName.avatar_path ? (
                        <img
                          src={
                            post.userName.avatar_path.startsWith("http")
                              ? post.userName.avatar_path
                              : `/uploads/${post.userName.avatar_path}`
                          }
                          alt={`${post.userName.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User size={24} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{post.userName.username}</h3>
                      <p className="text-sm text-zinc-400">
                        {post.userName.first_name} {post.userName.last_name}
                      </p>
                    </div>
                  </div>
                  {post.userName.about_me && (
                    <p className="text-sm text-zinc-300 mb-3">{post.userName.about_me}</p>
                  )}
                  <div className="flex space-x-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/profile/${post.userName.username}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Username and metadata */}
            <div>
              <Link 
                href={`/profile/${post.userName.username}`}
                className="font-semibold text-white hover:text-blue-400 transition-colors"
              >
                {post.userName.username}
              </Link>
              <p className="text-sm text-zinc-400">{formatDate(post.createdAt)}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Content */}
        <div className="mb-4">
          <p className="text-zinc-100 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          {post.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                liked ? "text-red-500 hover:text-red-400" : "text-zinc-400 hover:text-red-500"
              }`}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex items-center space-x-2 text-zinc-400 hover:text-blue-400"
            >
              <Link href={`/post/${post.id}/comments`}>
                <MessageCircle size={18} />
                <span>
                  {post.comments > 0 ? `${post.comments} Comment${post.comments > 1 ? 's' : ''}` : 'Comment'}
                </span>
              </Link>
            </Button>
          </div>

          {post.privacy === 1 && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
              Private
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
