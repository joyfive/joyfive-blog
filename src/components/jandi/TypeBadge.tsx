import { getNotionColor } from "@/lib/notion/notionColors";
import type { JandiType } from "@/lib/notion/fetchJandiData";

interface TypeBadgeProps {
  type: JandiType;
  activityDays: number;
}

export default function TypeBadge({ type, activityDays }: TypeBadgeProps) {
  return (
    <span className="relative inline-flex items-center text-sm text-stone-500 px-2 py-0.5">
      <span
        className="absolute inset-0 bg-stone-100 border border-stone-300 filter-rough pointer-events-none"
        aria-hidden="true"
      />
      <span className="relative flex items-center justify-center gap-1.5">
        <span
          style={{ backgroundColor: getNotionColor(type.color) }}
          className="w-3 h-3 rounded-full shrink-0 border border-stone-200"
        />
        {type.name}
        <span className="text-stone-400 ml-0.5 text-bold">
          {activityDays}일
        </span>
      </span>
    </span>
  );
}
