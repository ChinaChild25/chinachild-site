"use client";

/**
 * SVG-эквалайзер с морфингом одной path-кривой.
 * Используется на переходном экране калибровки.
 */
export default function WaveLoader() {
  return (
    <svg className="d-wave-loader" viewBox="0 0 320 64" preserveAspectRatio="none" aria-hidden>
      <path>
        <animate
          attributeName="d"
          dur="2.2s"
          repeatCount="indefinite"
          values="
            M 0 32 Q 40 8 80 32 T 160 32 T 240 32 T 320 32;
            M 0 32 Q 40 54 80 32 T 160 28 T 240 36 T 320 32;
            M 0 32 Q 40 16 80 32 T 160 44 T 240 16 T 320 32;
            M 0 32 Q 40 8 80 32 T 160 32 T 240 32 T 320 32
          "
        />
      </path>
    </svg>
  );
}
