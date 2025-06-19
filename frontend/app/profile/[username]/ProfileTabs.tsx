"use client";

import { useState, useEffect } from "react";
import { getCommentsByUserID } from "@/services/comment";
import { Comment } from "@/services/comment";// Assure-toi que ce type existe

export default function ProfileTabs({ userId}: { userId: number }) {
  const [activeTab, setActiveTab] = useState("activities");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!userId) return;
      console.log(userId)
      const fetchedComments = await getCommentsByUserID(userId);
      setComments(fetchedComments);
    };

    if (activeTab === "posts") {
      fetchComments();
    }
  }, [activeTab, userId]);

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex justify-around border-b border-gray-200 dark:border-gray-700">
        {["activities", "posts", "likes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium ${
              activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
            }`}
          >
            {tab === "activities" ? "Latest Activities" : tab === "posts" ? "Posts" : "Like"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "activities" && <p>Here are the latest activities...</p>}

        {activeTab === "posts" && (
          <div>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="mb-2 p-2 border rounded bg-gray-100 dark:bg-gray-700">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                  <p className="text-xs text-gray-500">
                    Post ID: {comment.postId} | {comment.createdAt.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No comments found.</p>
            )}
          </div>
        )}

        {activeTab === "likes" && <p>Here are the likes...</p>}
      </div>
    </div>
  );
}
