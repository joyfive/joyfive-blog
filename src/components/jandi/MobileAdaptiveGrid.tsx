"use client";

import { useRef, useEffect, useState } from "react";
import JandiGrid from "./JandiGrid";
import { CELL_SIZE, CELL_GAP, DAY_LABEL_WIDTH, DAY_LABEL_GAP } from "./JandiGrid";
import type { JandiType } from "@/lib/notion/fetchJandiData";

// totalWidth = DAY_LABEL_WIDTH + DAY_LABEL_GAP + n*CELL_SIZE + (n-1)*CELL_GAP
//            = 40 + 6 + 48n - 8 = 38 + 48n
// → n = floor((containerWidth - 38) / 48), clamped to [3, 5]
function calcNumWeeks(containerWidth: number): number {
  const n = Math.floor((containerWidth - DAY_LABEL_WIDTH - DAY_LABEL_GAP + CELL_GAP) / (CELL_SIZE + CELL_GAP));
  return Math.max(3, Math.min(5, n));
}

interface Props {
  types: JandiType[];
  activationEntries: [string, string[]][];
  cols: number;
  rows: number;
  todayStr: string;
  ty: number;
  tm: number;
  td: number;
}

export default function MobileAdaptiveGrid({
  types,
  activationEntries,
  cols,
  rows,
  todayStr,
  ty,
  tm,
  td,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numWeeks, setNumWeeks] = useState(5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setNumWeeks(calcNumWeeks(el.clientWidth));
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activationMap = new Map(
    activationEntries.map(([date, typeNames]) => [date, new Set(typeNames)])
  );
  const todayDate = new Date(ty, tm - 1, td);

  return (
    <div ref={containerRef}>
      <JandiGrid
        numWeeks={numWeeks}
        types={types}
        activationMap={activationMap}
        cols={cols}
        rows={rows}
        todayStr={todayStr}
        ty={ty}
        tm={tm}
        td={td}
        todayDate={todayDate}
      />
    </div>
  );
}
