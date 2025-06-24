"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCommentsByUserID, Comment } from "../../../services/comment";
import { getPostsByUserID, getLikedPostsByUserID, Post } from "../../../services/post";
import { MessageSquare, PencilLine, ThumbsUp } from "lucide-react";

export default function ProfileTabs({ userId }: { userId: number }) {
  const [activeTab, setActiveTab] = useState("activities");
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);

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
      date: likedPost.createdAt, // Suppose la date de création du post liké
      item: likedPost
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex justify-around border-b border-gray-200 dark:border-gray-700">
        {["activities", "posts", "likes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium transition ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab === "activities" ? "Latest Activities" : tab === "posts" ? "Posts" : "Likes"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {activeTab === "activities" && (
          <>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <Link
                  key={index}
                  href={`/post/${activity.type === "comment" ? activity.item.postId : activity.item.id}/comments`}
                  className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
                >
                  {activity.type === "post" && <PencilLine className="text-blue-500 w-6 h-6" />}
                  {activity.type === "comment" && <MessageSquare className="text-green-500 w-6 h-6" />}
                  {activity.type === "like" && <ThumbsUp className="text-red-500 w-6 h-6" />}
                  <div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {activity.type === "comment" ? activity.item.content : activity.item.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.type === "post" && `New Post • ${activity.date.toLocaleString()}`}
                      {activity.type === "comment" && `Comment on Post ID: ${activity.item.postId} • ${activity.date.toLocaleString()}`}
                      {activity.type === "like" && `Liked Post • ${activity.date.toLocaleString()}`}
                    </p>
                    {activity.type !== "comment" && (
                      <p className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
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
              <p className="text-center text-gray-500">No recent activity found.</p>
            )}
          </>
        )}

        {activeTab === "posts" && (
          <>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}/comments`}
                  className="block p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
                >
                  <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {post.createdAt.toLocaleString()}
                  </p>
                  <p className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                    <ThumbsUp className="w-4 h-4" /> 
                    <span>{post.likes} likes</span>
                    <MessageSquare className="w-4 h-4 ml-4" />
                    <span>{post.comments} comments</span>
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500">No posts found.</p>
            )}
          </>
        )}

        {activeTab === "likes" && (
          <>
            {likedPosts.length > 0 ? (
              likedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}/comments`}
                  className="block p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition cursor-pointer"
                >
                  <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {post.createdAt.toLocaleString()}
                  </p>
                  <p className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                    <ThumbsUp className="w-4 h-4" /> 
                    <span>{post.likes} likes</span>
                    <MessageSquare className="w-4 h-4 ml-4" />
                    <span>{post.comments} comments</span>
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500">No liked posts found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
