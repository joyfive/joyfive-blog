// src/components/layout/RoughCard.tsx
import { ReactNode, useMemo } from "react";
import RoughTape, { type TapePosition } from "./RoughTape";

interface RoughCardProps {
  children: ReactNode;
  className?: string;
  bg?: string;
  border?: string;
  tapes?: TapePosition[];
  tapesBg?: string;
  tapesBorder?: string;
}

export default function RoughCard({
  children,
  className = "",
  bg = "",
  border = "border-stone-700",
  tapes = [],
  tapesBg = "bg-stone-700/10",
  tapesBorder = "border-stone-700/50",
}: RoughCardProps) {
  const cardRotation = useMemo(
    () => Math.floor(Math.random() * 7) - 3,
    []
  );

  return (
    <div
      className="relative h-auto"
      style={{ transform: `rotate(${cardRotation}deg)` }}
    >
      {/* 1. 메인 배경 및 테두리 레이어 */}
      <div
        className={`absolute inset-0 border-2 ${bg} ${border} filter-rough z-0`}
        aria-hidden="true"
      />

      {/* 2. RoughTape 레이어 */}
      {tapes.map((pos) => (
        <RoughTape
          key={pos}
          position={pos}
          absolute
          bg={tapesBg}
          border={tapesBorder}
        />
      ))}

      {/* 3. 실제 콘텐츠 레이어 */}
      <div className={`p-8 z-10 ${className}`}>
        {children}
      </div>
    </div>
  );
}
