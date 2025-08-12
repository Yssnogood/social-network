import UnifiedMessagePanel, { type UnifiedMessage, type HeaderConfig, type HeightConfig } from '../unified/UnifiedMessagePanel';

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
	onSendMessage: (content: string) => Promise<void>
	isLoading?: boolean
}

export default function MessagesList({ messages, onSendMessage, isLoading = false }: MessagesListProps) {
	return (
		<div className="mt-6 border-t border-gray-700 pt-4">
			<UnifiedMessagePanel
				messages={(messages || []).map((msg): UnifiedMessage => ({
					id: msg.id,
					content: msg.content,
					created_at: msg.created_at,
					user_id: msg.user_id,
					username: msg.username,
					group_id: msg.group_id
				}))}
				onSendMessage={onSendMessage}
				placeholder="Écrivez un message au groupe..."
				headerConfig={{
					type: 'simple',
					title: 'Messages'
				}}
				heightConfig={{
					mode: 'fixed',
					fixedHeight: 'h-96'
				}}
				isLoading={isLoading}
				className="bg-gray-900 rounded"
			/>
		</div>
	)
}