import { getNotionColor } from "@/lib/notion/notionColors";
import type { JandiType } from "@/lib/notion/fetchJandiData";

const CELL_SIZE = 10; // px (각 서브셀 크기)
const BORDER_COLOR = "#d6d3cd";

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
  const totalSlots = cols * rows;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
        gap: "1px",
        background: BORDER_COLOR, // gap 사이로 보여서 grid line 역할
        padding: "1px", // outer border
        outline: isToday ? "2px solid #44403c" : undefined,
        outlineOffset: "2px",
      }}
    >
      {Array.from({ length: totalSlots }).map((_, i) => {
        const type = types[i];
        const filled = type != null && activatedTypes.has(type.name);
        return (
          <div
            key={i}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: filled ? getNotionColor(type.color) : "#f0ede8",
            }}
          />
        );
      })}
    </div>
  );
}

// 외부에서 블럭 크기를 계산할 때 사용 (빈 padding 슬롯 크기 맞춤용)
export function calcCellBlockSize(cols: number, rows: number) {
  return {
    width: cols * CELL_SIZE + (cols - 1) + 2, // 11*cols + 1
    height: rows * CELL_SIZE + (rows - 1) + 2, // 11*rows + 1
  };
}
