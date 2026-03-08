import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import RoughCard from "@/components/layout/RoughCard";

export default async function NowWidget() {
  const items = await fetchProfileItems("now");
  if (items.length === 0) return null;

  return (
    <RoughCard tapes={["rb"]} className="h-full">
      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-baseline gap-2 flex-wrap">
              {item.title && (
                <p className="text-sm font-semibold text-stone-700">{item.title}</p>
              )}
              {item.start_date && (
                <p className="text-xs text-stone-400 shrink-0">{item.start_date}</p>
              )}
            </div>
            {item.content.length > 0 && (
              <ul className="flex flex-col gap-0.5 mt-1">
                {item.content.map((line, i) => (
                  <li key={i} className="text-xs text-stone-500">
                    {line}
                  </li>
                ))}
              </ul>
            )}
            {item.description.length > 0 && (
              <ul className="flex flex-col gap-0.5 mt-1">
                {item.description.map((line, i) => (
                  <li key={i} className="text-xs text-stone-400">
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
