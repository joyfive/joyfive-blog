// src/components/ui/RoughFilter.tsx
export default function RoughFilter() {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <filter id="rough-border">
        {/* 거친 질감을 만드는 수학적 노이즈 */}
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
        {/* 노이즈를 바탕으로 원래 선을 찌그러뜨림 */}
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
      </filter>
    </svg>
  );
}