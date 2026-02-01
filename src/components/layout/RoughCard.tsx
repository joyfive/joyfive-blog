// src/components/ui/RoughCard.tsx
import { ReactNode, useMemo } from "react";

type TapePosition = 'lt' | 't' | 'rt' | 'lb' | 'rb';

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
  border = "border-black",
  // 기본적으로 5개 위치를 모두 제공하되, 사용자가 제어 가능
  tapes = [],
  tapesBg = "bg-black/10",
  tapesBorder = "border-black/50",
}: RoughCardProps) {

  // 랜덤 로직을 위치별 스타일과 결합
  const tapeConfigs = useMemo(() => {
    const baseStyles: Record<TapePosition, string> = {
      lt: "-top-4 -left-4",
      t: "-top-5 left-1/2 -translate-x-1/2",
      rt: "-top-4 -right-4",
      lb: "-bottom-4 -left-4",
      rb: "-bottom-4 -right-4",
    };

    return tapes.map(pos => {
      // 각도 랜덤: -12도 ~ 12도 사이
      const rotation = Math.floor(Math.random() * 24) - 12;
      // 미세 위치 이동: -3px ~ 3px 사이
      const offsetX = Math.floor(Math.random() * 6) - 3;
      const offsetY = Math.floor(Math.random() * 6) - 3;

      return {
        pos,
        baseClass: baseStyles[pos],
        style: {
          transform: `${pos === 't' ? 'translateX(-50%)' : ''} rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`
        }
      };
    });
  }, [tapes]);

  return (
    <div className={`relative h-auto`}>
      {/* 1. 메인 배경 및 테두리 레이어 */}
      <div
        className={`absolute inset-0 border-2 ${bg} ${border} filter-rough z-0`}
        aria-hidden="true"
      />

      {/* 2. 랜덤 마스킹 테이프 레이어 */}
      {tapeConfigs.map((config) => (
        <div
          key={config.pos}
          className={`absolute w-28 h-10 ${tapesBg} border ${tapesBorder} filter-rough z-20 ${config.baseClass}`}
          style={config.style}
          aria-hidden="true"
        />
      ))}

      {/* 3. 실제 콘텐츠 레이어 */}
      <div className={`p-8 z-10 ${className}`}>
        {children}
      </div>
    </div>
  );
}