/**
 * PeopleLikeYou.jsx
 *
 * Renders a grid of user cards for people with similar interests.
 * Each card shows:
 *   - Blue gradient header strip with avatar overlapping it
 *   - Name, age, location
 *   - Bio
 *   - Trips completed
 *   - Shared interest tags (highlighted)
 *   - Real match percentage ring (calculated from shared interests)
 *   - View Profile + Chat buttons
 *
 * Props:
 *   users          – array from getMatchedUsers() — each has matchPercent + sharedInterests
 *   currentUser    – the logged-in user (for computing shared interests)
 *   onViewProfile  – (userId) => void
 *   onChat         – (userId) => void
 */

/* ── Match ring (conic-gradient donut) ───────────────────────── */
import { getMatchStyle, getFullMatchGradient } from '../../utils/matchUtils';

function MatchRing({ percent }) {
  const style = getMatchStyle(percent);
  
  // Use a more robust gradient approach for clear color transitions
  const orange = "#f97316";
  const amber  = "#f59e0b";
  const sky    = "#0ea5e9";
  const emerald = "#10b981";
  const track  = "#f3f4f6";

  const fullGradient = `conic-gradient(
    ${orange} 0%, 
    ${amber} 25%, 
    ${sky} 50%, 
    ${emerald} 75%, 
    ${emerald} ${percent}%, 
    ${track} ${percent}%
  )`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-12 h-12 rounded-full shadow-lg border-2 border-white transition-all duration-700 overflow-hidden relative group/ring"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%), ${fullGradient}`,
          boxShadow: style.glow
        }}
      >
        {/* Cinematic Shimmer for high percentages */}
        {percent > 70 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer-slide_2s_infinite] pointer-events-none z-20" />
        )}

        <div className="w-full h-full rounded-full flex items-center justify-center bg-white m-1 shadow-inner relative z-30"
          style={{ width: 'calc(100% - 8px)', height: 'calc(100% - 8px)' }}>
          <span className={`text-[10px] font-black ${style.textClass}`}>{percent}%</span>
        </div>
      </div>
      <div className="flex flex-col items-center leading-none">
        <span className={`text-[9px] font-black uppercase tracking-wider ${style.textClass}`}>
          {style.label}
        </span>
        {style.highlyCompatible && (
          <span className="text-[8px] font-bold text-emerald-500 animate-pulse mt-0.5">Highly Compatible ✨</span>
        )}
      </div>
    </div>
  )
}

