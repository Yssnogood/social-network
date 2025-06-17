"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { UserProfile } from "../../../services/user";

export default function ClientProfile({
  profile,
  loggedInUser,
}: {
  profile: UserProfile;
  loggedInUser: string;
}) {
  const isOwnProfile = profile.username === loggedInUser;
  const [aboutMe, setAboutMe] = useState(profile.about_me || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    const response = await fetch(`http://localhost:8080/api/users/${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        birth_date: profile.birth_date,
        username: profile.username,
        about_me: aboutMe,
        is_public: profile.is_public,
        password: "", // empty as not changing password
      }),
    });

    if (response.ok) {
      setIsEditing(false);
    } else {
      console.error("Failed to update About Me");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="font-bold text-lg text-white">
            Social Network
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              href={`/profile/${loggedInUser}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-blue-100"
            >
              <Image
                src="/social-placeholder.png"
                alt="Profile"
                width={24}
                height={24}
                className="rounded-full"
              />
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16 px-4 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left section */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
              <div className="flex-shrink-0">
                <Image
                  src={profile.avatar_path || "/defaultPP.webp"}
                  alt="Profile"
                  width={150}
                  height={150}
                  className="rounded-full border-4 border-blue-100"
                />
              </div>

              <div className="flex flex-col mt-4 md:mt-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.username}
                </h1>
                <h2 className="text-xl text-gray-700 dark:text-gray-300 mt-2">
                  {profile.first_name} {profile.last_name}
                </h2>
              </div>
            </div>

            {/* More Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                More Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Birth Date
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(profile.birth_date).toLocaleDateString("FR")}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    About Me
                  </p>
                  {isOwnProfile ? (
                    isEditing ? (
                      <>
                        <textarea
                          className="w-full border p-2 rounded mt-2"
                          value={aboutMe}
                          onChange={(e) => setAboutMe(e.target.value)}
                        />
                        <div className="mt-2 space-x-2">
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setAboutMe(profile.about_me);
                            }}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-900 dark:text-white mt-2">
                          {aboutMe}
                        </p>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      </>
                    )
                  ) : (
                    <p className="text-gray-900 dark:text-white mt-2">{aboutMe}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right section: Friends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Friends
            </h3>
            <div className="space-y-4">
              {profile.friends && profile.friends.length > 0 ? (
                profile.friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-3">
                    <Image
                      src={friend.avatarPath || "/social-placeholder.png"}
                      alt={`${friend.name}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {friend.name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No friends found.
                </p>
              )}
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              View All Friends
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
