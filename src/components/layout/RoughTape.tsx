// src/components/layout/RoughTape.tsx
import { useMemo } from "react";

export type TapePosition = "lt" | "t" | "rt" | "lb" | "rb";

const POSITION_CLASSES: Record<TapePosition, string> = {
  lt: "-top-4 -left-4",
  t: "-top-5 left-1/2 -translate-x-1/2",
  rt: "-top-4 -right-4",
  lb: "-bottom-4 -left-4",
  rb: "-bottom-4 -right-4",
};

interface RoughTapeProps {
  position: TapePosition;
  absolute?: boolean;
  className?: string;
  bg?: string;
  border?: string;
  width?: string;
  height?: string;
  randomRotate?: boolean;
}

export default function RoughTape({
  position,
  absolute = true,
  className = "",
  bg = "bg-stone-700/10",
  border = "border-stone-700/50",
  width = "w-28",
  height = "h-10",
  randomRotate = true,
}: RoughTapeProps) {
  const transformStyle = useMemo(() => {
    if (!randomRotate) return undefined;
    const rotation = Math.floor(Math.random() * 24) - 12;
    const offsetX = Math.floor(Math.random() * 6) - 3;
    const offsetY = Math.floor(Math.random() * 6) - 3;
    const base = position === "t" ? "translateX(-50%) " : "";
    return {
      transform: `${base}rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
    };
  }, [position, randomRotate]);

  const positionClass = absolute ? POSITION_CLASSES[position] : "";
  const layoutClass = absolute ? "absolute" : "relative";

  return (
    <div
      className={`${width} ${height} ${layoutClass} ${positionClass} ${bg} border ${border} filter-rough z-20 ${className}`}
      style={transformStyle}
      aria-hidden="true"
    />
  );
}
