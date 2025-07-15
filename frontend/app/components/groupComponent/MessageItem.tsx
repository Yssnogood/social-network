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
		<div className="bg-white p-2 rounded shadow">
			<p className="text-sm font-semibold text-blue-600">{message.username}</p>
			<p className="mt-1">{message.content}</p>
			<p className="text-xs text-gray-500 mt-1">
				{new Date(message.created_at).toLocaleTimeString()}
			</p>
		</div>
	)
}