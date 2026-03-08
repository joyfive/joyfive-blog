import { fetchJandiTypes, fetchJandiRecords } from "@/lib/notion/fetchJandiData";
import RoughTape from "@/components/layout/RoughTape";
import DayCell from "./DayCell";
import TypeBadge from "./TypeBadge";

const NUM_WEEKS = 13;
const CELL_SIZE = 40; // Day cell 크기 (DayCell의 DAY_CELL과 동일)
const CELL_GAP = 8;
const DAY_LABEL_WIDTH = 12;
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

export default async function JandiWidget() {
  const [types, records] = await Promise.all([
    fetchJandiTypes(),
    fetchJandiRecords(),
  ]);

  if (types.length === 0) return null;

  const { cols, rows } = calcGrid(types.length);

  // KST 기준 오늘
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  const todayDOW = (todayDate.getDay() + 6) % 7; // 0=Mon, 6=Sun

  // 이번 주 월요일 / 첫 번째 월요일 계산
  const todayMondayD = td - todayDOW;
  const firstMondayD = todayMondayD - (NUM_WEEKS - 1) * 7;

  // 13주 × 7일 그리드 (col=주차, row=요일)
  const weeks: (Date | null)[][] = [];
  for (let col = 0; col < NUM_WEEKS; col++) {
    const week: (Date | null)[] = [];
    for (let row = 0; row < 7; row++) {
      const d = new Date(ty, tm - 1, firstMondayD + col * 7 + row);
      week.push(d <= todayDate ? d : null);
    }
    weeks.push(week);
  }

  // 월 라벨: 월이 바뀌는 열에 표시
  const monthLabels: (string | null)[] = weeks.map((_, col) => {
    const thisMonday = new Date(ty, tm - 1, firstMondayD + col * 7);
    if (col === 0) return MONTH_NAMES[thisMonday.getMonth()];
    const prevMonday = new Date(ty, tm - 1, firstMondayD + (col - 1) * 7);
    return prevMonday.getMonth() !== thisMonday.getMonth()
      ? MONTH_NAMES[thisMonday.getMonth()]
      : null;
  });

  // 날짜별 활성 타입 set
  const activationMap = new Map<string, Set<string>>();
  for (const record of records) {
    if (!activationMap.has(record.date)) {
      activationMap.set(record.date, new Set());
    }
    activationMap.get(record.date)!.add(record.type);
  }

  // 타입별 활동일수
  const activityCounts: Record<string, number> = {};
  activationMap.forEach((typeSet) => {
    typeSet.forEach((typeName) => {
      activityCounts[typeName] = (activityCounts[typeName] ?? 0) + 1;
    });
  });

  return (
    <div className="relative mt-12 bg-white">
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
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-5">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-none m-0">
            Activity · 13W
          </h2>
          <div className="flex flex-wrap items-center gap-2">
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
        <div className="flex justify-center">
          <div>
            {/* 월 라벨 */}
            <div
              className="flex mb-1"
              style={{ paddingLeft: DAY_LABEL_WIDTH + DAY_LABEL_GAP }}
            >
              {weeks.map((_, col) => (
                <div
                  key={col}
                  style={{
                    width: CELL_SIZE,
                    marginLeft: col > 0 ? CELL_GAP : 0,
                    fontSize: 10,
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
              <div
                className="flex flex-col"
                style={{ gap: CELL_GAP, width: DAY_LABEL_WIDTH }}
              >
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    style={{
                      height: CELL_SIZE,
                      fontSize: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color:
                        i === 5 ? "#60a5fa" : i === 6 ? "#f87171" : "#a8a29e",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* 주 × 요일 셀 */}
              <div className="flex" style={{ gap: CELL_GAP }}>
                {weeks.map((week, col) => (
                  <div
                    key={col}
                    className="flex flex-col"
                    style={{ gap: CELL_GAP }}
                  >
                    {week.map((day, row) => {
                      if (!day) {
                        return (
                          <div
                            key={row}
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          />
                        );
                      }
                      const dateStr = toDateStr(day);
                      return (
                        <DayCell
                          key={dateStr}
                          types={types}
                          activatedTypes={
                            activationMap.get(dateStr) ?? new Set()
                          }
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
      </div>
    </div>
  );
}
