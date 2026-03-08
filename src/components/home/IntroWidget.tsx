import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import RoughCard from "@/components/layout/RoughCard";

export default async function IntroWidget() {
  const items = await fetchProfileItems("intro");
  if (items.length === 0) return null;

  return (
    <RoughCard tapes={["lt"]}>
      <div className="flex flex-col gap-8">
        {items.map((item, idx) => (
          <div key={item.id}>
            {item.title && (
              <p
                className={
                  idx === 0
                    ? "text-5xl font-bold text-stone-800 leading-snug mb-3 font-danjo"
                    : "text-base font-bold text-stone-500 uppercase tracking-widest mb-2"
                }
              >
                {item.title}
              </p>
            )}
            {item.content.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {item.content.map((line, i) => (
                  <li key={i} className={idx === 0 ? "text-stone-700 text-lg" : "text-stone-600 text-sm"}>
                    {line}
                  </li>
                ))}
              </ul>
            )}
            {item.description.length > 0 && (
              <ul className="flex flex-col gap-1 mt-2">
                {item.description.map((line, i) => (
                  <li key={i} className="text-stone-400 text-sm">
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
