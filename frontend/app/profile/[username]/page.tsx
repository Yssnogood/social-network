import { getUserProfile, UserProfile } from "../../../services/user";
import { cookies } from "next/headers";
import ClientProfile from "./Profile";

interface Follower {
    follower_id: number;
    followed_id: number;
    accepted: boolean;
    followed_at: string;
}

export default async function Profile(props: { params: Promise<{ username: string }> }) {
    const { username } = await props.params;

    const cookieStore = await cookies();
    const loggedInUser = cookieStore.get("user")?.value || "";

    const profile: UserProfile = await getUserProfile(username, false);

    const fetchFollowers = async (): Promise<Follower[]> => {
        try {
            const cookieHeader = cookieStore
                .getAll()
                .map(c => `${c.name}=${c.value}`)
                .join("; ");

            const response = await fetch("http://localhost:8080/api/followers", {
                headers: {
                    Cookie: cookieHeader,
                },
                cache: "no-store",
            });

            if (!response.ok) {
                console.error(" Erreur HTTP:", response.status, response.statusText);
                return [];
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(" Erreur lors du fetch:", error);
            return [];
        }
    };

    const followers = await fetchFollowers();

    return (
        <ClientProfile
            profile={profile}
            loggedInUser={loggedInUser}
            followers={followers}
            currentUserId={profile.id}
        />
    );
}
