/**
 * matchUtils.js
 * 
 * Logic for dynamic match percentage styling across the platform.
 * Provides color tiers, labels, and styles for visual feedback.
 */

export const getMatchStyle = (percentage) => {
  const p = Math.min(100, Math.max(0, percentage));

  if (p <= 25) {
    return {
      color: "#f97316", // Orange
      lightColor: "#fdba74", 
      bgClass: "bg-orange-50",
      textClass: "text-orange-600",
      borderClass: "border-orange-200",
      glow: "0 0 8px rgba(249, 115, 22, 0.2)",
      glowIntensity: 0.2,
      label: "Potential match",
      highlyCompatible: false
    };
  } else if (p <= 50) {
    return {
      color: "#f59e0b", // Amber
      lightColor: "#fcd34d",
      bgClass: "bg-amber-50",
      textClass: "text-amber-600",
      borderClass: "border-amber-200",
      glow: "0 0 12px rgba(245, 158, 11, 0.3)",
      glowIntensity: 0.4,
      label: "Good match",
      highlyCompatible: false
    };
  } else if (p <= 75) {
    return {
      color: "#0ea5e9", // Sky Blue
      lightColor: "#7dd3fc",
      bgClass: "bg-sky-50",
      textClass: "text-sky-600",
      borderClass: "border-sky-200",
      glow: "0 0 15px rgba(14, 165, 233, 0.4)",
      glowIntensity: 0.6,
      label: "Great match!",
      highlyCompatible: false
    };
  } else {
    return {
      color: "#10b981", // Emerald
      lightColor: "#6ee7b7",
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-600",
      borderClass: "border-emerald-200",
      gradientClass: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      glow: "0 0 20px rgba(16, 185, 129, 0.5)",
      glowIntensity: 0.9,
      label: "Perfect Match!",
      highlyCompatible: p >= 80
    };
  }
};

/**
 * Returns a conic gradient string that shows the full spectrum up to the percentage.
 */
export const getFullMatchGradient = (p, isLight = false) => {
  const orange = isLight ? "#fdba74" : "#f97316";
  const amber  = isLight ? "#fcd34d" : "#f59e0b";
  const sky    = isLight ? "#7dd3fc" : "#0ea5e9";
  const emerald = isLight ? "#6ee7b7" : "#10b981";
  const track  = isLight ? "rgba(255,255,255,0.15)" : "#f3f4f6";

  // Pure conic gradient for maximum clarity
  return `conic-gradient(
    ${orange} 0%, 
    ${amber} 25%, 
    ${sky} 50%, 
    ${emerald} 75%, 
    ${emerald} ${p}%, 
    ${track} ${p}%
  )`;
};
