/**
 * ChatCTA.jsx
 *
 * Full-width call-to-action section prompting users to chat with buddies.
 *
 * Props:
 *   onGoToMessages — () => void — navigate to /chat
 */

export default function ChatCTA({ onGoToMessages }) {
  return (
    <section id="chat-cta" className="mb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-8 py-12 text-center shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-[#4CB8E7]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Avatars row */}
        <div className="relative z-10 flex justify-center -space-x-3 mb-5">
          {[
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
          ].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="buddy"
              className="w-10 h-10 rounded-full border-2 border-[#0f3460] object-cover shadow"
            />
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-[#0f3460] bg-[#4CB8E7] flex items-center justify-center text-white text-xs font-bold shadow">
            +9
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Start chatting with your travel buddies 💬
          </h2>
          <p className="text-white/60 text-sm mb-7 max-w-md mx-auto">
            Your matches are waiting. Start a conversation and plan your next adventure together.
          </p>

          <button
            id="cta-go-to-messages"
            onClick={onGoToMessages}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4CB8E7] to-[#2F80ED] hover:from-[#2F80ED] hover:to-[#4CB8E7] text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-[#4CB8E7]/40 hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Go to Messages
          </button>
        </div>
      </div>
    </section>
  )
}
