import Image from "next/image";
import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import RoughCard from "@/components/layout/RoughCard";

export default async function BookWidget() {
  const items = await fetchProfileItems("book");
  if (items.length === 0) return null;

  return (
    <RoughCard tapes={["lt"]} className="h-full">
      <div className="flex flex-row gap-6 overflow-x-auto pb-1">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 shrink-0 w-28">
            {item.img ? (
              <div className="relative w-28 h-40 shrink-0">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-28 h-40 bg-stone-100 shrink-0" />
            )}
            <p className="text-sm font-medium text-stone-700 leading-snug line-clamp-2">
              {item.title}
            </p>
            {item.start_date && (
              <p className="text-xs text-stone-400">{item.start_date}</p>
            )}
            {item.description.length > 0 && (
              <ul className="flex flex-col gap-0.5">
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
