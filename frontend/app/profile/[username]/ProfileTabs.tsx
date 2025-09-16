"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCommentsByUserID, Comment } from "../../../services/comment";
import { getPostsByUserID, getLikedPostsByUserID, Post } from "../../../services/post";
import { FollowerUser } from "@/services/follow";
import { MessageSquare, PencilLine, ThumbsUp } from "lucide-react";

export default function ProfileTabs({ userId }: { userId: number }) {
  const [activeTab, setActiveTab] = useState("activities");

  // Activities
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);

  // Followers / Following
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Fetch posts, comments, likes
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const [fetchedComments, fetchedPosts, fetchedLikedPosts] = await Promise.all([
        getCommentsByUserID(userId),
        getPostsByUserID(userId),
        getLikedPostsByUserID(userId)
      ]);

      setComments(fetchedComments);
      setPosts(fetchedPosts);
      setLikedPosts(fetchedLikedPosts);
    };

    fetchData();
  }, [userId]);

  // Fetch followers when tab is clicked
  useEffect(() => {
    if (activeTab === "followers" && followers.length === 0) {
      const fetchFollowers = async () => {
        try {
          setLoadingFollowers(true);
          const res = await fetch(`http://localhost:8080/api/followersDetails?userID=${userId}`);
          if (!res.ok) throw new Error("Failed to fetch followers");
          const data = await res.json();
          setFollowers(data);
        } catch (error) {
          console.error("Error fetching followers:", error);
        } finally {
          setLoadingFollowers(false);
        }
      };
      fetchFollowers();
    }
  }, [activeTab, userId, followers.length]);

  // Fetch following when tab is clicked
  useEffect(() => {
    if (activeTab === "following" && following.length === 0) {
      const fetchFollowing = async () => {
        try {
          setLoadingFollowing(true);
          const res = await fetch(`http://localhost:8080/api/followingDetails?userID=${userId}`);
          if (!res.ok) throw new Error("Failed to fetch following");
          const data = await res.json();
          setFollowing(data);
        } catch (error) {
          console.error("Error fetching following:", error);
        } finally {
          setLoadingFollowing(false);
        }
      };
      fetchFollowing();
    }
  }, [activeTab, userId, following.length]);

  const activities = [
    ...posts.map(post => ({
      type: "post" as const,
      date: post.createdAt,
      item: post
    })),
    ...comments.map(comment => ({
      type: "comment" as const,
      date: comment.createdAt,
      item: comment
    })),
    ...likedPosts.map(likedPost => ({
      type: "like" as const,
      date: likedPost.createdAt,
      item: likedPost
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mt-8 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
      {/* Tabs */}
      <div className="flex justify-around border-b border-zinc-200 dark:border-zinc-700">
        {["activities", "posts", "likes", "followers", "following"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium transition ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-white hover:text-blue-600"
            }`}
          >
            {tab === "activities"
              ? "Latest Activities"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 space-y-4">
        {/* ACTIVITIES */}
        {activeTab === "activities" && (
          <>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <Link
                  key={index}
                  href={`/post/${activity.type === "comment" ? activity.item.postId : activity.item.id}/comments`}
                  className="flex items-center space-x-4 p-4 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition cursor-pointer"
                >
                  {activity.type === "post" && <PencilLine className="text-blue-500 w-6 h-6" />}
                  {activity.type === "comment" && <MessageSquare className="text-green-500 w-6 h-6" />}
                  {activity.type === "like" && <ThumbsUp className="text-red-500 w-6 h-6" />}
                  <div>
                    <p className="text-zinc-800 dark:text-zinc-200">
                      {activity.item.content}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {activity.type === "post" && `New Post • ${activity.date.toLocaleString()}`}
                      {activity.type === "comment" && `Comment on Post ID: ${activity.item.postId} • ${activity.date.toLocaleString()}`}
                      {activity.type === "like" && `Liked Post • ${activity.date.toLocaleString()}`}
                    </p>
                    {activity.type !== "comment" && (
                      <p className="flex items-center space-x-2 text-xs text-zinc-400 mt-1">
                        <ThumbsUp className="w-4 h-4" /> 
                        <span>{activity.item.likes} likes</span>
                        <MessageSquare className="w-4 h-4 ml-4" />
                        <span>{activity.item.comments} comments</span>
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-zinc-500">No recent activity found.</p>
            )}
          </>
        )}

        {/* POSTS */}
        {activeTab === "posts" && (
          <>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}/comments`}
                  className="block p-4 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition cursor-pointer"
                >
                  <p className="text-zinc-800 dark:text-zinc-200">{post.content}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {post.createdAt.toLocaleString()}
                  </p>
                  <p className="flex items-center space-x-2 text-xs text-zinc-400 mt-1">
                    <ThumbsUp className="w-4 h-4" /> 
                    <span>{post.likes} likes</span>
                    <MessageSquare className="w-4 h-4 ml-4" />
                    <span>{post.comments} comments</span>
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-zinc-500">No posts found.</p>
            )}
          </>
        )}

        {/* LIKES */}
        {activeTab === "likes" && (
          <>
            {likedPosts.length > 0 ? (
              likedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}/comments`}
                  className="block p-4 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition cursor-pointer"
                >
                  <p className="text-zinc-800 dark:text-zinc-200">{post.content}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {post.createdAt.toLocaleString()}
                  </p>
                  <p className="flex items-center space-x-2 text-xs text-zinc-400 mt-1">
                    <ThumbsUp className="w-4 h-4" /> 
                    <span>{post.likes} likes</span>
                    <MessageSquare className="w-4 h-4 ml-4" />
                    <span>{post.comments} comments</span>
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-zinc-500">No liked posts found.</p>
            )}
          </>
        )}

        {/* FOLLOWERS */}
        {activeTab === "followers" && (
          <div>
            {loadingFollowers ? (
              <p className="text-center text-zinc-500">Loading followers...</p>
            ) : followers.length > 0 ? (
              followers.map((f) => (
                <Link
                  key={f.id}
                  href={`/profile/${f.username}`}
                  className="flex items-center space-x-4 p-4 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition"
                >
                  <img
                    src={f.avatar_path || "/defaultPP.webp"}
                    alt={f.username}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-300"
                  />
                  <div>
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium">{f.username}</p>
                    <p className="text-sm text-zinc-500">@{f.username}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-zinc-500">No followers found.</p>
            )}
          </div>
        )}

        {/* FOLLOWING */}
        {activeTab === "following" && (
          <div>
            {loadingFollowing ? (
              <p className="text-center text-zinc-500">Loading following...</p>
            ) : following.length > 0 ? (
              following.map((f) => (
                <Link
                  key={f.id}
                  href={`/profile/${f.username}`}
                  className="flex items-center space-x-4 p-4 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition"
                >
                  <img
                    src={f.avatar_path || "/defaultPP.webp"}
                    alt={f.username}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-300"
                  />
                  <div>
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium">{f.username}</p>
                    <p className="text-sm text-zinc-500">@{f.username}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-zinc-500">No following found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
