import React from 'react';

interface InDeMolenLogoProps {
  className?: string;
  transparent?: boolean;
}

export default function InDeMolenLogo({ 
  className = "w-28 h-16", 
  transparent = false 
}: InDeMolenLogoProps) {
  const logoSrc = transparent 
    ? "/in-de-molen-logo-transparent.png" 
    : "/in-de-molen-logo.png";

  return (
    <img 
      src={logoSrc} 
      alt="Eet-staminée In De Molen Bierbeek - Anno 1873" 
      className={`object-contain select-none pointer-events-none ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
