import { useEffect } from "react";
import { GroupMessage, EventWithResponses } from "../types/group";

export const useGroupWebSocket = (
	groupId: string,
	setMessages: (messages: GroupMessage[] | ((prev: GroupMessage[]) => GroupMessage[])) => void,
	setEvents?: (events: EventWithResponses[] | ((prev: EventWithResponses[]) => EventWithResponses[])) => void
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
					const data = JSON.parse(event.data);
					console.log("WebSocket message received:", data);
					
					// Handle different message types
					if (data.type === "event_response_update" && setEvents) {
						console.log("Updating event:", data.event);
						// Update the specific event with new participant data
						// Preserve each user's own response status
						setEvents((prev) => {
							const safeEvents = Array.isArray(prev) ? prev : [];
							const updated = safeEvents.map(existingEvent => {
								if (existingEvent.id === data.event.id) {
									// Preserve the current user's response status
									const currentUserResponseStatus = existingEvent.user_response_status;
									return {
										...data.event,
										user_response_status: currentUserResponseStatus
									};
								}
								return existingEvent;
							});
							console.log("Events updated:", updated);
							return updated;
						});
					} else {
						// Handle regular group messages
						const newMsg = data;
						setMessages((prev) => {
							const safePrev = Array.isArray(prev) ? prev : [];
							if (safePrev.some((msg) => msg.id === newMsg.id)) {
								return safePrev;
							}
							return [...safePrev, newMsg];
						});
					}
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
	}, [groupId, setMessages, setEvents]);
};