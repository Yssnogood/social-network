"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { url } from "@/lib/config";
import { useCookies } from "next-client-cookies";

interface Friend {
  id: number;
  username: string;
  avatar_path: string;
}

export default function PostForm() {
  const jwt = useCookies().get("jwt");
  const [privacy, setPrivacy] = useState(0);
  const [content, setContent] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  // Fetch friends only when "Private" is selected
  useEffect(() => {
    if (privacy === 2 && jwt) {
      const fetchFriends = async () => {
        try {
          const resp = await fetch(
            `${url}/friendsDetails?userID=${parseJwt(jwt).user_id}`
          );
          if (resp.ok) {
            const data = await resp.json();
            setFriends(data);
          }
        } catch (err) {
          console.error("Failed to fetch friends", err);
        }
      };
      fetchFriends();
    }
  }, [privacy, jwt]);

  const handleCheckbox = (id: number) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch(url + "/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwt: jwt,
          content: content,
          privacy_type: privacy,
          viewers: privacy === 2 ? selectedFriends : [],
        }),
      });
      if (resp.ok) {
        const r = await resp.json();
        console.log(r);
      } else {
        console.log(resp.status);
      }
    } catch (err) {
      console.log(err);
    }
  };

  function parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return {};
    }
  }

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Post</h1>
            <p className="mt-2 text-gray-600">Make a post</p>
          </div>

          <form onSubmit={handlePost} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Privacy dropdown */}
              <div>
                <label
                  htmlFor="privacy"
                  className="block text-sm font-medium text-gray-700"
                >
                  Privacy
                </label>
                <select
                  id="privacy"
                  name="privacy"
                  required
                  value={privacy}
                  onChange={(e) => setPrivacy(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0">🌍 Public</option>
                  <option value="1">🙎‍♂️ Friends</option>
                  <option value="2">🔒 Private (Choose who can see this post)</option>
                </select>
              </div>

              {/* Friend selection if Private */}
              {privacy === 2 && friends.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 bg-red-100 p-2 rounded">
                    Select Friends
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-72 overflow-y-auto p-2 rounded-xl border border-gray-300 shadow-lg bg-white">
                    {friends.map((f) => {
                      const isSelected = selectedFriends.includes(f.id);
                      return (
                        <div
                          key={f.id}
                          onClick={() => handleCheckbox(f.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-transform transform hover:scale-105
                            border text-sm font-medium
                            ${isSelected
                              ? "bg-indigo-100 text-indigo-800 border-indigo-500 ring-2 ring-indigo-400"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"}`}
                        >
                          <img
                            src={f.avatar_path || "/default-avatar.png"}
                            alt={f.username}
                            className="w-14 h-14 rounded-full object-cover border border-gray-300 mb-2"
                          />
                          <span>{f.username}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Post content */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-med font-medium text-gray-700"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="What's New ?"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
