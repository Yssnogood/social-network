import MessageItem from './MessageItem'

type GroupMessage = {
	id: number
	group_id: number
	user_id: number
	username: string
	content: string
	created_at: string
	updated_at: string
}

interface MessagesListProps {
	messages: GroupMessage[]
}

export default function MessagesList({ messages }: MessagesListProps) {
	return (
		<div className="mt-6 border-t border-gray-700 pt-4">
			<h2 className="text-xl font-semibold mb-2 text-white">Messages</h2>
			<div className="max-h-96 overflow-y-auto bg-gray-900 p-3 rounded">
				{!messages || !Array.isArray(messages) ? (
					<p className="text-gray-400 text-center">Chargement des messages...</p>
				) : messages.length === 0 ? (
					<p className="text-gray-400 text-center">Aucun message pour le moment</p>
				) : (
					messages.map(msg => (
						<MessageItem key={msg.id} message={msg} />
					))
				)}
			</div>
		</div>
	)
}