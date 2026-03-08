import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import RoughCard from "@/components/layout/RoughCard";

export default async function IntroWidget() {
  const items = await fetchProfileItems("intro");
  if (items.length === 0) return null;

  return (
    <RoughCard tapes={["lt"]}>
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            {item.title && (
              <p className="text-sm font-medium text-stone-400">{item.title}</p>
            )}
            {item.content.map((line, i) => (
              <h2 key={i} className="font-danjo text-stone-800">
                {line}
              </h2>
            ))}
            {item.description.map((line, i) => (
              <p key={i} className="text-stone-400 text-sm">{line}</p>
            ))}
          </div>
        ))}
      </div>
    </RoughCard>
  );
}
