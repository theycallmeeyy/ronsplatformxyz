import React from 'react';

export default function LogoMark({ size = 48, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoMain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="35%" stopColor="#a855f7" />
          <stop offset="70%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="logoAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <radialGradient id="logoGlow" cx="0.5" cy="0.5" r="0.8">
          <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="54" fill="url(#logoGlow)" />

      <path
        d="M26 24 C36 14 62 12 78 28 C86 36 86 52 78 62 C68 74 54 78 44 78 C36 78 32 70 36 62 C40 54 48 44 58 42 C72 38 82 48 78 60 C74 72 60 84 50 92 C42 98 28 110 22 108"
        fill="url(#logoMain)"
      />

      <path
        d="M38 56 C48 46 64 42 74 50 C82 56 82 68 74 76 C68 82 56 88 46 96"
        stroke="url(#logoAccent)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M64 42 C74 34 84 36 86 48 C88 62 78 72 66 74"
        stroke="#f3e8ff"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M44 80 C52 70 66 62 74 70"
        stroke="#ede9fe"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
