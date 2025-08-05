// Allow the users to search for users and groups from the backend (function used in SearchBar.tsx)
export async function searchInstances(query: string, currentUserId: number): Promise<{ users: any[], groups: any[] }> {
	console.log("🔍 SearchInstances called with:", { query, currentUserId });
	
	if (currentUserId == 0) {
		console.error("❌ currentUserId is 0, cannot perform search");
		return { users: [], groups: [] };
	}
	
	try {
		const response = await fetch("http://localhost:8090/api/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include", // Ajouter les credentials pour le JWT
			body: JSON.stringify({
				query,
				current: currentUserId,
			}),
		});

		console.log("🔍 Search response status:", response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("❌ Search API error:", errorText);
			throw new Error(`Erreur lors de la recherche: ${response.status} - ${errorText}`);
		}

		const result = await response.json();
		console.log("🔍 Search result:", result);
		return result; // { users: [...], groups: [...] }
	} catch (error) {
		console.error("❌ Erreur searchInstances :", error);
		return { users: [], groups: [] };
	}
}
