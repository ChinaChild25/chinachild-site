// Decorative inline SVG illustrations in Practicum visual language.
// They live next to the cards and headings to add storytelling without raster assets.

type DecorProps = {
  className?: string;
};

export function HskCoin({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id="coin-light" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </radialGradient>
        <linearGradient id="coin-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="86" fill="url(#coin-base)" stroke="rgba(0,0,0,0.06)" />
      <circle cx="100" cy="100" r="86" fill="url(#coin-light)" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(0,0,0,0.06)" strokeDasharray="2 6" />
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="56"
        fontWeight="700"
        fill="#1b1b1b"
      >
        HSK
      </text>
    </svg>
  );
}

export function PercentMedal({ className, value = "55%" }: DecorProps & { value?: string }) {
  return (
    <svg viewBox="0 0 240 220" className={className} aria-hidden>
      <defs>
        <radialGradient id="medal-shine" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      <path
        d="M 30 40 Q 30 0 70 0 L 170 0 Q 210 0 210 40 L 210 130 Q 210 220 120 220 Q 30 220 30 130 Z"
        fill="rgba(255,255,255,0.85)"
        stroke="rgba(0,0,0,0.06)"
      />
      <path
        d="M 30 40 Q 30 0 70 0 L 170 0 Q 210 0 210 40 L 210 130 Q 210 220 120 220 Q 30 220 30 130 Z"
        fill="url(#medal-shine)"
      />
      {[...Array(24)].map((_, i) => (
        <line
          key={i}
          x1="120"
          y1="20"
          x2="120"
          y2="40"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1.5"
          transform={`rotate(${(i * 360) / 24 - 90} 120 130)`}
        />
      ))}
      <text
        x="120"
        y="150"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="48"
        fontWeight="700"
        fill="#1b1b1b"
      >
        {value}
      </text>
    </svg>
  );
}

export function Heart3D({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 220" className={className} aria-hidden>
      <defs>
        <radialGradient id="heart-shine" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <path
        d="M120 200 C 60 160 20 110 30 70 C 40 30 90 20 120 60 C 150 20 200 30 210 70 C 220 110 180 160 120 200 Z"
        fill="rgba(255,255,255,0.9)"
        stroke="rgba(0,0,0,0.06)"
      />
      <path
        d="M120 200 C 60 160 20 110 30 70 C 40 30 90 20 120 60 C 150 20 200 30 210 70 C 220 110 180 160 120 200 Z"
        fill="url(#heart-shine)"
      />
    </svg>
  );
}

export function Headphones({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden>
      <path
        d="M40 130 Q40 50 120 50 Q200 50 200 130"
        fill="none"
        stroke="#1b1b1b"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="30" y="120" width="40" height="80" rx="14" fill="rgba(255,255,255,0.95)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
      <rect x="170" y="120" width="40" height="80" rx="14" fill="rgba(255,255,255,0.95)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
      <circle cx="50" cy="160" r="6" fill="#5c5cff" />
      <circle cx="190" cy="160" r="6" fill="#5c5cff" />
    </svg>
  );
}

export function SpeechBubbles({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden>
      <path
        d="M30 30 L160 30 Q180 30 180 50 L180 100 Q180 120 160 120 L80 120 L50 145 L60 120 Q30 120 30 100 Z"
        fill="rgba(255,255,255,0.95)"
        stroke="#1b1b1b"
        strokeWidth="3"
      />
      <circle cx="80" cy="75" r="5" fill="#1b1b1b" />
      <circle cx="105" cy="75" r="5" fill="#1b1b1b" />
      <circle cx="130" cy="75" r="5" fill="#1b1b1b" />
      <path
        d="M120 90 L210 90 Q225 90 225 105 L225 145 Q225 160 210 160 L185 160 L170 178 L175 160 Q120 160 120 145 Z"
        fill="#5c5cff"
        stroke="#5c5cff"
        strokeWidth="3"
      />
      <text x="172" y="135" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="700" fill="#ffffff">
        你好
      </text>
    </svg>
  );
}

export function GlobeCharacter({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden>
      <circle cx="120" cy="120" r="90" fill="rgba(255,255,255,0.55)" stroke="#1b1b1b" strokeWidth="2.5" />
      <ellipse cx="120" cy="120" rx="90" ry="32" fill="none" stroke="#1b1b1b" strokeWidth="2.5" />
      <ellipse cx="120" cy="120" rx="32" ry="90" fill="none" stroke="#1b1b1b" strokeWidth="2.5" />
      <line x1="30" y1="120" x2="210" y2="120" stroke="#1b1b1b" strokeWidth="2.5" />
      <line x1="120" y1="30" x2="120" y2="210" stroke="#1b1b1b" strokeWidth="2.5" />
      <text x="120" y="135" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="38" fontWeight="700" fill="#1b1b1b">
        中
      </text>
    </svg>
  );
}

export function ChartUp({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden>
      <rect x="30" y="120" width="32" height="60" rx="6" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.08)" />
      <rect x="78" y="90" width="32" height="90" rx="6" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.08)" />
      <rect x="126" y="60" width="32" height="120" rx="6" fill="#5c5cff" />
      <rect x="174" y="30" width="32" height="150" rx="6" fill="#1b1b1b" />
      <path d="M30 145 Q90 120 130 90 T 200 40" fill="none" stroke="#1b1b1b" strokeWidth="2.5" strokeDasharray="4 4" />
      <circle cx="200" cy="40" r="6" fill="#1b1b1b" />
    </svg>
  );
}

