interface CreateGroupButtonProps {
    onClick: () => void;
}

export default function CreateGroupButton({ onClick }: CreateGroupButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed right-5 top-1/2 transform -translate-y-1/2 bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors z-40"
            aria-label="Create group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2m5-10a3 3 0 11-6 0 3 3 0 016 0zM7 16a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </button>
    );
} 