import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import RoughCard from "@/components/layout/RoughCard";

export default async function SkillsWidget() {
  const items = await fetchProfileItems("skills");
  if (items.length === 0) return null;

  return (
    <RoughCard tapes={["rt"]}>
      <div className="flex flex-wrap gap-x-10 gap-y-6">
        {items.map((item) => (
          <div key={item.id} className="min-w-32">
            {item.title && (
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                {item.title}
              </p>
            )}
            {item.content.length > 0 && (
              <ul className="flex flex-col gap-1">
                {item.content.map((line, i) => (
                  <li key={i} className="text-stone-700 text-sm">
                    {line}
                  </li>
                ))}
              </ul>
            )}
            {item.description.length > 0 && (
              <ul className="flex flex-col gap-1 mt-1">
                {item.description.map((line, i) => (
                  <li key={i} className="text-stone-400 text-xs">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </RoughCard>
  );
}
