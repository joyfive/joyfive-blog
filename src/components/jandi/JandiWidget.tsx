import {
  fetchJandiTypes,
  fetchJandiRecords,
} from "@/lib/notion/fetchJandiData";
import RoughTape from "@/components/layout/RoughTape";
import DayCell, { calcCellBlockSize } from "./DayCell";
import TypeBadge from "./TypeBadge";

function calcGrid(n: number) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return { cols, rows };
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function JandiWidget() {
  const [types, records] = await Promise.all([
    fetchJandiTypes(),
    fetchJandiRecords(),
  ]);

  if (types.length === 0) return null;

  const { cols, rows } = calcGrid(types.length);
  const { width: blockW, height: blockH } = calcCellBlockSize(cols, rows);

  // D-89 ~ D-0 (90일) 날짜 배열 생성
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  // 첫날 기준 월요일 정렬 (앞에 null padding)
  const startDayOfWeek = (days[0].getDay() + 6) % 7; // 0=Mon, 6=Sun
  const paddedDays: (Date | null)[] = [
    ...Array<null>(startDayOfWeek).fill(null),
    ...days,
  ];

  // 7일씩 주 단위로 grouping
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // 날짜별 활성 타입 set 구성
  const activationMap = new Map<string, Set<string>>();
  for (const record of records) {
    if (!activationMap.has(record.date)) {
      activationMap.set(record.date, new Set());
    }
    activationMap.get(record.date)!.add(record.type);
  }

  // 타입별 활동일수 집계
  const activityCounts: Record<string, number> = {};
  for (const typeSet of activationMap.values()) {
    for (const typeName of typeSet) {
      activityCounts[typeName] = (activityCounts[typeName] ?? 0) + 1;
    }
  }

  const todayStr = toDateStr(today);

  return (
    <div className="relative mt-12">
      {/* Rough border */}
      <div
        className="absolute inset-0 border-2 border-stone-700 filter-rough"
        aria-hidden="true"
      />
      {/* 마스킹테이프 */}
      <RoughTape position="lt" absolute />
      <RoughTape position="rt" absolute />

      <div className="p-6 relative z-10">
        {/* 헤더: 타이틀 + 타입 배지 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Activity · D-90
          </h2>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <TypeBadge
                key={type.id}
                type={type}
                activityDays={activityCounts[type.name] ?? 0}
              />
            ))}
          </div>
        </div>

        {/* 잔디 그리드 */}
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-[3px] w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  if (!day) {
                    // 주 정렬용 빈 슬롯
                    return (
                      <div key={di} style={{ width: blockW, height: blockH }} />
                    );
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
