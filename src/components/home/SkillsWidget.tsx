import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import RoughCard from "@/components/layout/RoughCard";

export default async function SkillsWidget() {
  const items = await fetchProfileItems("skills");
  if (items.length === 0) return null;

  return (
    <RoughCard tapes={["rt"]}>
      <div className="flex flex-wrap gap-x-10 gap-y-5">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            {item.title && (
              <p className="text-sm font-medium text-stone-400">{item.title}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {item.content
                .flatMap((line) => line.split(",").map((s) => s.trim()).filter(Boolean))
                .map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full px-2 py-1 bg-stone-50 border border-stone-200 text-stone-600 text-xs"
                  >
                    {tag}
                  </span>
                ))}
            </div>
            {item.description.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {item.description
                  .flatMap((line) => line.split(",").map((s) => s.trim()).filter(Boolean))
                  .map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full px-2 py-1 border border-stone-100 text-stone-400 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </RoughCard>
  );
}
