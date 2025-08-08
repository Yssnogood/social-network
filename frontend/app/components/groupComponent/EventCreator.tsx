"use client";

import { useState } from "react";

interface EventCreatorProps {
	onCreateEvent: (title: string, description: string, eventDate: string) => Promise<void>;
	compact?: boolean;
}

export default function EventCreator({ onCreateEvent, compact = false }: EventCreatorProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		if (!title.trim() || !eventDate) return;

		try {
			setIsCreating(true);
			await onCreateEvent(title, description, eventDate);
			setTitle("");
			setDescription("");
			setEventDate("");
		} catch (error) {
			console.error('Erreur lors de la création de l\'événement:', error);
		} finally {
			setIsCreating(false);
		}
	};

	// Obtenir la date minimale (aujourd'hui)
	const getMinDate = () => {
		return new Date().toISOString().split('T')[0];
	};

	// Obtenir la datetime minimale (maintenant)
	const getMinDateTime = () => {
		const now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		return now.toISOString().slice(0, 16);
	};

	if (compact) {
		return (
			<div className="bg-gray-800/50 p-2 rounded border border-gray-600">
				<div className="space-y-2">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Titre de l'événement..."
						className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded text-sm"
					/>
					<div className="flex gap-2">
						<input
							type="datetime-local"
							value={eventDate}
							onChange={(e) => setEventDate(e.target.value)}
							min={getMinDateTime()}
							className="flex-1 bg-gray-700 text-white p-2 border border-gray-600 rounded text-sm"
						/>
						<button
							onClick={handleCreate}
							disabled={!title.trim() || !eventDate || isCreating}
							className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium"
						>
							{isCreating ? '⟳' : '➤'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
			<h3 className="font-semibold mb-3 text-white">Créer un événement</h3>
			<div className="space-y-3">
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Titre de l'événement..."
					className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md"
				/>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Description de l'événement (optionnel)..."
					className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-md resize-none"
					rows={2}
				/>
				<div className="flex gap-3">
					<input
						type="datetime-local"
						value={eventDate}
						onChange={(e) => setEventDate(e.target.value)}
						min={getMinDateTime()}
						className="flex-1 p-3 bg-gray-700 text-white border border-gray-600 rounded-md"
					/>
					<button
						onClick={handleCreate}
						disabled={!title.trim() || !eventDate || isCreating}
						className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium"
					>
						{isCreating ? 'Création...' : 'Créer'}
					</button>
				</div>
			</div>
		</div>
	);
}