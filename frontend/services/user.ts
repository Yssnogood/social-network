import { getCookies } from "next-client-cookies/server";
import { notFound } from "next/navigation";

export interface Friend {
    id: string | number;
    name: string;
    avatarPath?: string;
}

export interface UserProfile {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date: string;
    about_me: string;
    is_public: boolean;
    avatar_path: string;
    friends: Friend[];
}

export async function getUserProfile(userName?: string, useMockData: boolean = false): Promise<UserProfile> {
    const cookies = await getCookies()
    // If useMockData is true, return mock data
    if (useMockData) {
        return {
            id:0,
            username: "username",
            first_name: "FirstName",
            last_name: "LastName",
            email: "user@example.com",
            birth_date: "January 1, 1990",
            about_me: "Description",
            is_public: false,
            avatar_path: "/social-placeholder.png",
            friends: [
                {
                    id: 1,
                    name: "John Doe",
                    avatarPath: "/social-placeholder.png",
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    avatarPath: "/social-placeholder.png",
                },
                {
                    id: 3,
                    name: "Alice Johnson",
                    avatarPath: "/social-placeholder.png",
                },
                {
                    id: 4,
                    name: "Bob Brown",
                    avatarPath: "/social-placeholder.png",
                }
            ]
        };
    }

    // Will be changed for the real API endpoint
    try {
        const response = await fetch(`http://localhost:8080/api/user/${userName || 'current'}`,{
            method: "POST",
            body: JSON.stringify({
                jwt: cookies.get("jwt")
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to mock data if the API call fails
        notFound()
    }
}
