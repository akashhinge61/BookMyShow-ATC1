import React, { useState, useEffect } from 'react';

// Keep getFallbackPoster and getFallbackBanner exported just in case they are referenced elsewhere
export const getFallbackPoster = (category, title) => {
  const colors = {
    movies: ['#312e81', '#1e1b4b'], // indigo
    comedy: ['#78350f', '#451a03'], // amber
    concerts: ['#701a75', '#4a044e'], // fuchsia
    sports: ['#065f46', '#022c22'], // emerald
    plays: ['#991b1b', '#7f1d1d'], // red
    activities: ['#0369a1', '#0c4a6e'] // sky
  };
  const [bgStart, bgEnd] = colors[category] || ['#1f2937', '#111827'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgStart};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgEnd};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <path d="M 0,100 L 400,100 M 0,200 L 400,200 M 0,300 L 400,300 M 0,400 L 400,400 M 0,500 L 400,500 M 100,0 L 100,600 M 200,0 L 200,600 M 300,0 L 300,600" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    <circle cx="200" cy="220" r="70" fill="rgba(255,255,255,0.05)" />
    
    <text x="200" y="235" font-family="system-ui, sans-serif" font-size="50" font-weight="bold" fill="rgba(255,255,255,0.2)" text-anchor="middle">
      ${category ? category.substring(0, 2).toUpperCase() : 'BMS'}
    </text>
    
    <rect x="30" y="420" width="340" height="120" rx="10" fill="rgba(0,0,0,0.3)" />
    <text x="200" y="465" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${title ? (title.length > 25 ? title.substring(0, 22) + '...' : title) : 'Entertainment'}
    </text>
    <text x="200" y="505" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.5)" text-anchor="middle" letter-spacing="2">
      ${category ? category.toUpperCase() : 'EVENT'}
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const getFallbackBanner = (category, title) => {
  const colors = {
    movies: ['#312e81', '#1e1b4b'], // indigo
    comedy: ['#78350f', '#451a03'], // amber
    concerts: ['#701a75', '#4a044e'], // fuchsia
    sports: ['#065f46', '#022c22'], // emerald
    plays: ['#991b1b', '#7f1d1d'], // red
    activities: ['#0369a1', '#0c4a6e'] // sky
  };
  const [bgStart, bgEnd] = colors[category] || ['#1f2937', '#111827'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 450" width="100%" height="100%">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgStart};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgEnd};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <path d="M 0,75 L 1200,75 M 0,150 L 1200,150 M 0,225 L 1200,225 M 0,300 L 1200,300 M 0,375 L 1200,375 M 150,0 L 150,450 M 300,0 L 300,450 M 450,0 L 450,450 M 600,0 L 600,450 M 750,0 L 750,450 M 900,0 L 900,450 M 1050,0 L 1050,450" stroke="rgba(255,255,255,0.02)" stroke-width="1" />
    
    <text x="600" y="200" font-family="system-ui, sans-serif" font-size="80" font-weight="bold" fill="rgba(255,255,255,0.1)" text-anchor="middle">
      ${category ? category.toUpperCase() : 'BOOKMYSHOW'}
    </text>
    
    <text x="600" y="280" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${title || 'BookMyShow AI Discovery'}
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default function ImageWithFallback({ src, alt, className, category, title, type = 'poster', ...props }) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  const colors = {
    movies: ['#312e81', '#1e1b4b'], // indigo
    comedy: ['#78350f', '#451a03'], // amber
    concerts: ['#701a75', '#4a044e'], // fuchsia
    sports: ['#065f46', '#022c22'], // emerald
    plays: ['#991b1b', '#7f1d1d'], // red
    activities: ['#0369a1', '#0c4a6e'] // sky
  };
  const [bgStart, bgEnd] = colors[category] || ['#1f2937', '#111827'];

  if (hasError) {
    if (type === 'banner') {
      return (
        <div 
          className={`relative flex items-center justify-center text-center overflow-hidden select-none ${className}`} 
          style={{ background: `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)` }}
          {...props}
        >
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,75 L1200,75 M0,150 L1200,150 M0,225 L1200,225 M0,300 L1200,300 M0,375 L1200,375 M150,0 L150,450 M300,0 L300,450 M450,0 L450,450 M600,0 L600,450 M750,0 L750,450 M900,0 L900,450 M1050,0 L1050,450" stroke="white" strokeWidth="1" />
          </svg>
          <div className="relative z-10 p-4">
            <span className="text-[10px] uppercase font-black tracking-widest text-brand opacity-80 block mb-1">{category || 'Event'}</span>
            <h4 className="text-sm font-black text-white leading-snug line-clamp-1">{title}</h4>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`relative flex flex-col justify-between p-4 overflow-hidden select-none ${className}`} 
        style={{ background: `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)` }}
        {...props}
      >
        {/* Background Grid Accent */}
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0,50 L 400,50 M 0,100 L 400,100 M 0,150 L 400,150 M 0,200 L 400,200 M 0,250 L 400,250 M 0,300 L 400,300 M 50,0 L 50,400 M 100,0 L 100,400 M 150,0 L 150,400 M 200,0 L 200,400" stroke="white" strokeWidth="1" />
        </svg>
        
        {/* Category Initials Badge */}
        <div className="relative z-10 self-start bg-black/40 border border-white/10 px-2 py-0.5 rounded text-[9px] font-black tracking-wider text-white/70 uppercase">
          {category ? category.substring(0, 2) : 'EV'}
        </div>

        {/* Center icon mark */}
        <div className="relative z-10 flex-1 flex items-center justify-center opacity-10">
          <span className="text-5xl font-black">{category ? category.substring(0, 2).toUpperCase() : 'BMS'}</span>
        </div>

        {/* Title area at bottom */}
        <div className="relative z-10 bg-black/30 border border-white/5 p-2 rounded-lg backdrop-blur-sm">
          <h5 className="text-[10px] font-black text-white leading-tight line-clamp-2">{title}</h5>
          <span className="text-[8px] font-bold text-gray-400 block mt-1 uppercase tracking-wider">{category}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
