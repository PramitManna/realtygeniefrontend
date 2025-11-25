'use client';

export default function AnimatedHouse() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="relative w-full max-w-[300px] aspect-square group">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[var(--color-gold)]/10 to-transparent opacity-50 blur-3xl group-hover:opacity-70 transition-opacity duration-700" />
        
        {/* SVG House */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          className="w-full h-full transform transition-all duration-700 ease-out group-hover:scale-105"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main House Structure */}
          <path
            d="M20 45V85H80V45L50 20L20 45Z"
            fill="var(--color-gold-soft)"
            fillOpacity="0.1"
            stroke="var(--color-gold)"
            strokeWidth="2"
            className="transition-all duration-500 group-hover:fill-opacity-20"
          />
          
          {/* Roof */}
          <path
            d="M15 47L50 17L85 47"
            stroke="var(--color-gold)"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-500 group-hover:stroke-[var(--color-gold-soft)]"
          />
          
          {/* Chimney */}
          <path
            d="M70 30V15H78V35"
            stroke="var(--color-gold)"
            strokeWidth="2"
            className="animate-pulse"
          />
          
          {/* Front Porch */}
          <path
            d="M35 85V65H65V85"
            stroke="var(--color-gold-soft)"
            strokeWidth="2"
            fill="var(--color-gold-soft)"
            fillOpacity="0.1"
            className="transition-all duration-500 group-hover:fill-opacity-20"
          />
          
          {/* Door */}
          <path
            d="M45 85V70H55V85"
            stroke="var(--color-gold)"
            strokeWidth="2"
            className="transition-all duration-500"
          />
          
          {/* Windows */}
          <rect
            x="30"
            y="50"
            width="15"
            height="20"
            rx="2"
            stroke="var(--color-gold)"
            strokeWidth="2"
            fill="var(--color-gold-soft)"
            fillOpacity="0.1"
            className="transition-all duration-500 group-hover:fill-opacity-30"
          />
          <rect
            x="55"
            y="50"
            width="15"
            height="20"
            rx="2"
            stroke="var(--color-gold)"
            strokeWidth="2"
            fill="var(--color-gold-soft)"
            fillOpacity="0.1"
            className="transition-all duration-500 group-hover:fill-opacity-30"
          />
          
          {/* Window Details */}
          <path
            d="M37.5 50V70M30 60H45"
            stroke="var(--color-gold)"
            strokeWidth="1"
          />
          <path
            d="M62.5 50V70M55 60H70"
            stroke="var(--color-gold)"
            strokeWidth="1"
          />
          
          {/* Decorative Elements */}
          <circle
            cx="50"
            cy="75"
            r="1"
            fill="var(--color-gold)"
            className="animate-pulse"
          />
          
          {/* Smoke Animation */}
          <g className="animate-pulse opacity-50">
            <circle cx="74" cy="12" r="1" fill="var(--color-gold-soft)" />
            <circle cx="74" cy="8" r="1" fill="var(--color-gold-soft)" />
            <circle cx="74" cy="4" r="1" fill="var(--color-gold-soft)" />
          </g>
        </svg>
      </div>
    </div>
  );
}