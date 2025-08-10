'use client';

import React, { useState, useEffect } from 'react';
import { uploadImage, validateImageFile } from '../../../services/upload';
import { MultiSelect } from '../MultiSelect';
import { fetchFriends } from '@/services/contact';

interface UniversalPostCreatorProps {
  onCreatePost: (postData: { 
    content: string; 
    privacy?: number; 
    viewers?: number[]; 
    imageUrl?: string;
  }) => Promise<void>;
  context: 'feed' | 'group';
  compact?: boolean;
  placeholder?: string;
}

export default function UniversalPostCreator({ 
  onCreatePost, 
  context, 
  compact = false, 
  placeholder 
}: UniversalPostCreatorProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Charger les amis pour les posts privés
  useEffect(() => {
    if (context === 'feed' && privacy === 2) {
      fetchFriends().then((data) => setFriends(data));
    }
  }, [context, privacy]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      alert('Fichier image non valide. Types supportés: JPEG, PNG, GIF, WebP. Taille max: 5MB.');
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let imageUrl = '';
      
      // Upload image si nécessaire
      if (imageFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.image_path;
        setIsUploading(false);
      }

      // Préparer les données du post
      const postData: any = {
        content: content.trim(),
        imageUrl: imageUrl || undefined
      };

      // Ajouter les données spécifiques au feed
      if (context === 'feed') {
        postData.privacy = privacy;
        postData.viewers = privacy === 2 ? selectedFriends.map(f => f.id) : [];
      }

      await onCreatePost(postData);
      
      // Reset du formulaire
      setContent('');
      setPrivacy(0);
      setImageFile(null);
      setImagePreview('');
      setSelectedFriends([]);
      setIsExpanded(false);
      
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
      alert('Erreur lors de la création du post');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return context === 'feed' ? "Quoi de neuf ?" : "Écrivez quelque chose au groupe...";
  };

  if (compact) {
    return (
      <div className="bg-gray-800/50 border border-gray-600 rounded p-2">
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={getPlaceholder()}
            className="flex-1 bg-gray-700 text-white p-2 border border-gray-600 rounded text-sm resize-none"
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            {isSubmitting ? '...' : '➤'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {/* Options pour le feed */}
            {context === 'feed' && (
              <select
                value={privacy}
                onChange={(e) => setPrivacy(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded text-white text-sm p-1"
              >
                <option value={0}>🌍 Public</option>
                <option value={1}>👥 Amis</option>
                <option value={2}>🔒 Sélectionné</option>
              </select>
            )}
            
            {privacy === 2 && friends.length > 0 && (
              <MultiSelect 
                options={friends} 
                selected={selectedFriends} 
                onChange={setSelectedFriends}
                placeholder="Sélectionner des amis"
              />
            )}
            
            {/* Upload d'image */}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm">
                📷 Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-300 text-sm ml-auto"
              >
                Réduire
              </button>
            </div>
            
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="max-h-32 rounded" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Si pas encore étendu, afficher juste le bouton "+"
  if (!isExpanded) {
    return (
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-gray-700 p-3 rounded transition-colors"
        >
          <span className="text-xl">+</span>
          <span>{getPlaceholder()}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full bg-gray-700 text-white p-3 border border-gray-600 rounded-md resize-none focus:outline-none focus:border-blue-500"
            rows={3}
            autoFocus
          />
        </div>

        {/* Options pour le feed */}
        {context === 'feed' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confidentialité
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md text-white p-2"
              >
                <option value={0}>🌍 Public</option>
                <option value={1}>👥 Amis</option>
                <option value={2}>🔒 Privé (sélectionné)</option>
              </select>
            </div>

            {privacy === 2 && friends.length > 0 && (
              <MultiSelect 
                options={friends} 
                selected={selectedFriends} 
                onChange={setSelectedFriends}
                placeholder="Sélectionner des amis qui peuvent voir ce post"
              />
            )}
          </>
        )}

        {/* Upload d'image */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors">
            📷 {imageFile ? 'Changer image' : 'Ajouter image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
          
          {isUploading && (
            <span className="text-blue-400 text-sm">Upload en cours...</span>
          )}
        </div>

        {imagePreview && (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-48 rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-300 px-3 py-2 text-sm transition-colors"
          >
            Réduire
          </button>
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || isUploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {isSubmitting ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  );
}