import {
  fetchJandiTypes,
  fetchJandiRecords,
} from "@/lib/notion/fetchJandiData";
import RoughTape from "@/components/layout/RoughTape";
import TypeBadge from "./TypeBadge";
import JandiGrid from "./JandiGrid";
import MobileAdaptiveGrid from "./MobileAdaptiveGrid";

function calcGrid(n: number) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  return { cols, rows };
}

export default async function JandiWidget() {
  const [types, records] = await Promise.all([
    fetchJandiTypes(),
    fetchJandiRecords(),
  ]);
  if (types.length === 0) return null;

  const { cols, rows } = calcGrid(types.length);

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Seoul",
  });
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const todayDate = new Date(ty, tm - 1, td);

  const activationMap = new Map<string, Set<string>>();
  for (const record of records) {
    if (!activationMap.has(record.date))
      activationMap.set(record.date, new Set());
    activationMap.get(record.date)!.add(record.type);
  }

  // Map → 직렬화 가능한 배열로 변환 (서버→클라이언트 전달용)
  const activationEntries: [string, string[]][] = Array.from(
    activationMap.entries(),
  ).map(([date, typeSet]) => [date, Array.from(typeSet)]);

  const activityCounts: Record<string, number> = {};
  activationMap.forEach((typeSet) => {
    typeSet.forEach((typeName) => {
      activityCounts[typeName] = (activityCounts[typeName] ?? 0) + 1;
    });
  });

  const gridProps = {
    types,
    activationMap,
    cols,
    rows,
    todayStr,
    ty,
    tm,
    td,
    todayDate,
  };

  return (
    <div className="relative bg-white">
      <div
        className="absolute inset-0 border-2 border-stone-700 filter-rough"
        aria-hidden="true"
      />
      <RoughTape position="lt" absolute />
      <RoughTape position="rb" absolute />

      <div className="p-6 relative z-10">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-5">
          <h2 className="text-sm font-medium text-stone-400 leading-none m-0">
            <span className="block md:hidden">Activity</span>
            <span className="hidden md:block lg:hidden">Activity · 9W</span>
            <span className="hidden lg:block">Activity · 13W</span>
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

        {/* 모바일: 컨테이너 폭 기준 자동 컬럼 계산 (35일→28일→21일) */}
        <div className="block md:hidden">
          <MobileAdaptiveGrid
            types={types}
            activationEntries={activationEntries}
            cols={cols}
            rows={rows}
            todayStr={todayStr}
            ty={ty}
            tm={tm}
            td={td}
          />
        </div>

        {/* 태블릿 9W / 데스크탑 13W */}
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
