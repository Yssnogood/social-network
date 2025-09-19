'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Smile } from 'lucide-react'
import { EmojiClickData } from 'emoji-picker-react'

// Import dynamique pour éviter les erreurs SSR
const EmojiPickerComponent = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 animate-pulse bg-zinc-700 rounded"></div>
})

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fermer le picker si on clique dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji)
    setShowPicker(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
        title="Ajouter un emoji"
      >
        <Smile size={20} />
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-12 left-0 z-50"
          style={{ transform: 'translateY(-8px)' }}
        >
          <EmojiPickerComponent
            onEmojiClick={handleEmojiClick}
            theme={'dark' as any}
            searchDisabled={false}
            skinTonePickerLocation={'SEARCH' as any}
            previewConfig={{
              showPreview: false
            }}
            width={300}
            height={400}
          />
        </div>
      )}
    </div>
  )
}