import Link from "next/link";
import Image from "next/image";
import { getUserProfile, UserProfile } from "../../../services/user";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface Follower {
	follower_id: number;
	followed_id: number;
	accepted: boolean;
	followed_at: string;
}

export default async function Profile({
	params
}: {
	params: Promise<{ username: string }>
}) {
	const { username } = await params;

	// Récupération des cookies
	const cookieStore = await cookies();

	// On récupère le token JWT
	const token = cookieStore.get("jwt")?.value || "";

	let userId = "";

	if (token) {
		try {
			// On décode le JWT sans vérifier la signature juste pour extraire le payload
			const decoded = jwt.decode(token) as { user_id?: number } | null;
			userId = decoded?.user_id?.toString() || "";
		} catch (e) {
			console.error("Erreur lors du décodage du JWT :", e);
		}
	}

	// Récupération du cookie user pour afficher l’avatar dans le header
	const usernameCookie = cookieStore.get("user")?.value || "";

	// Données du profil utilisateur ciblé par l'URL
	const profile: UserProfile = await getUserProfile(username, false);

	const fetchFollowers = async (userId: string) => {
		console.log('⚡️ Début de fetchFollowers - userId:', userId); // Log 1

		try {
			const apiUrl = `http://localhost:8080/api/followers?user_id=${userId}`;
			console.log('🔗 URL appelée:', apiUrl); // Log 2

			const response = await fetch(apiUrl);
			console.log('📡 Réponse reçue - Status:', response.status); // Log 3

			if (!response.ok) {
				console.error('❌ Erreur HTTP:', response.status, response.statusText);
				return [];
			}

			const data = await response.json();
			console.log('📦 Données reçues:', { // Log 4
				type: typeof data,
				count: Array.isArray(data) ? data.length : 'N/A',
				sample: Array.isArray(data) && data.length > 0 ? data[0] : 'Aucune donnée'
			});

			return data;
		} catch (error) {
			console.error('💥 Erreur lors du fetch:', error); // Log 5
			return [];
		}
	};

	const followers = await fetchFollowers(userId);
	console.log('👥 Followers à afficher:', { // Log 6
		userId,
		followersCount: followers.length,
	});

	return (
		<>
			<header className="fixed top-0 left-0 right-0 h-12 bg-blue-600 shadow-sm z-50 flex items-center px-4">
				<div className="container mx-auto flex justify-between items-center">
					<Link href="/home" className="font-bold text-lg text-white">
						Social Network
					</Link>
					<nav className="flex gap-4 items-center">
						<Link
							href={`/profile/${usernameCookie}`}
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
					{/* Section Profil */}
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

						<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
							<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
								Informations
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
										Date de naissance
									</p>
									<p className="text-gray-900 dark:text-white">
										{new Date(profile.birth_date).toLocaleDateString("fr-FR")}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Section Followers*/}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h3 className="text-lg font-semibold mb-4">Followers</h3>
						{followers.length > 0 ? (
							<div className="space-y-3">
								{followers.map((follower: Follower) => (
									<div key={follower.follower_id} className="flex items-center gap-3 p-2">
										<p className="font-medium">
											User ID: {follower.follower_id}
										</p>
									</div>
								))}
							</div>
						) : (
							<p className="text-gray-500 text-center py-4">
								No followers yet
							</p>
						)}
					</div>
				</div>
			</main >
		</>
	);
}
