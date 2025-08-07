'use client';

import { useState } from 'react';
import { CldUploadButton } from 'next-cloudinary';

const cloudPresetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

interface BackgroundImageUploadProps {
    imageUrl: string;
    onImageChange: (url: string) => void;
    disabled?: boolean;
}

export default function BackgroundImageUpload({ 
    imageUrl, 
    onImageChange, 
    disabled = false 
}: BackgroundImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleUploadSuccess = (result: any) => {
        setIsUploading(false);
        if (result.info && typeof result.info !== "string") {
            onImageChange(result.info.secure_url);
        }
    };

    const handleUploadError = (error: any) => {
        setIsUploading(false);
        setUploadError("Erreur lors du téléchargement de l'image");
        console.error('Upload error:', error);
    };

    const removeImage = () => {
        onImageChange('');
        setUploadError(null);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Image de fond
            </label>
            
            {uploadError && (
                <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded-lg text-red-100 text-sm">
                    {uploadError}
                </div>
            )}

            {!imageUrl ? (
                <div className="border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                    <CldUploadButton
                        options={{ 
                            sources: ['local', 'url'],
                            multiple: false,
                            maxFileSize: 10000000, // 10MB
                            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                            folder: 'social-network/backgrounds',
                            transformation: [
                                { width: 1200, height: 600, crop: 'limit' },
                                { quality: 'auto', fetch_format: 'auto' }
                            ]
                        }}
                        uploadPreset={cloudPresetName}
                        onSuccess={handleUploadSuccess}
                        onError={handleUploadError}
                        className="w-full p-8 text-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={disabled || isUploading}
                    >
                        <div className="text-gray-400">
                            {isUploading ? (
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                                    <p>Téléchargement en cours...</p>
                                </div>
                            ) : (
                                <>
                                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm font-medium mb-2">Cliquez pour ajouter une image de fond</p>
                                    <p className="text-xs text-gray-500">
                                        JPG, PNG ou WEBP • Max 10MB • Recommandé: 1200x600px
                                    </p>
                                </>
                            )}
                        </div>
                    </CldUploadButton>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-gray-800">
                        <img 
                            src={imageUrl} 
                            alt="Image de fond" 
                            className="w-full h-full object-cover"
                            onError={() => setUploadError("Impossible de charger l'image")}
                        />
                        
                        {/* Overlay avec aperçu du titre si fourni */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <div className="text-center text-white">
                                <p className="text-sm font-medium mb-1">Aperçu de l'image de fond</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Boutons d'action */}
                    <div className="absolute top-2 right-2 flex gap-2">
                        {/* Bouton de remplacement */}
                        <CldUploadButton
                            options={{ 
                                sources: ['local', 'url'],
                                multiple: false,
                                maxFileSize: 10000000,
                                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                                folder: 'social-network/backgrounds',
                                transformation: [
                                    { width: 1200, height: 600, crop: 'limit' },
                                    { quality: 'auto', fetch_format: 'auto' }
                                ]
                            }}
                            uploadPreset={cloudPresetName}
                            onSuccess={handleUploadSuccess}
                            onError={handleUploadError}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={disabled || isUploading}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </CldUploadButton>
                        
                        {/* Bouton de suppression */}
                        <button
                            onClick={removeImage}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                            disabled={disabled || isUploading}
                            title="Supprimer l'image"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Indication du statut de téléchargement */}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
                            <div className="text-center text-white">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2 mx-auto"></div>
                                <p className="text-sm">Téléchargement en cours...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}