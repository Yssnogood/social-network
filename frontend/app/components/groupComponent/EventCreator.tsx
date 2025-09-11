"use client";

import { useState } from "react";

interface EventCreatorProps {
	onCreateEvent: (event: { title: string; description: string; event_date: string }) => Promise<void>;
}

export default function EventCreator({ onCreateEvent }: EventCreatorProps) {
	const [newEvent, setNewEvent] = useState({
		title: "",
		description: "",
		event_date: "",
	});

	const handleCreate = async () => {
		if (!newEvent.title.trim() || !newEvent.event_date.trim()) return;

		await onCreateEvent(newEvent);
		setNewEvent({ title: "", description: "", event_date: "" });
	};

	return (
		<div className="space-y-4 mb-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
			<h3 className="text-lg font-semibold text-white">Créer un événement</h3>
			<input
				type="text"
				placeholder="Titre de l'événement"
				value={newEvent.title}
				onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
				className="w-full bg-zinc-900 border border-zinc-600 p-3 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			<textarea
				placeholder="Description"
				value={newEvent.description}
				onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
				className="w-full bg-zinc-900 border border-zinc-600 p-3 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
				rows={3}
			/>
			<input
				type="datetime-local"
				value={newEvent.event_date}
				onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
				className="w-full bg-zinc-900 border border-zinc-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			<button
				onClick={handleCreate}
				className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
			>
				Créer l'événement
			</button>
		</div>
	);
}