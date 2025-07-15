interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
    return (
        <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
            <p className="mt-2 text-gray-400">{message}</p>
        </div>
    );
} 