import Image from "next/image";
import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import RoughCard from "@/components/layout/RoughCard";

function DateRange({ start, end }: { start: string; end: string }) {
  if (!start) return null;
  const suffix = end ? end : "진행중";
  return (
    <p className="text-xs text-stone-400">
      {start} ~ {suffix}
    </p>
  );
}

export default async function NowWidget() {
  const items = await fetchProfileItems("now");
  if (items.length === 0) return null;

  return (
    <RoughCard tapes={["rb"]}>
      <div className="flex flex-col gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            className={
              item.img
                ? "flex flex-col md:flex-row items-center justify-center gap-6"
                : "flex flex-col items-center justify-center"
            }
          >
            {/* 텍스트 영역 */}
            <div className="flex flex-col items-center text-center gap-1.5">
              {item.title && (
                <p className="text-sm font-medium text-stone-400">
                  {item.title}
                </p>
              )}
              {item.content.map((line, i) => (
                <h2 key={i} className="font-danjo">
                  {line}
                </h2>
              ))}
              <DateRange start={item.start_date} end={item.end_date} />
              {item.description.map((line, i) => (
                <p key={i} className="text-stone-400 text-sm">
                  {line}
                </p>
              ))}
            </div>

            {/* 이미지 */}
            {item.img && (
              <div className="relative w-28 h-28 shrink-0">
                <Image
                  src={item.img}
                  alt={item.content[0] || item.title}
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </RoughCard>
  );
}
