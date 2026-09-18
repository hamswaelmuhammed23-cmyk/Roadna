/**
 * ExploreUserCard.jsx
 *
 * Displays a suggested travel buddy on the Explore page.
 * Shows name, country, interests, trip count and match percentage.
 *
 * Props:
 *   user       — { id, name, age, country, interests, photo, bio, matchPercent, tripsCount }
 *   onConnect  — callback when "View Profile" is clicked
 */

import { getMatchStyle, getFullMatchGradient } from '../../utils/matchUtils';

function MatchRing({ percent }) {
  const style = getMatchStyle(percent);
  
  // Hard stops for clear "Tiered" journey
  const orange = "#f97316";
  const amber  = "#f59e0b";
  const sky    = "#0ea5e9";
  const emerald = "#10b981";
  const track  = "#f3f4f6";

  const fullGradient = `conic-gradient(
    ${orange} 0% 25%, 
    ${amber} 25% 50%, 
    ${sky} 50% 75%, 
    ${emerald} 75% 100%
  )`;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="relative group/ring">
        {/* Glow effect (Follows the pie) */}
        <div 
          className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover/ring:opacity-100 transition-opacity duration-500 ${percent > 70 ? 'animate-[glow-pulse_3s_infinite]' : ''}`}
          style={{ 
            background: fullGradient,
            WebkitMask: `conic-gradient(black ${percent}%, transparent ${percent}%)`,
            mask: `conic-gradient(black ${percent}%, transparent ${percent}%)`
          }}
        />
        
        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm border-2 border-white overflow-hidden transition-all duration-700 z-10"
          style={{ 
            background: `linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 60%), ${fullGradient}`,
            WebkitMask: `conic-gradient(black ${percent}%, transparent ${percent}%)`,
            mask: `conic-gradient(black ${percent}%, transparent ${percent}%)`
          }}
        >
          {/* Cinematic Shimmer for high percentages */}
          {percent > 70 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer-slide_2.5s_infinite] pointer-events-none z-10" />
          )}

          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-800 text-[10px] font-black tracking-tighter shadow-inner relative z-20">
            {percent}%
          </div>
        </div>

        {/* Gray Track for remaining part */}
        <div className="absolute inset-0 rounded-full border-2 border-[#f3f4f6] z-0" />
      </div>
      
      <div className="flex flex-col items-end leading-none">
        <span className={`text-[9px] font-black uppercase tracking-wider ${style.textClass} transition-colors duration-500`}>
          {style.label}
        </span>
        {style.highlyCompatible && (
          <span className="text-[8px] font-bold text-emerald-500 animate-pulse mt-0.5">
            Highly Compatible ✨
          </span>
        )}
      </div>
    </div>
  );
}

export default function ExploreUserCard({ user, onConnect, onChat }) {
  const {
    name,
    age,
    country,
    interests = [],
    photo,
    bio,
    matchPercent = 0,
    tripsCount,
  } = user

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Top strip */}
      <div className="h-16 bg-gradient-to-r from-[#2F80ED] to-[#4CB8E7] relative" />

      {/* Avatar — overlaps the strip */}
      <div className="relative px-5 pb-4 flex flex-col flex-1 -mt-8">
        <div className="flex items-end justify-between mb-3">
          {/* Photo */}
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}
            <div
              className="w-full h-full bg-gradient-to-br from-[#4CB8E7] to-[#2F80ED] text-white text-lg font-bold items-center justify-center"
              style={{ display: photo ? "none" : "flex" }}
            >
              {initials}
            </div>
          </div>

          {/* Match ring */}
          <MatchRing percent={matchPercent} />
        </div>

        {/* Name + info */}
        <h3 className="font-bold text-gray-800 text-sm">
          {name}
          {age && <span className="font-normal text-gray-400">, {age}</span>}
        </h3>
        <p className="text-xs text-gray-400 mb-1">📍 {country}</p>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{bio}</p>
        )}

        {/* Trips count */}
        {tripsCount !== undefined && (
          <p className="text-xs text-[#2F80ED] font-medium mb-3">
            ✈️ {tripsCount} trips completed
          </p>
        )}

        {/* Interests */}
        <div className="flex flex-wrap gap-1 mb-4">
          {interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="text-xs px-2 py-0.5 bg-[#f0f7ff] text-[#2F80ED] rounded-full font-medium"
            >
              {interest}
            </span>
          ))}
          {interests.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full">
              +{interests.length - 3}
            </span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="mt-auto flex gap-2">
          <button
            id={`view-profile-${user.id}`}
            onClick={onConnect}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-[#2F80ED] text-sm font-semibold py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            View Profile
          </button>
          <button
            id={`chat-user-${user.id}`}
            onClick={onChat}
            className="flex-[1.2] bg-gradient-to-r from-[#2F80ED] to-[#4CB8E7] hover:from-[#2563eb] hover:to-[#2F80ED] text-white text-sm font-semibold py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 3c5.523 0 10 4.029 10 9a8.91 8.91 0 01-2.932 6.576C19.782 20.844 20.5 22 20.5 22s-2.071-.462-4.103-1.077A9.852 9.852 0 0112 21c-5.523 0-10-4.029-10-9s4.477-9 10-9z"/></svg>
            Chat
          </button>
        </div>
      </div>
    </div>
  )
}
