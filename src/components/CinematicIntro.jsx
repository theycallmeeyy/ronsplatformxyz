import React, { useEffect, useState, useRef } from 'react';

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState('black'); // 'black' -> 'reveal' -> 'sweep' -> 'hold' -> 'fade'

  useEffect(() => {
    // Phase 1: Black screen (0.5s pause)
    const timer1 = setTimeout(() => {
      setPhase('reveal');
    }, 500);

    // Phase 2: Red light sweep across logo (1.2s after reveal starts => 1.7s total)
    const timer2 = setTimeout(() => {
      setPhase('sweep');
    }, 1700);

    // Phase 3: Hold logo & brighten (0.8s after sweep starts => 2.5s total)
    const timer3 = setTimeout(() => {
      setPhase('hold');
    }, 2500);

    // Phase 4: Fade to Home screen (1.0s hold => 3.5s total)
    const timer4 = setTimeout(() => {
      setPhase('fade');
    }, 3500);

    // Phase 5: Complete (0.5s fade out => 4.0s total)
    const timer5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div
        className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 overflow-hidden select-none ${
          phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
      {/* Background Subtle Starfield Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black" />

      {/* Main Logo Reveal Container */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-[1200ms] ease-out transform ${
          phase === 'black'
            ? 'opacity-0 scale-[0.85] blur-md'
            : phase === 'reveal'
            ? 'opacity-100 scale-100 blur-0'
            : phase === 'sweep' || phase === 'hold'
            ? 'opacity-100 scale-100 blur-0'
            : 'opacity-0 scale-105'
        }`}
      >
        {/* Animated Ronkws Logo Icon Box */}
        <div className="relative group mb-6">
          {/* Soft White / Purple Glow Effect */}
          <div
            className={`absolute -inset-4 rounded-3xl transition-all duration-1000 blur-2xl ${
              phase === 'reveal'
                ? 'bg-white/40 opacity-100'
                : phase === 'sweep'
                ? 'bg-rose-500/50 opacity-90'
                : phase === 'hold'
                ? 'bg-purple-600/30 opacity-70'
                : 'opacity-0'
            }`}
          />

          {/* Logo Card */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center overflow-visible">
            <img src="/logo/ronkws-glass-mark.svg" alt="Ronkws" className="relative z-10 h-[88%] w-[76%] object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.3)]" />

            {/* Red Light Sweep Beam (Phase 2: sweep) */}
            {(phase === 'sweep' || phase === 'hold') && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full animate-red-sweep bg-gradient-to-r from-transparent via-rose-500/80 to-transparent shadow-[0_0_30px_#f43f5e]" />
              </div>
            )}
          </div>
        </div>

        {/* Brand Typography */}
        <div className="text-center relative">
          <h1
            className={`font-black text-4xl md:text-6xl tracking-tighter transition-all duration-700 ${
              phase === 'hold' ? 'brightness-125 text-white' : 'text-purple-200'
            }`}
          >
            RONKWS
          </h1>
          <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-purple-400/80 mt-2">
            STREAMING HUB
          </p>

          {/* Tagline below animated logo */}
          {(phase === 'hold' || phase === 'fade') && (
            <p className={`text-sm md:text-base text-zinc-300 mt-6 transition-all duration-500 ${
              phase === 'fade' ? 'opacity-0' : 'opacity-100'
            }`}>
              Your streaming everything starts here.
            </p>
          )}

          {/* Red light beam overlay on text during sweep */}
          {(phase === 'sweep' || phase === 'hold') && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-full animate-red-sweep bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
