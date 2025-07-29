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
			socket = new WebSocket(`ws://localhost:8080/ws/groups?groupId=${groupId}`);

			socket.onopen = () => {
				console.log("WebSocket group connected ✅");
			};

			socket.onmessage = (event) => {
				try {
					const newMsg = JSON.parse(event.data);
					setMessages((prev) => {
						const safePrev = Array.isArray(prev) ? prev : [];
						if (safePrev.some((msg) => msg.id === newMsg.id)) {
							return safePrev;
						}
						return [...safePrev, newMsg];
					});
				} catch (err) {
					console.error("Error WebSocket group:", err);
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