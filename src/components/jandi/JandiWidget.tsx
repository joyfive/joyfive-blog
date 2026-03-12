import { fetchJandiTypes, fetchJandiRecords } from "@/lib/notion/fetchJandiData";
import type { JandiType } from "@/lib/notion/fetchJandiData";
import RoughTape from "@/components/layout/RoughTape";
import DayCell from "./DayCell";
import TypeBadge from "./TypeBadge";

const CELL_SIZE = 40;
const CELL_GAP = 8;
const DAY_LABEL_WIDTH = 40;
const DAY_LABEL_GAP = 6;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function calcGrid(n: number) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return { cols, rows };
}

function toDateStr(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

interface JandiGridProps {
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

function JandiGrid({ numWeeks, types, activationMap, cols, rows, todayStr, ty, tm, td, todayDate }: JandiGridProps) {
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
    <div className="flex justify-center overflow-x-auto">
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

export default async function JandiWidget() {
  const [types, records] = await Promise.all([fetchJandiTypes(), fetchJandiRecords()]);
  if (types.length === 0) return null;

  const { cols, rows } = calcGrid(types.length);

  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const todayDate = new Date(ty, tm - 1, td);

  const activationMap = new Map<string, Set<string>>();
  for (const record of records) {
    if (!activationMap.has(record.date)) activationMap.set(record.date, new Set());
    activationMap.get(record.date)!.add(record.type);
  }

  const activityCounts: Record<string, number> = {};
  activationMap.forEach((typeSet) => {
    typeSet.forEach((typeName) => {
      activityCounts[typeName] = (activityCounts[typeName] ?? 0) + 1;
    });
  });

  const gridProps = { types, activationMap, cols, rows, todayStr, ty, tm, td, todayDate };

  return (
    <div className="relative bg-white">
      <div className="absolute inset-0 border-2 border-stone-700 filter-rough" aria-hidden="true" />
      <RoughTape position="lt" absolute />
      <RoughTape position="rt" absolute />

      <div className="p-6 relative z-10">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-5">
          <h2 className="text-sm font-medium text-stone-400 leading-none m-0">
            <span className="block md:hidden">Activity · 5W</span>
            <span className="hidden md:block lg:hidden">Activity · 9W</span>
            <span className="hidden lg:block">Activity · 13W</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {types.map((type) => (
              <TypeBadge key={type.id} type={type} activityDays={activityCounts[type.name] ?? 0} />
            ))}
          </div>
        </div>

        {/* 반응형 그리드: 모바일 5W / 태블릿 9W / 데스크탑 13W */}
        <div className="block md:hidden">
          <JandiGrid numWeeks={5} {...gridProps} />
        </div>
        <div className="hidden md:block lg:hidden">
          <JandiGrid numWeeks={9} {...gridProps} />
        </div>
        <div className="hidden lg:block">
          <JandiGrid numWeeks={13} {...gridProps} />
        </div>
      </div>
    </div>
  );
}
