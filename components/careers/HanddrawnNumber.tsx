type HanddrawnNumberProps = {
  value: string;
  className?: string;
};

export default function HanddrawnNumber({ value, className }: HanddrawnNumberProps) {
  return (
    <svg className={className} viewBox="0 0 72 64" role="img" aria-label={`Шаг ${value}`}>
      <path d="M10 30C11 12 26 4 43 8C60 11 67 23 62 39C58 54 42 61 26 56C12 52 5 43 10 30Z" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M8 34C7 18 20 7 37 6C53 5 66 14 65 31C64 48 52 58 35 59C18 60 9 50 8 34Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <text x="36" y="39" textAnchor="middle" fontFamily="Bradley Hand, Comic Sans MS, cursive" fontSize="22" fontWeight="700" fill="currentColor">
        {value}
      </text>
    </svg>
  );
}
