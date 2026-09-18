import React from 'react'
import { 
  Video, 
  Activity, 
  Clapperboard, 
  Briefcase, 
  Landmark, 
  Trophy, 
  GraduationCap, 
  Music, 
  Smile, 
  Palette, 
  Handshake, 
  Monitor, 
  Mountain, 
  Music2,
  Tag
} from 'lucide-react'

const CATEGORY_ICONS = {
  'Documentary': Video,
  'Medical': Activity,
  'Entertainment': Clapperboard,
  'Business': Briefcase,
  'Culture': Landmark,
  'Sport': Trophy,
  'Education': GraduationCap,
  'Music': Music,
  'Comedy': Smile,
  'Arts': Palette,
  'Trade Shows': Handshake,
  'Technology': Monitor,
  'Adventure': Mountain,
  'Dance': Music2
}

/**
 * Helper component to render the correct icon for a category.
 */
export const CategoryIcon = ({ category, className = "w-4 h-4" }) => {
  const Icon = CATEGORY_ICONS[category] || Tag
  return <Icon className={className} />
}
