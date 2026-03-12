import type { JandiType } from "@/lib/notion/fetchJandiData";
import DayCell from "./DayCell";

export const CELL_SIZE = 40;
export const CELL_GAP = 8;
export const DAY_LABEL_WIDTH = 40;
export const DAY_LABEL_GAP = 6;

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export interface JandiGridProps {
  numWeeks: number;
  types: JandiType[];
  activationMap: Map<string, Set<string>>;
  cols: number;
  rows: number;
  todayStr: string;
  ty: number;
  tm: number;
  td: number;
  todayDate: Date;
}

function toDateStr(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export default function JandiGrid({
  numWeeks,
  types,
  activationMap,
  cols,
  rows,
  todayStr,
  ty,
  tm,
  td,
  todayDate,
}: JandiGridProps) {
  const todayDOW = (todayDate.getDay() + 6) % 7;
  const todayMondayD = td - todayDOW;
  const firstMondayD = todayMondayD - (numWeeks - 1) * 7;

  const weeks: (Date | null)[][] = [];
  for (let col = 0; col < numWeeks; col++) {
    const week: (Date | null)[] = [];
    for (let row = 0; row < 7; row++) {
      const d = new Date(ty, tm - 1, firstMondayD + col * 7 + row);
      week.push(d <= todayDate ? d : null);
    }
    weeks.push(week);
  }

  const monthLabels: (string | null)[] = weeks.map((_, col) => {
    const thisMonday = new Date(ty, tm - 1, firstMondayD + col * 7);
    if (col === 0) return MONTH_NAMES[thisMonday.getMonth()];
    const prevMonday = new Date(ty, tm - 1, firstMondayD + (col - 1) * 7);
    return prevMonday.getMonth() !== thisMonday.getMonth()
      ? MONTH_NAMES[thisMonday.getMonth()]
      : null;
  });

  return (
    <div className="flex justify-center">
      <div className="pb-1 pr-1">
        {/* 월 라벨 */}
        <div className="flex mb-1" style={{ paddingLeft: DAY_LABEL_WIDTH + DAY_LABEL_GAP }}>
          {weeks.map((_, col) => (
            <div
              key={col}
              className={monthLabels[col] ? "border border-stone-200" : ""}
              style={{
                width: CELL_SIZE,
                marginLeft: col > 0 ? CELL_GAP : 0,
                fontSize: 12,
                textAlign: "center",
                color: "#a8a29e",
                whiteSpace: "nowrap",
              }}
            >
              {monthLabels[col] ?? ""}
            </div>
          ))}
        </div>

        {/* 요일 라벨 + 셀 */}
        <div className="flex" style={{ gap: DAY_LABEL_GAP }}>
          {/* 요일 라벨 */}
          <div className="flex flex-col" style={{ gap: CELL_GAP, width: DAY_LABEL_WIDTH }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="w-10 rounded-md bg-stone-50 border border-stone-200"
                style={{
                  height: CELL_SIZE,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: i === 5 ? "#60a5fa" : i === 6 ? "#f87171" : "#a8a29e",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* 주 × 요일 셀 */}
          <div className="flex" style={{ gap: CELL_GAP }}>
            {weeks.map((week, col) => (
              <div key={col} className="flex flex-col" style={{ gap: CELL_GAP }}>
                {week.map((day, row) => {
                  if (!day) {
                    return <div key={row} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
                  }
                  const dateStr = toDateStr(day);
                  return (
                    <DayCell
                      key={dateStr}
                      types={types}
                      activatedTypes={activationMap.get(dateStr) ?? new Set()}
                      isToday={dateStr === todayStr}
                      cols={cols}
                      rows={rows}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
