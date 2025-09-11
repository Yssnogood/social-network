type GroupMessage = {
	id: number
	group_id: number
	user_id: number
	username: string
	content: string
	created_at: string
	updated_at: string
}

interface MessageItemProps {
	message: GroupMessage
}

export default function MessageItem({ message }: MessageItemProps) {
	return (
		<div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg">
			<p className="text-sm font-semibold text-blue-400">{message.username}</p>
			<p className="mt-2 text-zinc-100">{message.content}</p>
			<p className="text-xs text-zinc-500 mt-2">
				{new Date(message.created_at).toLocaleTimeString()}
			</p>
		</div>
	)
}