import { useEffect } from "react";
import { EventMessage } from "../types/group";

export const useEventWebSocket = (
	eventId: string,
	setMessages: (messages: EventMessage[] | ((prev: EventMessage[]) => EventMessage[])) => void
) => {
	useEffect(() => {
		if (!eventId) return;

		let socket: WebSocket;

		const connectWebSocket = () => {
			socket = new WebSocket(`ws://localhost:8090/ws/events?eventId=${eventId}`);

			socket.onopen = () => {
				console.log("WebSocket event connected ✅");
			};

			socket.onmessage = (event) => {
				try {
					const newMsg = JSON.parse(event.data);
					setMessages((prev) => {
						const safePrev = Array.isArray(prev) ? prev : [];
						if (safePrev.some((msg) => msg.id === newMsg.message_id)) {
							return safePrev;
						}
						// Transform WebSocket message to EventMessage format
						const eventMessage: EventMessage = {
							id: newMsg.message_id,
							event_id: newMsg.event_id,
							user_id: newMsg.sender_id,
							username: newMsg.username,
							content: newMsg.content,
							created_at: newMsg.timestamp,
							updated_at: newMsg.timestamp
						};
						return [...safePrev, eventMessage];
					});
				} catch (err) {
					console.error("Error WebSocket event:", err);
				}
			};

			socket.onerror = (err) => {
				console.error("WebSocket error event:", err);
			};

			socket.onclose = () => {
				console.log("WebSocket event disconnected ❌");
			};
		};

		connectWebSocket();

		return () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close();
			}
		};
	}, [eventId, setMessages]);
};