import { useState, use, useEffect } from "react";
import { CldUploadButton } from "next-cloudinary";
import { MultiSelect } from "./MultiSelect";
import { fetchFriends } from "@/services/contact";

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (postData: { content: string; privacy: number; viewers: number[]; imageUrl?: string }) => void;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
    const [postPrivacy, setPostPrivacy] = useState(0);
    const [postContent, setPostContent] = useState('');
    const [imageURL, setPostImage] = useState<string>('');
    const [friends,setFriends] = useState<any[]>([]);
    const [selectedFriends,setSelectedFriends] = useState<any[]>([]);
    
    useEffect(() => {
        if (!isOpen) return;
        fetchFriends().then((data) => setFriends(data || []));
    }, [isOpen]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl;
        if (imageURL !== '') {
            imageUrl = imageURL;
        }
        let viewers: number[] = [];
        if (postPrivacy == 2) {
            viewers = friends.map((friend) => friend.id)
            console.log(viewers,postPrivacy)
        }
        onSubmit({
            content: postContent,
            privacy: postPrivacy,
            viewers,
            imageUrl
        });

        // Reset form
        setPostPrivacy(0);
        setPostContent('');
        setPostImage('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Create a Post</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="postPrivacy" className="block text-sm font-medium text-zinc-300 mb-2">Privacy</label>
                        <div className="relative">
                            <select
                                name="postPrivacy"
                                id="postPrivacy"
                                value={postPrivacy}
                                onChange={(e) => setPostPrivacy(Number(e.target.value))}
                                className="w-full px-3 py-2 pr-10 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:bg-zinc-800"
                            >
                                <option value="0">🌍 Public</option>
                                <option value="1">🙎‍♂️ Friends</option>
                                <option value="2">🔒 Private</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        
                        {postPrivacy === 2 && <MultiSelect options={friends} selected={selectedFriends} onChange={setSelectedFriends} placeholder="Select who can see the post" />}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="postContent" className="block text-sm font-medium text-zinc-300 mb-2">Content</label>
                        <textarea
                            id="postContent"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-zinc-400 transition-colors resize-none"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="What's on your mind?"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Upload Image</label>
                        <CldUploadButton
                            options={{ sources: ['local', 'url'] }}
                            uploadPreset={cloudPresetName}
                            onSuccess={(result) => {
                                if (result.info && typeof result.info !== "string") {
                                    setPostImage(result.info.secure_url);
                                }
                            }}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-300 hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Upload Image</span>
                        </CldUploadButton>
                        {imageURL && (
                            <div className="mt-2 text-sm text-zinc-400">
                                ✓ Image uploaded successfully
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                        >
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 