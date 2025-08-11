import { useEffect } from "react";
import { GroupMessage } from "../types/group";

export const useGroupWebSocket = (
	groupId: string,
	setMessages: (messages: GroupMessage[] | ((prev: GroupMessage[]) => GroupMessage[])) => void
) => {
	useEffect(() => {
		if (!groupId) return;

		let socket: WebSocket;

		const connectWebSocket = () => {
			socket = new WebSocket(`ws://localhost:8090/ws/groups?groupId=${groupId}`);

			socket.onopen = () => {
				console.log("WebSocket group connected ✅");
			};

			socket.onmessage = (event) => {
				try {
					// Vérifier que les données sont bien du JSON avant de parser
				if (typeof event.data !== 'string' || event.data.trim() === '') {
					console.warn("WebSocket received empty or invalid data:", event.data);
					return;
				}
				
				// Gérer les messages multiples séparés par des retours à la ligne
				const messages = event.data.trim().split('\n').filter(line => line.trim());
				
				for (const messageData of messages) {
					try {
						const newMsg = JSON.parse(messageData);
						
						// Ignorer les messages de système (connection_success, group_join_success)
						if (newMsg.type === 'connection_success' || newMsg.type === 'group_join_success') {
							console.log("WebSocket system message:", newMsg.type);
							continue;
						}
						
						// Traiter seulement les messages de chat
						if (newMsg.content && newMsg.username) {
							setMessages((prev) => {
								const safePrev = Array.isArray(prev) ? prev : [];
								if (safePrev.some((msg) => msg.id === newMsg.id)) {
									return safePrev;
								}
								return [...safePrev, newMsg];
							});
						}
					} catch (parseError) {
						console.warn("Failed to parse individual message:", messageData, parseError);
					}
				}
				} catch (err) {
					console.error("Error WebSocket group:", err);
					console.error("Raw data received:", event.data);
				}
			};

			socket.onerror = (err) => {
				console.error("WebSocket error group:", err);
			};

			socket.onclose = () => {
				console.log("WebSocket group disconnected ❌");
			};
		};

		connectWebSocket();

		return () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
			}
		};
	}, [groupId, setMessages]);
};