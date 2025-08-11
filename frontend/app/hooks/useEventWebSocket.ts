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
					// 🎯 GÉRER LES MESSAGES JSON MULTIPLES CONCATÉNÉS
					const rawData = event.data.trim();
					console.log("🔌 WebSocket événement données brutes:", rawData);
					
					// Fonction pour parser plusieurs objets JSON concaténés
					const parseMultipleJSON = (data: string) => {
						const objects = [];
						let currentPos = 0;
						
						while (currentPos < data.length) {
							// Ignorer les espaces
							while (currentPos < data.length && /\s/.test(data[currentPos])) {
								currentPos++;
							}
							if (currentPos >= data.length) break;
							
							// Trouver la fin du prochain objet JSON
							let braceCount = 0;
							let start = currentPos;
							let inString = false;
							let escaped = false;
							
							while (currentPos < data.length) {
								const char = data[currentPos];
								
								if (escaped) {
									escaped = false;
								} else if (char === '\\' && inString) {
									escaped = true;
								} else if (char === '"') {
									inString = !inString;
								} else if (!inString) {
									if (char === '{') {
										braceCount++;
									} else if (char === '}') {
										braceCount--;
										if (braceCount === 0) {
											// Fin de l'objet JSON
											const jsonStr = data.slice(start, currentPos + 1);
											try {
												objects.push(JSON.parse(jsonStr));
											} catch (e) {
												console.error("Error parsing JSON object:", jsonStr, e);
											}
											currentPos++;
											break;
										}
									}
								}
								currentPos++;
							}
						}
						return objects;
					};
					
					const messages = parseMultipleJSON(rawData);
					console.log("🔌 WebSocket événement messages parsés:", messages);
					
					for (const newMsg of messages) {
						// 🎯 FILTRER seulement les vrais messages d'événements
						if (newMsg.type === 'event_message_received' && newMsg.message_id) {
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
								console.log("✅ Message d'événement ajouté:", eventMessage);
								return [...safePrev, eventMessage];
							});
						} else {
							// Messages de système (event_join_success, etc.)
							console.log("ℹ️ Message système WebSocket événement:", newMsg.type);
						}
					}
				} catch (err) {
					console.error("Error WebSocket event:", err);
					console.error("Données reçues:", event.data);
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