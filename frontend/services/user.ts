export interface Friend {
    id: string | number;
    name: string;
    avatarPath?: string;
}

export interface UserProfile {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    aboutMe: string;
    isPublic: boolean;
    avatarPath: string;
    friends: Friend[];
}

export async function getUserProfile(userId?: string, useMockData: boolean = false): Promise<UserProfile> {
    // If useMockData is true, return mock data
    if (useMockData) {
        return {
            username: "username",
            firstName: "FirstName",
            lastName: "LastName",
            email: "user@example.com",
            birthDate: "January 1, 1990",
            aboutMe: "Description",
            isPublic: false,
            avatarPath: "/social-placeholder.png",
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
        const response = await fetch(`/api/users/${userId || 'current'}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to mock data if the API call fails
        return getUserProfile(userId, true);
    }
}
