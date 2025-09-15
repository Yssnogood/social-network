"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UserProfile } from "../../../services/user";
import ProfileTabs from "./ProfileTabs";
import FollowersSection from "../../components/FollowersSection";
import EditableProfile from "./EditableProfile";
import { followUser, unfollowUser, FollowerUser } from "../../../services/follow";
import { createNotification } from "../../../services/notifications";
import AppLayout from "../../components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, UserPlus, UserMinus, Clock } from "lucide-react";

export default function ClientProfile({
  profile,
  loggedInUser,
  followers,
  currentUserId,
}: {
  profile: UserProfile;
  loggedInUser: string;
  followers: FollowerUser[];
  currentUserId: number;
}) {
  const isOwnProfile = profile.id === currentUserId;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updatedAvatar, setUpdatedAvatar] = useState(profile.avatar_path);
  const [aboutMe, setAboutMe] = useState(profile.about_me);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [followerList, setFollowerList] = useState<FollowerUser[]>(followers);
  const [loading, setLoading] = useState(false);
  const [followStatusLoaded, setFollowStatusLoaded] = useState(isOwnProfile || profile.is_public);

  useEffect(() => {
    const fetchIsFollowingStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/followers/check`,{
          method : "POST",
          headers : {
            "Content-Type" : "application/json",
          },
          body: JSON.stringify({
            follower_id: currentUserId,
            followed_id: profile.id,
          }),
        });

        if (!res.ok) throw new Error("Erreur lors du check follow");

        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setIsFollowPending(data.isPending);
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de follow :", error);
      } finally {
        setFollowStatusLoaded(true);
      }
    };

    if (!isOwnProfile ) {
      fetchIsFollowingStatus();
    }
  }, [currentUserId, profile.id, isOwnProfile, profile.is_public]);

  const handleProfileUpdate = () => {
    setIsEditingProfile(false);
  };

  const fetchFollowers = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/followersDetails?userID=${profile.id}`);
      if (!res.ok) throw new Error("Échec du fetch des followers");
      const data = await res.json();
      setFollowerList(data);
    } catch (error) {
      console.error("Erreur lors du fetch des followers:", error);
    }
  };

const handleFollow = async () => {
  try {
    setLoading(true);
    const res = await followUser(currentUserId, profile.id, profile.is_public);

    if (res.followed) {
      setIsFollowing(true); // Directly followed
    } else if (res.requestSent) {
      setIsFollowPending(true); // Request sent
    }

    await fetchFollowers();
  } catch (error: any) {
    console.error("Follow error:", error.message);
    alert("Impossible de suivre cet utilisateur.");
  } finally {
    setLoading(false);
  }
};


  const handleUnfollow = async () => {
    try {
      setLoading(true);
      await unfollowUser(currentUserId, profile.id);
      setIsFollowing(false);
      setIsFollowPending(false);
      await fetchFollowers();
    } catch (error: any) {
      console.error("Erreur lors du unfollow :", error.message);
      alert("Impossible de se désabonner.");
    } finally {
      setLoading(false);
    }
  };

  const canViewProfile = isOwnProfile || profile.is_public || (isFollowing && !isFollowPending);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            {!followStatusLoaded ? (
              <div className="text-center text-zinc-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                Chargement du profil...
              </div>
            ) : !canViewProfile ? (
              <div className="text-center text-zinc-300 py-8">
                <User size={64} className="mx-auto text-zinc-600 mb-4" />
                <p className="text-lg text-white mb-2">Ce profil est privé.</p>
                <p className="text-zinc-400 mb-6">S'abonner pour voir le contenu ?</p>
                {isFollowPending ? (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      unfollowUser(currentUserId, profile.id);
                      setIsFollowPending(false);
                    }}
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                  >
                    <Clock size={16} className="mr-2" />
                    Annuler la demande
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus size={16} className="mr-2" />
                    {loading ? "..." : "Envoyer une demande"}
                  </Button>
                )}
              </div>
            ) : isOwnProfile && isEditingProfile ? (
              <EditableProfile
                profile={profile}
                onSave={handleProfileUpdate}
                setAvatarPath={setUpdatedAvatar}
                setAboutMeText={setAboutMe}
                setIsPublic={setIsPublic}
              />
            ) : (
              <div className="space-y-6">
                {/* Header avec avatar et infos principales */}
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Image
                        src={updatedAvatar || "/defaultPP.webp"}
                        alt="Profile"
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-zinc-700"
                      />
                      <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-zinc-900 ${
                        profile.is_public ? 'bg-green-500' : 'bg-zinc-500'
                      }`}></div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {profile.username}
                      </h1>
                      <h2 className="text-xl text-zinc-400">
                        {profile.first_name} {profile.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          profile.is_public 
                            ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                            : 'bg-zinc-600/20 text-zinc-400 border border-zinc-600/30'
                        }`}>
                          {profile.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {isOwnProfile ? (
                        <Button
                          onClick={() => setIsEditingProfile(true)}
                          variant="outline"
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          <Settings size={16} className="mr-2" />
                          Modifier le profil
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          {isFollowing ? (
                            <Button
                              onClick={handleUnfollow}
                              disabled={loading}
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600/10"
                            >
                              <UserMinus size={16} className="mr-2" />
                              {loading ? "..." : "Ne plus suivre"}
                            </Button>
                          ) : isFollowPending ? (
                            <Button
                              onClick={() => {
                                unfollowUser(currentUserId, profile.id);
                                setIsFollowPending(false);
                              }}
                              variant="outline"
                              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                            >
                              <Clock size={16} className="mr-2" />
                              Demande envoyée
                            </Button>
                          ) : (
                            <Button
                              onClick={handleFollow}
                              disabled={loading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <UserPlus size={16} className="mr-2" />
                              {loading ? "..." : "Suivre"}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-zinc-800 bg-zinc-800">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-white">Informations</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-400 mb-1">Email</p>
                        <p className="text-zinc-200">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-400 mb-1">Date de naissance</p>
                        <p className="text-zinc-200">
                          {new Date(profile.birth_date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-zinc-800 bg-zinc-800">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-white">À propos</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-200">
                        {aboutMe || "Aucune description pour le moment."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Tabs de contenu */}
        {canViewProfile && (
          <div className="mt-6">
            <ProfileTabs userId={profile.id}
             />
            
          </div>
        )}
      </div>
    </AppLayout>
  );
}