interface NotFoundMessageProps {
    message: string;
}

export default function NotFoundMessage({ message }: NotFoundMessageProps) {
    return (
        <div className="text-center py-10">
            <p className="text-gray-400">{message}</p>
        </div>
    );
} 