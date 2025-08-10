'use client';

import React, { useState } from 'react';

interface UniversalCommentFormProps {
  postId: number;
  onSubmit: (postId: number, content: string) => Promise<void>;
  placeholder?: string;
}

export default function UniversalCommentForm({ 
  postId, 
  onSubmit,
  placeholder = "Ajouter un commentaire..."
}: UniversalCommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!content.trim() || isSubmitting) return;
    
    console.log('UniversalCommentForm.handleSubmit:', {
      postId,
      content: content.trim()
    });
    
    setIsSubmitting(true);
    try {
      await onSubmit(postId, content.trim());
      setContent(''); // Clear on success
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        disabled={isSubmitting}
        className="flex-1 bg-gray-700 text-white text-sm px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
      >
        {isSubmitting ? '...' : 'Envoyer'}
      </button>
    </form>
  );
}