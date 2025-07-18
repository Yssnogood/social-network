interface MessageInputProps {
	value: string
	onChange: (value: string) => void
	onSend: () => void
}

export default function MessageInput({ value, onChange, onSend }: MessageInputProps) {
	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			onSend()
		}
	}

	return (
		<div className="mt-4">
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full p-2 border rounded mb-2"
				placeholder="Écrire un message..."
				onKeyPress={handleKeyPress}
			/>
			<button
				onClick={onSend}
				disabled={!value.trim()}
				className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
			>
				Envoyer
			</button>
		</div>
	)
}