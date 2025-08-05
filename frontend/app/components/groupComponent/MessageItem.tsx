import { getCurrentUserId } from '../../../services/message';

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
	const currentUserId = getCurrentUserId();
	const isCurrentUser = message.user_id === currentUserId;

	return (
		<div className={`flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
			<div className={`max-w-xs lg:max-w-md ${
				isCurrentUser 
					? 'bg-blue-600 text-white ml-auto' 
					: 'bg-gray-600 text-white mr-auto'
			} rounded-lg px-4 py-2`}>
				{!isCurrentUser && (
					<p className="text-xs font-semibold mb-1 text-blue-200">{message.username}</p>
				)}
				<p className="text-sm">{message.content}</p>
				<p className={`text-xs mt-1 ${
					isCurrentUser ? 'text-blue-200' : 'text-gray-300'
				}`}>
					{new Date(message.created_at).toLocaleTimeString('fr-FR', { 
						hour: '2-digit', 
						minute: '2-digit' 
					})}
				</p>
			</div>
		</div>
	)
}