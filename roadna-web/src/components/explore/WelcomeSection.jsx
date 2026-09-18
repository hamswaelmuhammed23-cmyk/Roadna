/**
 * WelcomeSection.jsx
 *
 * Top hero shown on the Explore page.
 * Greets the user by name and displays their interest chips.
 * The floating plane SVG uses a CSS keyframe animation injected inline.
 *
 * Props:
 *   user — { name: string, interests: string[] }
 */
import { Link } from 'react-router-dom'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { CategoryIcon } from '../../utils/categoryIcons'

const INTEREST_COLORS = {
  Documentary:   { bg: "bg-emerald-100",  text: "text-emerald-700" },
  Medical:       { bg: "bg-cyan-100",     text: "text-cyan-700"    },
  Adventure:     { bg: "bg-orange-100",   text: "text-orange-700"  },
  Culture:       { bg: "bg-purple-100",   text: "text-purple-700"  },
  Entertainment: { bg: "bg-pink-100",     text: "text-pink-700"    },
  Business:      { bg: "bg-amber-100",    text: "text-amber-700"   },
  Sport:         { bg: "bg-emerald-100",  text: "text-emerald-700" },
  Education:     { bg: "bg-blue-100",     text: "text-blue-700"    },
  Music:         { bg: "bg-indigo-100",   text: "text-indigo-700"  },
  Comedy:        { bg: "bg-yellow-100",   text: "text-yellow-700"  },
  Arts:          { bg: "bg-rose-100",     text: "text-rose-700"    },
  'Trade Shows': { bg: "bg-slate-100",    text: "text-slate-700"   },
  Technology:    { bg: "bg-blue-100",     text: "text-blue-700"    },
  Dance:         { bg: "bg-violet-100",   text: "text-violet-700"  },
}

function getChipStyle(interest) {
  return (
    INTEREST_COLORS[interest] || {
      bg: "bg-blue-100",
      text: "text-blue-700",
    }
  )
}

export default function WelcomeSection({ user }) {
  const name      = user?.name      || "Traveler"
  const interests = user?.interests || []
  const handEmojiImage = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f44b.png"

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F80ED] via-[#4CB8E7] to-[#6dd5fa] px-8 py-12 md:py-14 shadow-xl">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* ── Left copy ── */}
        <div className="flex-1">
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3 flex items-center gap-2">
            Welcome back, {name}
            <Link to="/how-it-works" className="inline-flex hover:scale-110 transition-transform" title="How it works">
              <img src={handEmojiImage} alt="Wave icon" className="w-8 h-8" />
            </Link>
          </h1>

          <p className="text-white/85 text-base md:text-lg mb-6 max-w-md">
            Based on your interests, we found the <span className="font-semibold text-white">best matches</span> for you ✨
          </p>

          {/* Interest chips */}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => {
                const { bg, text } = getChipStyle(interest)
                return (
                  <span
                    key={interest}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full ${bg} ${text} shadow-sm hover:scale-105 transition-transform cursor-default`}
                  >
                    <CategoryIcon category={interest} className="w-3.5 h-3.5" />
                    {interest}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right illustration ── */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="relative w-48 h-48 md:w-56 md:h-56">
            {/* Glowing circle */}
            <div className="absolute inset-0 rounded-full bg-white/15 backdrop-blur-sm border border-white/25" />

            {/* New Lottie Paper Plane */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <DotLottieReact src="/planeAnimation.json" loop autoplay />
            </div>

            {/* Orbiting dots */}
            <div
              className="absolute top-4 right-4 w-3 h-3 rounded-full bg-yellow-300 shadow-lg"
              style={{ animation: "floatPlane 2.5s ease-in-out infinite 0.5s" }}
            />
            <div
              className="absolute bottom-6 left-5 w-2 h-2 rounded-full bg-pink-300 shadow"
              style={{ animation: "floatPlane 3.5s ease-in-out infinite 1s" }}
            />
            <div
              className="absolute top-1/2 left-2 w-1.5 h-1.5 rounded-full bg-white/60"
              style={{ animation: "floatPlane 4s ease-in-out infinite 0.2s" }}
            />
          </div>
        </div>
      </div>

      {/* Keyframe — injected once per page via a <style> tag */}
    </section>
  )
}
