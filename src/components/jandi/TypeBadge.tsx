import { getNotionColor } from "@/lib/notion/notionColors";
import type { JandiType } from "@/lib/notion/fetchJandiData";

interface TypeBadgeProps {
  type: JandiType;
  activityDays: number;
}

export default function TypeBadge({ type, activityDays }: TypeBadgeProps) {
  return (
    <span className="relative inline-flex items-center text-xs text-stone-600 px-2 py-0.5">
      <span
        className="absolute inset-0 bg-stone-700/10 border border-stone-700/20 filter-rough pointer-events-none"
        aria-hidden="true"
      />
      <span className="relative flex items-center gap-1.5">
        <span
          style={{ backgroundColor: getNotionColor(type.color) }}
          className="w-2 h-2 rounded-full shrink-0"
        />
        {type.name}
        <span className="text-stone-400 ml-0.5">{activityDays}일</span>
      </span>
    </span>
  );
}
