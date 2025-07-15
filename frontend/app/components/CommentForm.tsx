import { useState } from "react";

interface CommentFormProps {
    onSubmit: (content: string) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
    const [commentContent, setCommentContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        onSubmit(commentContent);
        setCommentContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
            <div className="mb-2">
                <label htmlFor="commentContent" className="block text-sm font-medium text-gray-300 mb-1">
                    Add a comment
                </label>
                <textarea
                    id="commentContent"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    required
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                    Comment
                </button>
            </div>
        </form>
    );
} 