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
			<h3 className="text-lg font-semibold text-white">Événements à venir</h3>
			{events.length === 0 ? (
				<p className="text-zinc-400">Aucun événement pour le moment.</p>
			) : (
				events.map((event) => (
					<div key={event.id} className="border border-zinc-700 p-4 rounded-lg bg-zinc-800">
						<h4 className="font-semibold text-blue-400 mb-2">{event.title}</h4>
						<p className="text-sm text-zinc-300 mb-1">📅 {formatDate(event.event_date)}</p>
						<p className="text-zinc-100 mb-3">{event.description}</p>
						<div className="flex flex-wrap gap-2 items-center">
							<button
								onClick={() => onEventResponse(event.id, 'going')}
								className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 font-medium transition-colors flex-shrink-0"
							>
								Participer
							</button>
							<button
								onClick={() => onEventResponse(event.id, 'not_going')}
								className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 font-medium transition-colors flex-shrink-0"
							>
								Ne pas participer
							</button>
							{currentUser?.id === event.creator_id && (
								<button
									onClick={() => onDeleteEvent(event.id)}
									className="bg-zinc-600 text-zinc-200 px-3 py-1.5 rounded text-sm hover:bg-zinc-500 font-medium transition-colors flex-shrink-0"
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