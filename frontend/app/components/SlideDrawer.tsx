'use client';

import React from 'react';

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction: 'left' | 'right';
  width?: string;
  children: React.ReactNode;
  title?: string;
  zIndex?: number;
}

export default function SlideDrawer({
  isOpen,
  onClose,
  direction,
  width = '400px',
  children,
  title,
  zIndex = 30
}: SlideDrawerProps) {
  // Ne pas rendre le composant du tout s'il n'est pas ouvert
  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed ${direction === 'left' 
          ? 'top-12 left-64 xl:left-80 h-1/2' 
          : 'bottom-0 right-64 xl:right-80 h-1/2'
        }
        bg-gray-800 border-gray-700 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${direction === 'left' ? 'border-r' : 'border-l'}
        translate-x-0
        hidden lg:block
      `}
      style={{
        width,
        zIndex
      }}
    >
      {/* Header avec titre et bouton de fermeture */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
        {title && (
          <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
        )}
        <button
          onClick={onClose}
          className="ml-auto p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Fermer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenu du drawer */}
      <div className="flex-1 h-[calc(100%-4rem)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}