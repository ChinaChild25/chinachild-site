"use client";

/**
 * Line-art портрет «老师 Liang» в круге. Минималистично, без иллюстраций.
 */
export default function TutorAvatar({ size = 44 }: { size?: number }) {
  return (
    <div
      className="d-chat-avatar"
      aria-hidden
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 44 44" width={size} height={size}>
        <circle cx="22" cy="18" r="6" fill="none" stroke="#0a0a0a" strokeWidth="1.6" />
        <path
          d="M 10 36 C 12 28 18 26 22 26 C 26 26 32 28 34 36"
          fill="none"
          stroke="#0a0a0a"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line x1="6" y1="14" x2="14" y2="14" stroke="#0a0a0a" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="30" y1="14" x2="38" y2="14" stroke="#0a0a0a" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
