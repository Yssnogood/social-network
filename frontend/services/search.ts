// Allow the users to search for users and groups from the backend (function used in SearchBar.tsx)
export async function searchInstances(query: string, currentUserId: number): Promise<{ users: any[], groups: any[] }> {
	if (currentUserId == 0) {
		console.error("❌ currentUserId is 0, cannot perform search");
		return { users: [], groups: [] };
	}
	try {
		const response = await fetch("http://localhost:8080/api/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query,
				current: currentUserId,
			}),
		});

		if (!response.ok) {
			throw new Error("Erreur lors de la recherche.");
		}

		return await response.json(); // { users: [...], groups: [...] }
	} catch (error) {
		console.error("❌ Erreur searchInstances :", error);
		return { users: [], groups: [] };
	}
}
