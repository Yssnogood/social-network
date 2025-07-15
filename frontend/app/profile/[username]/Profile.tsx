"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCookies } from "next-client-cookies";
import { UserProfile, getUserIdFromToken } from "../../../services/user";
import { fetchNotifications } from "../../../services/notifications";
import ProfileTabs from "./ProfileTabs";
import FollowersSection from "../../components/FollowersSection";
import EditableProfile from "./EditableProfile";
import Header from "../../components/Header";

interface Follower {
    follower_id: number;
    followed_id: number;
    accepted: boolean;
    followed_at: string;
}

export default function ClientProfile({
    profile,
    loggedInUser,
    followers,
    currentUserId,
}: {
    profile: UserProfile;
    loggedInUser: string;
    followers: Follower[];
    currentUserId: number;
}) {
    const cookies = useCookies();
    const isOwnProfile = profile.username === loggedInUser;

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [updatedAvatar, setUpdatedAvatar] = useState(profile.avatar_path);
    const [aboutMe, setAboutMe] = useState(profile.about_me);
    const [isPublic, setIsPublic] = useState(profile.is_public);
    const [isFollowing, setIsFollowing] = useState(false); // TODO: init via prop ou fetch
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<string[]>([]);

    useEffect(() => {
        const getNotif = async () => {
            const token = cookies.get("jwt");
            const userId = await getUserIdFromToken(token);
            if (!token || !userId) return;

            try {
                const fetchedNotifications = await fetchNotifications(token, userId);
                const notifStrings = Array.isArray(fetchedNotifications) ? fetchedNotifications?.map((notif: any) => notif.content) : [];
                setNotifications(notifStrings);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        getNotif();
    }, [cookies]);

    const handleProfileUpdate = () => {
        setIsEditingProfile(false);
    };

    const handleFollow = async () => {
        try {
            // Exécuter un appel API ici pour envoyer la requête de follow
            // await followUser(profile.id);
            setIsFollowing(true);
        } catch (error) {
            console.error("Erreur lors du follow :", error);
        }
    };

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Masquer profil s'il est privé et pas celui de l'utilisateur
    if (!isPublic && !isOwnProfile) {
        return (
            <main className="pt-16 px-4 mx-auto max-w-6xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        This profile is private 🔒
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Your are not authorized to view it.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <>
            <Header
                username={cookies.get("user")}
                notifications={notifications}
                showNotifications={showNotifications}
                onToggleNotifications={handleToggleNotifications}
            />

            <main className="pt-16 px-4 mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        {isOwnProfile && isEditingProfile ? (
                            <EditableProfile
                                profile={profile}
                                onSave={handleProfileUpdate}
                                setAvatarPath={setUpdatedAvatar}
                                setAboutMeText={setAboutMe}
                                setIsPublic={setIsPublic}
                            />
                        ) : (
                            <>
                                {/* Profile Infos */}
                                <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={updatedAvatar || "/defaultPP.webp"}
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

                                        <span
                                            className={`mt-2 inline-block text-sm font-semibold px-3 py-1 rounded-full 
                      ${isPublic ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                        >
                                            {isPublic ? "🔓 Public Profile" : "🔒 Private Profile"}
                                        </span>

                                        {isOwnProfile ? (
                                            <button
                                                onClick={() => setIsEditingProfile(true)}
                                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Edit profile
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleFollow}
                                                disabled={isFollowing || !isPublic}
                                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {isFollowing ? "Followed" : "Start to follow"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* More Info */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                        More Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="text-gray-900 dark:text-white">{profile.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de naissance</p>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(profile.birth_date).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">À propos de moi</p>
                                            <p className="text-gray-900 dark:text-white mt-2">
                                                {aboutMe || "Aucune description pour le moment."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Followers Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <FollowersSection
                            followers={followers}
                            currentUserId={currentUserId}
                            currentUsername={profile.username}
                        />
                    </div>
                </div>

                <ProfileTabs userId={profile.id} />
            </main>
        </>
    );
}
