import React from 'react';

export default function InDeMolenLogo({ className = "w-24 h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 500 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer oval frame */}
      <ellipse cx="250" cy="150" rx="240" ry="140" stroke="currentColor" strokeWidth="8" />
      <ellipse cx="250" cy="150" rx="230" ry="130" stroke="currentColor" strokeWidth="2" />
      
      {/* Small diamond accents */}
      <path d="M 85 105 L 93 97 L 101 105 L 93 113 Z" fill="currentColor" />
      <path d="M 395 105 L 403 97 L 411 105 L 403 113 Z" fill="currentColor" />

      {/* "In De" text upper left */}
      <text 
        x="130" 
        y="95" 
        fontFamily="Georgia, serif" 
        fontWeight="bold" 
        fontSize="44" 
        fill="currentColor"
        letterSpacing="2"
      >
        In De
      </text>

      {/* "Anno 1873" text upper right */}
      <g transform="translate(320, 55)">
        <text x="0" y="22" fontFamily="Georgia, serif" fontWeight="bold" fontSize="24" fill="currentColor">Anno</text>
        <text x="0" y="48" fontFamily="Georgia, serif" fontWeight="bold" fontSize="24" fill="currentColor">1873</text>
      </g>

      {/* Giant "molen" stylized text center */}
      <text 
        x="50" 
        y="215" 
        fontFamily="'Old English Text MT', 'Fraktur', 'UnifrakturMaguntia', 'Georgia', serif" 
        fontWeight="900" 
        fontSize="115" 
        fill="currentColor"
        letterSpacing="6"
      >
        molen
      </text>

      {/* "eet-staminee" styled subtext */}
      <text 
        x="250" 
        y="255" 
        fontFamily="sans-serif" 
        fontWeight="bold" 
        fontSize="28" 
        fill="currentColor" 
        textAnchor="middle"
        letterSpacing="4"
      >
        EET-STAMINÉE
      </text>

      {/* "Bierbeek" styled location */}
      <text 
        x="250" 
        y="285" 
        fontFamily="'Old English Text MT', 'Fraktur', 'Georgia', serif" 
        fontWeight="bold" 
        fontSize="24" 
        fill="currentColor" 
        textAnchor="middle"
        letterSpacing="3"
      >
        Bierbeek
      </text>
    </svg>
  );
}
