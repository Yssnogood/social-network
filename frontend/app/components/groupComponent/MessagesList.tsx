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
		<div className="mt-6 border-t border-zinc-700 pt-4">
			<h2 className="text-xl font-semibold mb-4 text-white">Messages</h2>
			<div className="space-y-3 max-h-96 overflow-y-auto bg-zinc-800 border border-zinc-700 p-4 rounded-lg">
				{Array.isArray(messages) && messages.length === 0 ? (
					<p className="text-zinc-400 text-center py-8">Aucun message pour le moment</p>
				) : (
					Array.isArray(messages) &&
					messages.map(msg => (
						<MessageItem key={msg.id} message={msg} />
					))
				)}
			</div>
		</div>
	)
}