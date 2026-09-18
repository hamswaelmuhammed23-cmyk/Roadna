import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Sparkles, Share2, BrainCircuit, Zap, Anchor, Star, Landmark } from 'lucide-react';

import { mockLiveActivities as ACTIVITIES, mockLiveTravelers as TRAVELERS } from '../data/mockData';

function TypingText({ text }) {
  const letters = text.split("");
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.02 }
        }
      }}
    >
      {letters.map((char, i) => (
        <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function LiveTravelPulse() {
  const [activityIdx, setActivityIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivityIdx((prev) => (prev + 1) % ACTIVITIES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const particles = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    dur: 6 + Math.random() * 6,
    delay: Math.random() * 5
  })), []);

  return (
    <div className="relative w-full max-w-xl h-[240px] mt-8 overflow-hidden rounded-[40px] bg-white/[0.04] backdrop-blur-[1px] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] group">
      
      {/* ── Background Noise & Scan Line ── */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-soft-light" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10l5 5m50 50l5 5M10 70l5-5m50-50l5-5' stroke='%232F80ED' stroke-opacity='0.2' fill='none'/%3E%3C/svg%3E")` }} />
      


      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-blue-400 rounded-full blur-[1px]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.3, 0],
            y: [0, -40, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {TRAVELERS.map((t) => (
        <motion.div
          key={t.id}
          className="absolute rounded-full border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden z-20"
          style={{ 
            left: `${t.x}%`, 
            top: `${t.y}%`, 
            width: t.size, 
            height: t.size,
            filter: `blur(${t.blur}px)`
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: t.opacity,
            scale: 1,
            y: [0, -10, 0],
            x: [0, 5, 0]
          }}
          transition={{
            opacity: { duration: 1.5, delay: t.delay },
            scale: { duration: 1.5, delay: t.delay },
            y: { duration: 6 + t.id, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 8 + t.id, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <img src={t.img} alt="Traveler" className="w-full h-full object-cover" />
        </motion.div>
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-30 w-full max-w-[360px] px-2">
        <motion.div
          className="absolute inset-0 bg-blue-500/5 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activityIdx}
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ 
              opacity: 1, 
              y: [0, -8, 0], 
              scale: 1,
              transition: {
                opacity: { duration: 1.2, delay: 0.3 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 1.2, delay: 0.3 }
              }
            }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.5 } }}
            className="relative bg-white/95 backdrop-blur-3xl rounded-[32px] p-5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.12)] border border-white/90 flex flex-col gap-3"
          >
            {/* AI Analysis Floating Badge */}
            <motion.div 
              className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-2xl border border-white/10 z-50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
            >
               <BrainCircuit size={12} className="text-blue-400 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[1px]">AI Matching:</span>
               <motion.span 
                 className="text-[10px] font-black text-blue-400"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1.5 }}
               >
                 {ACTIVITIES[activityIdx].match}%
               </motion.span>
            </motion.div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50/50 flex items-center justify-center shadow-inner border border-blue-100/50">
                  {ACTIVITIES[activityIdx].icon}
                </div>
                <div>
                  <h4 className="text-slate-900 font-black text-[13px] tracking-tight leading-none">
                    {ACTIVITIES[activityIdx].user}
                  </h4>
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[1px] flex items-center gap-1.5 mt-1">
                    <Clock size={9} className="text-blue-400" /> {ACTIVITIES[activityIdx].time}
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 bg-blue-50/40 text-blue-600 rounded-full text-[7px] font-black uppercase tracking-[1px] flex items-center gap-1 border border-blue-100/10">
                <Zap size={8} className="fill-blue-500 text-blue-500" /> Live
              </div>
            </div>

            <div className="text-slate-800 text-[13px] font-medium leading-snug tracking-tight">
              <span className="font-black text-slate-950">{ACTIVITIES[activityIdx].user}</span>{" "}
              <span className="text-slate-500">
                 <TypingText key={activityIdx} text={ACTIVITIES[activityIdx].action} />
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-50/50">
              <div className="flex items-center gap-2 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                <Users size={10} className="text-blue-300" />
                <span>{ACTIVITIES[activityIdx].count} active buddies</span>
              </div>
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=bud${i + activityIdx}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <motion.div 
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg"
              animate={{ rotate: [12, -5, 12] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
               <Sparkles size={14} className="text-white" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-8 flex items-center gap-2 opacity-40">
        <Share2 size={11} className="text-blue-400" />
        <span className="text-slate-400 text-[7px] font-black uppercase tracking-[4px]">AI Neural Network</span>
      </div>
    </div>
  );
}
