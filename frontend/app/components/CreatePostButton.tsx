interface CreatePostButtonProps {
    onClick: () => void;
}

export default function CreatePostButton({ onClick }: CreatePostButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed left-5 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors z-40"
            aria-label="Create post"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </button>
    );
} 