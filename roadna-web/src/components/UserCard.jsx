/**
 * @deprecated
 * This component is NOT used in the Explore page.
 * The Explore page uses ExploreUserCard.jsx instead.
 * UserCard is reserved for a future /users or /discover page.
 * Do not delete - planned for reuse.
 */

/**
 * UserCard.jsx
 *
 * Displays a single traveler's profile in a card.
 * Used in the Explore page grid.
 *
 * Props:
 *   user       — { name, age, country, interests, photo, bio, matchPercent }
 *   onConnect  — callback when "Connect" button is clicked
 */
export default function UserCard({ user, onConnect }) {
  const { name, age, country, interests = [], photo, bio, matchPercent } = user

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
      {/* Photo */}
      <div className="h-44 overflow-hidden bg-gray-100">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover"
          onError={e => {
            e.target.src = 'https://via.placeholder.com/400x176?text=No+Photo'
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name + location */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{name}, {age}</h3>
            <p className="text-xs text-gray-400">📍 {country}</p>
          </div>

          {/* Match badge */}
          {matchPercent !== undefined && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                matchPercent >= 60
                  ? 'bg-green-50 text-green-600'
                  : matchPercent >= 30
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              {matchPercent}% match
            </span>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2">{bio}</p>
        )}

        {/* Interests */}
        <div className="flex flex-wrap gap-1 mb-4">
          {interests.slice(0, 3).map(i => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full"
            >
              {i}
            </span>
          ))}
          {interests.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
              +{interests.length - 3}
            </span>
          )}
        </div>

        {/* Connect button */}
        <button
          id={`connect-${name.replace(/\s+/g, '-').toLowerCase()}`}
          onClick={onConnect}
          className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          Connect
        </button>
      </div>
    </div>
  )
}