/* ── Cleaner ring using inline SVG ───────────────────────────── */
function MatchRingSVG({ percent, light = false, showLabel = true }) {
  const style = getMatchStyle(percent);
  const orange = light ? "#fdba74" : "#f97316";
  const amber  = light ? "#fcd34d" : "#f59e0b";
  const sky    = light ? "#7dd3fc" : "#0ea5e9";
  const emerald = light ? "#6ee7b7" : "#10b981";
  const track  = light ? "rgba(255,255,255,0.15)" : "#f3f4f6";

  // Hard stops for clear "Tiered" journey
  const fullGradient = `conic-gradient(
    ${orange} 0% 25%, 
    ${amber} 25% 50%, 
    ${sky} 50% 75%, 
    ${emerald} 75% 100%
  )`;

  return (
    <div className={`flex flex-col items-center gap-1 select-none ${light ? 'text-white' : ''}`}>
      <div className="relative w-12 h-12 group/ring">
        {/* Glow behind the ring */}
        <div 
          className={`absolute inset-0 rounded-full blur-md opacity-30 transition-all duration-700 ${percent > 70 ? 'animate-[glow-pulse_3s_infinite]' : ''}`}
          style={{ background: fullGradient, WebkitMask: `conic-gradient(black ${percent}%, transparent ${percent}%)`, mask: `conic-gradient(black ${percent}%, transparent ${percent}%)` }}
        />
        
        {/* The Gradient Ring with 3D lighting sheen */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-700 z-10"
          style={{ 
            background: `linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 60%), ${fullGradient}`,
            WebkitMask: `conic-gradient(black ${percent}%, transparent ${percent}%, transparent 100%), radial-gradient(transparent 58%, black 61%)`,
            mask: `conic-gradient(black ${percent}%, transparent ${percent}%, transparent 100%), radial-gradient(transparent 58%, black 61%)`,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in'
          }}
        >
          {/* Internal Shimmer overlay for high compatibility energy */}
          {percent > 50 && (
            <div 
              className="absolute inset-0 opacity-40 animate-[spin_8s_linear_infinite]"
              style={{ background: 'conic-gradient(transparent, rgba(255,255,255,0.9), transparent)' }}
            />
          )}
        </div>

        {/* Track (Remaining part) */}
        <div 
          className="absolute inset-0 rounded-full z-0 opacity-20"
          style={{ 
            border: '4px solid',
            borderColor: light ? 'white' : '#f3f4f6',
            WebkitMask: `conic-gradient(transparent ${percent}%, black ${percent}%)`,
            mask: `conic-gradient(transparent ${percent}%, black ${percent}%)`
          }}
        />

        {/* percentage text in centre */}
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black z-20 ${light ? 'text-white drop-shadow-md' : style.textClass}`}>
          {percent}%
        </span>
      </div>
      {showLabel && (
        <div className="flex flex-col items-center leading-none">
          <span className={`text-[9px] font-black uppercase tracking-wider whitespace-nowrap text-center ${light ? 'text-white drop-shadow-sm' : style.textClass}`}>
            {style.label}
          </span>
          {style.highlyCompatible && (
            <span className={`text-[8px] font-bold ${light ? 'text-emerald-300' : 'text-emerald-500'} animate-pulse mt-0.5`}>
              Highly Compatible ✨
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Single user card ────────────────────────────────────────── */
function UserCard({ user, sharedInterests, onViewProfile, onChat }) {
  const {
    id,
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
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Tags to display: shared interests first (highlighted), then rest
  const sharedSet  = new Set((sharedInterests || []).map((s) => s.toLowerCase()))
  const displayInterests = [
    ...interests.filter((i) => sharedSet.has(i.toLowerCase())),
    ...interests.filter((i) => !sharedSet.has(i.toLowerCase())),
  ].slice(0, 4)

  const style = getMatchStyle(matchPercent);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-sm">

      {/* Blue gradient top strip */}
      <div className="h-16 bg-gradient-to-r from-[#2F80ED] to-[#4CB8E7] relative flex-shrink-0">
        <div className="absolute top-2 right-3">
          <MatchRingSVG percent={matchPercent} light showLabel={false} />
        </div>
      </div>

      <div className="relative px-5 pb-5 flex flex-col flex-1 -mt-8">

        {/* Avatar + match ring row */}
        <div className="flex items-start justify-between mb-3">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
            ) : null}
            <div
              className="w-full h-full bg-gradient-to-br from-[#4CB8E7] to-[#2F80ED] text-white text-lg font-bold items-center justify-center"
              style={{ display: photo ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>

          {/* Match Label back in white area but in blue */}
          <div className="flex flex-col items-end mt-9 mr-[-8px]">
            <span className={`text-[9px] font-black uppercase tracking-wider ${style.textClass} whitespace-nowrap`}>
              {style.label}
            </span>
            {style.highlyCompatible && (
              <span className="text-[8px] font-bold text-emerald-500 animate-pulse mt-0.5">
                Highly Compatible ✨
              </span>
            )}
          </div>
        </div>

        {/* Name + age */}
        <h3 className="font-bold text-gray-800 text-sm leading-tight">
          {name}
          {age && <span className="font-normal text-gray-400">, {age}</span>}
        </h3>

        {/* Location */}
        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <span>📍</span>{country}
        </p>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{bio}</p>
        )}

        {/* Trips */}
        {tripsCount !== undefined && (
          <p className="text-xs text-[#2F80ED] font-semibold mb-3 flex items-center gap-1">
            ✈️ {tripsCount} trips completed
          </p>
        )}

        {/* Interest tags — shared ones highlighted */}
        <div className="flex flex-wrap gap-1 mb-4">
          {displayInterests.map((interest) => {
            const isShared = sharedSet.has(interest.toLowerCase())
            return (
              <span
                key={interest}
                className={[
                  'text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
                  isShared
                    ? 'bg-[#4CB8E7]/15 text-[#2F80ED] border border-[#4CB8E7]/30'
                    : 'bg-gray-100 text-gray-500',
                ].join(' ')}
              >
                {isShared && <span className="mr-0.5">✓</span>}
                {interest}
              </span>
            )
          })}
          {interests.length > 4 && (
            <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full">
              +{interests.length - 4}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto flex gap-2">
          <button
            id={`view-profile-${id}`}
            onClick={() => onViewProfile(id)}
            className="flex-1 bg-white hover:bg-gray-50 border-2 border-[#4CB8E7] text-[#2F80ED] text-xs font-bold py-2 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            View Profile
          </button>
          <button
            id={`chat-user-${id}`}
            onClick={() => onChat(id)}
            className="flex-[1.2] bg-gradient-to-r from-[#2F80ED] to-[#4CB8E7] hover:from-[#2563eb] hover:to-[#2F80ED] text-white text-xs font-bold py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shadow-sm hover:shadow-md"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
              <path d="M12 3c5.523 0 10 4.029 10 9a8.91 8.91 0 01-2.932 6.576C19.782 20.844 20.5 22 20.5 22s-2.071-.462-4.103-1.077A9.852 9.852 0 0112 21c-5.523 0-10-4.029-10-9s4.477-9 10-9z"/>
            </svg>
            Chat
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Container ───────────────────────────────────────────────── */
export default function PeopleLikeYou({ users, currentUser, onViewProfile, onChat }) {
  const handleChat = (userId) => {
    if (onChat) return onChat(userId)
    console.log('Chat with user:', userId)
  }

  if (!users?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">🤝</p>
        <p className="text-sm">No matches found yet</p>
      </div>
    )
  }

  // Compute shared interests between current user and each match
  const myInterests = (currentUser?.interests || []).map((i) => i.toLowerCase())

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {users.map((user) => {
        const sharedInterests = (user.interests || []).filter((i) =>
          myInterests.includes(i.toLowerCase())
        )
        return (
          <UserCard
            key={user.id}
            user={user}
            sharedInterests={sharedInterests}
            onViewProfile={onViewProfile}
            onChat={handleChat}
          />
        )
      })}
    </div>
  )
}
