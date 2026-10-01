import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function AgeGate({ onContinue }) {
  const [denied, setDenied] = useState(() => sessionStorage.getItem('ronkws_age_denied') === 'true');

  const denyAccess = () => {
    sessionStorage.setItem('ronkws_age_denied', 'true');
    setDenied(true);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#14121d] px-5 py-10 text-white">
      <div className="glow-bg-1" aria-hidden="true" />
      <div className="glow-bg-2" aria-hidden="true" />
      <section className="relative z-10 w-full max-w-md rounded-[28px] border border-white/10 bg-[#181622]/90 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/logo/ronkws-glass-mark.svg" alt="Ronkws" className="mb-5 h-16 w-14 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-purple-300">Ronkws Streaming Hub</p>
          <h1 className="text-2xl font-extrabold">{denied ? 'Access unavailable' : 'Before you enter'}</h1>
        </div>

        {denied ? (
          <div className="text-center">
            <p className="mb-7 text-sm leading-6 text-zinc-300">
              You indicated that you are under 18. You can’t continue to Ronkws.
            </p>
            <button
              type="button"
              onClick={() => window.close()}
              className="w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/5"
            >
              Exit
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7 flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-purple-300" size={22} aria-hidden="true" />
              <p className="text-sm leading-6 text-zinc-300">
                This service is intended for adults. Please confirm that you are 18 years of age or older.
              </p>
            </div>
            <button
              type="button"
              onClick={onContinue}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(124,58,237,0.32)] transition-colors hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
            >
              I’m 18 or older, continue
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={denyAccess}
              className="mt-3 w-full rounded-full px-5 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              I’m under 18, exit
            </button>
          </>
        )}
      </section>
    </main>
  );
}