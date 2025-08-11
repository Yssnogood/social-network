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
		<div className="flex gap-1 sm:gap-2 items-end">
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="flex-1 p-2 sm:p-3 bg-gray-700 text-white border border-gray-600 rounded-lg resize-none text-sm sm:text-base"
				placeholder="Message..."
				onKeyPress={handleKeyPress}
				rows={1}
				style={{
					minHeight: '40px',
					maxHeight: '120px',
				}}
			/>
			<button
				onClick={onSend}
				disabled={!value.trim()}
				className="w-9 h-9 sm:w-11 sm:h-11 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
				title="Envoyer le message"
				aria-label="Envoyer le message"
			>
				<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
				</svg>
			</button>
		</div>
	)
}