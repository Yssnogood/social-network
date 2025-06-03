import Link from "next/link";
import Image from "next/image";
import { getUserProfile, UserProfile } from "../../../services/user";
import { getCookies } from "next-client-cookies/server";

export default async function Profile() {
    const cookies = await getCookies()
    // Get user profile data with mock data (boolean is set to 'true')
    // In the future, "undefined" will be replaced with the actual user ID
    const profile: UserProfile = await getUserProfile(cookies.get("user"), false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/home" className="font-bold text-lg text-white">
                        Social Network
                    </Link>
                    <nav className="flex gap-4 items-center">
                        <button
                            className="text-sm text-white hover:text-blue-200 cursor-pointer flex items-center"
                            aria-label="Messages"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </button>

                        <button
                            className="text-sm text-white hover:text-blue-200 cursor-pointer flex items-center"
                            aria-label="Notifications"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>

                        <Link
                            href="/logout"
                            className="text-sm text-white hover:text-blue-200"
                        >
                            Logout
                        </Link>

                        <Link
                            href="/profile"
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
                    {/* Left section (2/3 width on medium screens and up) */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        {/* Profile header section */}
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

                            {/* Profile info */}
                            <div className="flex flex-col mt-4 md:mt-0">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {profile.username}
                                </h1>
                                <h2 className="text-xl text-gray-700 dark:text-gray-300 mt-2">
                                    {profile.first_name} {profile.last_name}
                                </h2>

                                <div className="flex items-center mt-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-500 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    <span className="mr-3 text-sm text-gray-600 dark:text-gray-400">
                                        Private Profile
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" value="" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* More information section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                More Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Email
                                    </p>
                                    <p className="text-gray-900 dark:text-white">
                                        {profile.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Birth Date
                                    </p>
                                    <p className="text-gray-900 dark:text-white">
                                        {(new Date(Date.parse(profile.birth_date))).toLocaleDateString("FR")}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        About Me
                                    </p>
                                    <p className="text-gray-900 dark:text-white">
                                        {profile.about_me}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right section (1/3 width on medium screens and up) */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Friends
                        </h3>
                        <div className="space-y-4">
                            {/* Map through the friends from the profile data */}
                            {profile.friends 
                            ? profile.friends.map((friend) => (
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
                        : ""}

                            {/* Show message when no friends are found */}
                            {profile.friends && (
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
