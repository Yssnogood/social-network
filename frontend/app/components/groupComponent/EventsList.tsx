"use client";

import { EventWithResponses, User } from "../../types/group";

interface EventsListProps {
	events: EventWithResponses[];
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
						
						{/* Boutons de réponse */}
						<div className="flex flex-wrap gap-2 items-center mb-4">
							<button
								onClick={() => onEventResponse(event.id, 'going')}
								className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex-shrink-0 ${
									event.user_response_status === 'going'
										? 'bg-green-700 text-white border-2 border-green-400'
										: 'bg-green-600 text-white hover:bg-green-700'
								}`}
							>
								{event.user_response_status === 'going' ? '✓ Je participe' : 'Participer'}
							</button>
							<button
								onClick={() => onEventResponse(event.id, 'not_going')}
								className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex-shrink-0 ${
									event.user_response_status === 'not_going'
										? 'bg-red-700 text-white border-2 border-red-400'
										: 'bg-red-600 text-white hover:bg-red-700'
								}`}
							>
								{event.user_response_status === 'not_going' ? '✗ Je ne participe pas' : 'Ne pas participer'}
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

						{/* Affichage des participants */}
						<div className="space-y-3">
							{event.participants && event.participants.length > 0 && (
								<div className="bg-green-900/20 p-3 rounded-lg border border-green-800/50 transition-all duration-300">
									<h5 className="text-green-400 font-medium mb-2">
										🟢 Participants ({event.participants.length})
									</h5>
									<div className="flex flex-wrap gap-2">
										{event.participants.map((participant) => (
											<span
												key={participant.user_id}
												className="bg-green-800/50 text-green-200 px-2 py-1 rounded-full text-xs animate-in fade-in-0 duration-300"
											>
												{participant.username}
											</span>
										))}
									</div>
								</div>
							)}

							{event.non_participants && event.non_participants.length > 0 && (
								<div className="bg-red-900/20 p-3 rounded-lg border border-red-800/50 transition-all duration-300">
									<h5 className="text-red-400 font-medium mb-2">
										🔴 Ne participent pas ({event.non_participants.length})
									</h5>
									<div className="flex flex-wrap gap-2">
										{event.non_participants.map((participant) => (
											<span
												key={participant.user_id}
												className="bg-red-800/50 text-red-200 px-2 py-1 rounded-full text-xs animate-in fade-in-0 duration-300"
											>
												{participant.username}
											</span>
										))}
									</div>
								</div>
							)}

							{(!event.participants || event.participants.length === 0) && (!event.non_participants || event.non_participants.length === 0) && (
								<div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50">
									<p className="text-zinc-400 text-sm">Aucuns participants ou refus de participation</p>
								</div>
							)}
						</div>
					</div>
				))
			)}
		</div>
	);
}