export function Sparkle({ className, color = "#ffffff" }: DecorProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 5 L57 43 L95 50 L57 57 L50 95 L43 57 L5 50 L43 43 Z"
        fill={color}
      />
    </svg>
  );
}

export function PersonWaving({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 280" className={className} aria-hidden>
      <ellipse cx="120" cy="80" rx="42" ry="48" fill="rgba(255,255,255,0.95)" stroke="#1b1b1b" strokeWidth="2.5" />
      <path
        d="M78 130 Q60 180 70 240 L100 240 L100 200 L140 200 L140 240 L170 240 Q180 180 162 130 Z"
        fill="rgba(255,255,255,0.95)"
        stroke="#1b1b1b"
        strokeWidth="2.5"
      />
      <path
        d="M170 140 Q210 110 200 70 Q205 50 220 60 Q230 70 215 90 Q225 100 215 115 Q210 130 195 130"
        fill="none"
        stroke="#1b1b1b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="105" cy="78" r="4" fill="#1b1b1b" />
      <circle cx="135" cy="78" r="4" fill="#1b1b1b" />
      <path d="M108 100 Q120 108 132 100" fill="none" stroke="#1b1b1b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Calendar({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 220" className={className} aria-hidden>
      <rect x="30" y="40" width="180" height="160" rx="14" fill="rgba(255,255,255,0.95)" stroke="#1b1b1b" strokeWidth="2.5" />
      <path d="M30 80 L210 80" stroke="#1b1b1b" strokeWidth="2.5" />
      <line x1="70" y1="20" x2="70" y2="60" stroke="#1b1b1b" strokeWidth="6" strokeLinecap="round" />
      <line x1="170" y1="20" x2="170" y2="60" stroke="#1b1b1b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="70" cy="115" r="8" fill="rgba(0,0,0,0.08)" />
      <circle cx="120" cy="115" r="8" fill="#5c5cff" />
      <circle cx="170" cy="115" r="8" fill="rgba(0,0,0,0.08)" />
      <circle cx="70" cy="155" r="8" fill="rgba(0,0,0,0.08)" />
      <circle cx="120" cy="155" r="8" fill="rgba(0,0,0,0.08)" />
      <circle cx="170" cy="155" r="8" fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}

export function PuzzleHands({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 260 200" className={className} aria-hidden>
      <path
        d="M40 80 Q60 80 60 60 Q60 40 80 40 Q100 40 100 60 Q100 80 120 80 L120 140 L40 140 Z"
        fill="rgba(255,255,255,0.95)"
        stroke="#1b1b1b"
        strokeWidth="2.5"
      />
      <path
        d="M140 80 Q160 80 160 60 Q160 40 180 40 Q200 40 200 60 Q200 80 220 80 L220 140 L140 140 Z"
        fill="#5c5cff"
        stroke="#1b1b1b"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function Stars({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden>
      <Sparkle className="" />
      <g transform="translate(20 30)">
        <path d="M40 5 L46 28 L70 35 L46 42 L40 65 L34 42 L10 35 L34 28 Z" fill="#1b1b1b" />
      </g>
      <g transform="translate(140 50)">
        <path d="M40 5 L46 28 L70 35 L46 42 L40 65 L34 42 L10 35 L34 28 Z" fill="#5c5cff" />
      </g>
      <g transform="translate(80 110)">
        <path d="M40 5 L46 28 L70 35 L46 42 L40 65 L34 42 L10 35 L34 28 Z" fill="#1b1b1b" />
      </g>
    </svg>
  );
}
