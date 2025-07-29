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
		<div className="space-y-4 mb-6">
			<h3 className="text-lg font-semibold">Créer un événement</h3>
			<input
				type="text"
				placeholder="Titre de l'événement"
				value={newEvent.title}
				onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
				className="w-full border p-2 rounded"
			/>
			<textarea
				placeholder="Description"
				value={newEvent.description}
				onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
				className="w-full border p-2 rounded"
			/>
			<input
				type="datetime-local"
				value={newEvent.event_date}
				onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
				className="w-full border p-2 rounded"
			/>
			<button
				onClick={handleCreate}
				className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
			>
				Créer l'événement
			</button>
		</div>
	);
}