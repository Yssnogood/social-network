import { getCookies } from "next-client-cookies/server";
import { notFound } from "next/navigation";
import jwt from "jsonwebtoken";

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
        const response = await fetch(`http://localhost:8090/api/user/${userName || 'current'}`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                jwt: cookies.get("jwt")
            })
        });
        
        if (!response.ok) {
            console.error(`User profile fetch failed: ${response.status} ${response.statusText}`);
            notFound();
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error('Expected JSON response but got:', contentType);
            const text = await response.text();
            console.error('Response text:', text);
            notFound();
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to mock data if the API call fails
        notFound()
    }
}

export async function getCurrentUser(): Promise<UserProfile> {
    const cookies = await getCookies();
    try {
        const response = await fetch("http://localhost:8090/api/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                jwt: cookies.get("jwt")
            })
        });
        
        if (!response.ok) {
            console.error(`Current user fetch failed: ${response.status} ${response.statusText}`);
            notFound();
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error('Expected JSON response but got:', contentType);
            const text = await response.text();
            console.error('Response text:', text);
            notFound();
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching current user:', error);
        notFound();
    }
}

export async function getUserIdFromToken(token: string | undefined): Promise<string | null> {
  try {

    if (!token) return null;

    const decoded = jwt.decode(token) as { user_id?: number } | null;
    if (decoded?.user_id !== undefined) {
      return decoded.user_id.toString();
    } else {
      console.warn("Le token ne contient pas de user_id");
      return null;
    }
  } catch (e) {
    console.error("Erreur lors du décodage du JWT :", e);
    return null;
  }
}

// Client-side version of user data fetching
export async function getCurrentUserClient(): Promise<UserProfile> {
    try {
        const response = await fetch("http://localhost:8090/api/users/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include" // This will send cookies automatically
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching current user (client):', error);
        // Return a default user object or throw
        throw error;
    }
}