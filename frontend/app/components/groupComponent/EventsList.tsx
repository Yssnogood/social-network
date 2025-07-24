"use client";

import { Event, User } from "../../types/group";

interface EventsListProps {
	events: Event[];
	currentUser: User | null;
	onEventResponse: (eventId: number, status: string) => Promise<void>;
	onDeleteEvent: (eventId: number) => Promise<void>;
}

export default function EventsList({
	events,
	currentUser,
	onEventResponse,
	onDeleteEvent
}: EventsListProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("fr-FR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-4 mb-6">
			<h3 className="text-lg font-semibold">Événements à venir</h3>
			{events.length === 0 ? (
				<p className="text-gray-500">Aucun événement pour le moment.</p>
			) : (
				events.map((event) => (
					<div key={event.id} className="border p-4 rounded-md bg-gray-50">
						<h4 className="font-semibold text-blue-600">{event.title}</h4>
						<p className="text-sm text-gray-600 mb-1">📅 {formatDate(event.event_date)}</p>
						<p className="text-gray-700 mb-2">{event.description}</p>
						<div className="flex gap-2">
							<button
								onClick={() => onEventResponse(event.id, 'going')}
								className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
							>
								Participer
							</button>
							<button
								onClick={() => onEventResponse(event.id, 'not_going')}
								className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
							>
								Ne pas participer
							</button>
							{currentUser?.id === event.creator_id && (
								<button
									onClick={() => onDeleteEvent(event.id)}
									className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
								>
									Supprimer
								</button>
							)}
						</div>
					</div>
				))
			)}
		</div>
	);
}