import { useState } from "react";
import { CldUploadButton } from "next-cloudinary";

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

interface CommentFormProps {
    onSubmit: (data: { content: string; imageUrl?: string }) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
    const [commentContent, setCommentContent] = useState("");
    const [imageURL, setImageURL] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim() && !imageURL) return;

        onSubmit({
            content: commentContent,
            imageUrl: imageURL || undefined,
        });

        // Reset form
        setCommentContent("");
        setImageURL("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-4 rounded-lg shadow-md mb-4"
        >
            <div className="mb-2">
                <label
                    htmlFor="commentContent"
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    Add a comment
                </label>
                <textarea
                    id="commentContent"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                />
            </div>

            {/* Image Upload */}
            <div className="mb-2">
                <CldUploadButton
                    options={{ sources: ["local", "url"] }}
                    uploadPreset={cloudPresetName}
                    onSuccess={(result) => {
                        if (result.info && typeof result.info !== "string") {
                            setImageURL(result.info.secure_url);
                        }
                    }}
                >
                    <span className="text-sm text-gray-300 underline cursor-pointer">
                        Upload Image
                    </span>
                </CldUploadButton>
            </div>

            {/* Preview uploaded image */}
            {imageURL && (
                <div className="mb-2">
                    <img
                        src={imageURL}
                        alt="Uploaded preview"
                        className="rounded-md max-h-40"
                    />
                </div>
            )}

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
