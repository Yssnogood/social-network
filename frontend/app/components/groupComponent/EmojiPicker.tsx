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
  const [pickerHeight, setPickerHeight] = useState(400)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Calculer la hauteur du picker selon la taille d'écran
  useEffect(() => {
    const updatePickerHeight = () => {
      const height = window.innerHeight
      // Utiliser au moins 50% de la hauteur d'écran, avec minimum 400px et maximum 600px
      const optimalHeight = Math.min(600, Math.max(400, height * 0.5))
      setPickerHeight(optimalHeight)
    }
    
    updatePickerHeight()
    window.addEventListener('resize', updatePickerHeight)
    
    return () => window.removeEventListener('resize', updatePickerHeight)
  }, [])

  // Fonction pour scroller vers la zone de saisie
  const scrollToMessageInput = () => {
    if (!buttonRef.current) return

    // Chercher la zone de saisie des messages (textarea)
    let messageInput = buttonRef.current.closest('div[class*="mt-4"]')?.querySelector('textarea')
    
    // Si on ne trouve pas avec cette méthode, chercher plus largement
    if (!messageInput) {
      const textareas = document.querySelectorAll('textarea[placeholder*="message"], textarea[placeholder*="Message"]')
      if (textareas.length > 0) {
        messageInput = textareas[textareas.length - 1] as HTMLTextAreaElement
      }
    }
    
    if (messageInput) {
      // Calculer la position où on veut que la zone de saisie apparaisse
      let headerOffset = 100 // Offset par défaut
      
      // Essayer de détecter la hauteur du header automatiquement
      const header = document.querySelector('header, nav, [role="banner"]')
      if (header) {
        headerOffset = header.getBoundingClientRect().height + 20 // +20px de marge
      }
      
      const elementRect = messageInput.getBoundingClientRect()
      const scrollPosition = window.pageYOffset + elementRect.top - headerOffset
      
      // S'assurer qu'on ne scrolle pas en dessous de 0
      const finalScrollPosition = Math.max(0, scrollPosition)
      
      // Scroll immédiat pour éviter les double-scrolls
      window.scrollTo({
        top: finalScrollPosition,
        behavior: 'smooth'
      })
    }
  }

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
      
      // Déclencher le scroll immédiatement quand le picker s'ouvre
      scrollToMessageInput()
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
          className="fixed left-2 right-2 bottom-16 z-50 max-w-md mx-auto"
        >
          <div className="w-full bg-zinc-800 rounded-lg border border-zinc-700 shadow-2xl">
            <EmojiPickerComponent
              onEmojiClick={handleEmojiClick}
              theme={'dark' as any}
              searchDisabled={false}
              skinTonePickerLocation={'SEARCH' as any}
              previewConfig={{
                showPreview: false
              }}
              width={'100%' as any}
              height={pickerHeight}
            />
          </div>
        </div>
      )}
    </div>
  )
}