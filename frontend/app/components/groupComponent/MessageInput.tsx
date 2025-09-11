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
				className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 resize-none"
				placeholder="Écrire un message..."
				rows={3}
				onKeyPress={handleKeyPress}
			/>
			<button
				onClick={onSend}
				disabled={!value.trim()}
				className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
			>
				Envoyer
			</button>
		</div>
	)
}