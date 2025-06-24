import { useEffect, useRef, useState } from "react";

export default function ChatModal({
	currentUserId,
	targetUserId,
	onClose,
}: {
	currentUserId: number;
	targetUserId: number;
	onClose: () => void;
}) {
	const [messages, setMessages] = useState<{ sender_id: number; content: string }[]>([]);
	const [input, setInput] = useState("");
	const ws = useRef<WebSocket | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchOrCreateConversation = async () => {
			console.log("Fetching or creating conversation between", currentUserId, "and", targetUserId);
			try {
				const res = await fetch("http://localhost:8080/api/messages/conversation", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						initiator_id: currentUserId,
						recipient_id: targetUserId,
					}),

				});
				if (!res.ok) {
					console.error("❌ Failed to fetch conversation:", res.statusText);
					return;
				}
				const convo = await res.json();
				console.log("✅ Conversation ID:", convo.id);

				const historyRes = await fetch(`http://localhost:8080/api/messages?conversation_id=${convo.id}`, {
					method: "GET",
					credentials: "include",
				});
				if (!historyRes.ok) {
					console.error("❌ Failed to fetch conversation history:", historyRes.statusText);
					return;
				}
				const history = await historyRes.json();
				console.log("✅ Fetched conversation history:", history);

				if (isMounted) {
					// S'assurer que history est un tableau
					setMessages(Array.isArray(history) ? history : []);
				}

				ws.current = new WebSocket("ws://localhost:8080/ws");

				ws.current.onopen = () => {
					console.log("✅ WebSocket connection opened");
				};

				ws.current.onmessage = (event) => {
					try {
						const msg = JSON.parse(event.data);
						if (isMounted) {
							setMessages((prev) => [...prev, msg]);
						}
					} catch (err) {
						console.error("❌ Failed to parse WebSocket message:", err);
					}
				};

				ws.current.onerror = (event) => {
					console.error("❌ WebSocket error:", event);
				};

				ws.current.onclose = (event) => {
					console.log("🔌 WebSocket closed:", event);
				};
			} catch (error) {
				console.error("❌ Error fetching conversation or opening WebSocket:", error);
			}
		};

		fetchOrCreateConversation();

		return () => {
			isMounted = false;
			if (ws.current) {
				console.log("🧹 Closing WebSocket");
				ws.current.close();
			}
		};
	}, [currentUserId, targetUserId]);

	const sendMessage = () => {
		if (!input.trim()) return;

		if (ws.current?.readyState !== WebSocket.OPEN) {
			console.warn("⚠️ WebSocket not ready:", ws.current?.readyState);
			return;
		}

		const message = {
			type: "message_send",
			sender_id: currentUserId,
			receiver_id: targetUserId,
			content: input.trim(),
		};

		try {
			console.log("📤 Envoi du message:", message);
			ws.current.send(JSON.stringify(message));
			setInput(""); // Vider le champ après envoi
		} catch (error) {
			console.error("❌ Failed to send message:", error);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
			<div className="bg-white dark:bg-gray-900 rounded-lg w-96 p-4 shadow-lg relative">
				<button
					className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
					onClick={onClose}
				>
					✕
				</button>
				<h4 className="text-xl font-semibold mb-4">Chat avec User {targetUserId}</h4>

				<div className="border border-gray-300 dark:border-gray-700 rounded p-2 h-48 overflow-y-auto mb-4 text-gray-800 dark:text-gray-100">
					{messages.length > 0 ? (
						messages.map((msg, i) => (
							<div
								key={i}
								className={`mb-2 ${msg.sender_id === currentUserId ? "text-right" : "text-left"}`}
							>
								<span
									className={`inline-block px-3 py-1 rounded ${msg.sender_id === currentUserId ? "bg-blue-600 text-white" : "bg-gray-200"
										}`}
								>
									{msg.content}
								</span>
							</div>
						))
					) : (
						<p className="text-center text-sm text-gray-400">Aucun message</p>
					)}
				</div>

				<div className="flex gap-2">
					<input
						type="text"
						placeholder="Écris un message..."
						className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-gray-100"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") sendMessage();
						}}
					/>
					<button
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						onClick={sendMessage}
					>
						Envoyer
					</button>
				</div>
			</div>
		</div>
	);
}