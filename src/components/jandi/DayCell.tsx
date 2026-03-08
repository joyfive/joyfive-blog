import { getNotionColor } from "@/lib/notion/notionColors";
import type { JandiType } from "@/lib/notion/fetchJandiData";

const DAY_CELL = 40; // 하루 셀 크기 (고정, override 불가)
const PADDING = 2; // 상하좌우 균일 padding
const TASK_GAP = 4; // 내부 타입 칸 간 gap

interface DayCellProps {
  types: JandiType[];
  activatedTypes: Set<string>;
  isToday: boolean;
  cols: number;
  rows: number;
}

export default function DayCell({
  types,
  activatedTypes,
  isToday,
  cols,
  rows,
}: DayCellProps) {
  // 내부 가용 공간에서 gap을 뺀 나머지를 균등 분배
  // 2×2: (40 - 4 - 4) / 2 = 16px ✓
  const subCellW = Math.floor(
    (DAY_CELL - 2 * PADDING - (cols - 1) * TASK_GAP) / cols,
  );
  const subCellH = Math.floor(
    (DAY_CELL - 2 * PADDING - (rows - 1) * TASK_GAP) / rows,
  );

  return (
    <div
      style={{
        width: DAY_CELL,
        height: DAY_CELL,
        padding: PADDING,
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${subCellW}px)`,
        gridTemplateRows: `repeat(${rows}, ${subCellH}px)`,
        gap: `${TASK_GAP}px`,
        background: "#ffffff",
        outline: isToday ? "2px solid rgb(168, 162, 158)" : undefined,
        outlineOffset: "2px",
        borderRadius: 4,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => {
        const type = types[i];
        const filled = type != null && activatedTypes.has(type.name);
        return (
          <div
            key={i}
            class="rounded-sm"
            style={{
              backgroundColor: filled ? getNotionColor(type.color) : "#f5f5f4",
            }}
          />
        );
      })}
    </div>
  );
}
