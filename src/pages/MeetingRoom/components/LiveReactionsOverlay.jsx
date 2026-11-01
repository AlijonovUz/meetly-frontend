import React from 'react'
import { getAppleEmojiUrlFromChar } from '../data/stickerData'

export default function LiveReactionsOverlay({ activeReactions = [] }) {
  if (!activeReactions || activeReactions.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      <div className="absolute bottom-24 sm:bottom-28 left-6 sm:left-12 pointer-events-none">
        {activeReactions.map((reaction) => {
          const emojiUrl = getAppleEmojiUrlFromChar(reaction.emojiCode || reaction.emoji)
          const dx = reaction.driftX || 25
          const altDx = -Math.round(dx * 0.7)

          return (
            <div
              key={reaction.id}
              className="absolute bottom-0 animate-reaction-float pointer-events-none select-none flex flex-col items-center justify-center"
              style={{
                left: `${reaction.startX || 0}px`,
                '--drift-x': `${dx}px`,
                '--drift-alt': `${altDx}px`,
                animationDuration: `${reaction.duration || 1.8}s`,
              }}
            >
              {emojiUrl ? (
                <img
                  src={emojiUrl}
                  alt={reaction.emoji}
                  className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow-xl select-none pointer-events-none shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'inline-block'
                    }
                  }}
                />
              ) : null}
              <span
                style={{ display: emojiUrl ? 'none' : 'inline-block' }}
                className="text-3xl sm:text-4xl filter drop-shadow-xl select-none leading-none shrink-0"
              >
                {reaction.emoji}
              </span>

              {reaction.senderName && (
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 dark:bg-black/80 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium tracking-tight shadow-sm max-w-[130px] truncate select-none border border-white/10 text-center">
                  {reaction.senderName}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
