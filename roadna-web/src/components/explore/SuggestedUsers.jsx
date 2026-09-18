/**
 * SuggestedUsers.jsx
 *
 * Displays a grid of travel buddies matched by shared interests.
 *
 * Props:
 *   users      — matched user array (from getMatchedUsers helper)
 *   onConnect  — (userId) => void
 */

import ExploreUserCard from './ExploreUserCard'
import SectionHeader from './SectionHeader'

export default function SuggestedUsers({ users = [], onConnect, onChat }) {
  if (!users.length) return null

  return (
    <section id="suggested-users" className="mb-12">
      <SectionHeader
        title="People Like You"
        subtitle="People who share your complete profile interests"
        iconUrl="https://api.iconify.design/solar/users-group-rounded-bold-duotone.svg?color=%232F80ED"
      />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => (
          <ExploreUserCard
            key={user.id}
            user={user}
            onConnect={() => onConnect?.(user.id)}
            onChat={() => onChat?.(user.id)}
          />
        ))}
      </div>
    </section>
  )
}
