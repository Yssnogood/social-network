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

    try {
        const cookies = await getCookies();
        const url = userName ? 
            `http://localhost:8090/api/users/${userName}` : 
            'http://localhost:8090/api/users/me';
        
        // Prepare headers - for Server Components, we need to pass cookies explicitly
        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        };
        
        const jwt = cookies.get("jwt");
        console.log('Debug - JWT found:', jwt ? 'YES' : 'NO');
        if (jwt) {
            // Pass JWT as cookie header for server-side requests
            headers["Cookie"] = `jwt=${jwt}`;
            console.log('Debug - Cookie header set');
        } else {
            console.log('Debug - No JWT cookie found, user not authenticated');
        }
            
        const response = await fetch(url, {
            method: "GET",
            headers,
            credentials: "include" // This will send cookies automatically for client-side
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
        notFound()
    }
}

export async function getCurrentUser(): Promise<UserProfile> {
    try {
        const cookies = await getCookies();
        
        // Prepare headers - for Server Components, we need to pass cookies explicitly
        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        };
        
        const jwt = cookies.get("jwt");
        console.log('Debug - JWT found:', jwt ? 'YES' : 'NO');
        if (jwt) {
            // Pass JWT as cookie header for server-side requests
            headers["Cookie"] = `jwt=${jwt}`;
            console.log('Debug - Cookie header set');
        } else {
            console.log('Debug - No JWT cookie found, user not authenticated');
        }
        
        const response = await fetch("http://localhost:8090/api/users/me", {
            method: "GET",
            headers,
            credentials: "include" // This will send cookies automatically for client-side
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

// Client-side version of getUserProfile
export async function getUserProfileClient(userName: string): Promise<UserProfile> {
    try {
        const url = `http://localhost:8090/api/users/${userName}`;
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include" // This will send cookies automatically
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error('Expected JSON response but got:', contentType);
            const text = await response.text();
            console.error('Response text:', text);
            throw new Error('Invalid response format');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile (client):', error);
        throw error;
    }
}