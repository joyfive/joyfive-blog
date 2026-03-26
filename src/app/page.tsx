import { Suspense } from "react";
import IntroWidget from "@/components/home/IntroWidget";
import SkillsWidget from "@/components/home/SkillsWidget";
import BookWidget from "@/components/home/BookWidget";
import NowWidget from "@/components/home/NowWidget";
import JandiWidget from "@/components/jandi/JandiWidget";

export const revalidate = 300;

export default function Home() {
  return (
    <main className="max-w-5xl w-full mx-auto py-16 px-6 flex flex-col gap-12">
      {/* 1행: intro */}
      <Suspense fallback={null}>
        <IntroWidget />
      </Suspense>

      {/* 2행: skills */}
      <Suspense fallback={null}>
        <SkillsWidget />
      </Suspense>

      {/* 3행: book 6 | now 4 */}
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:flex-[5]">
          <Suspense fallback={null}>
            <BookWidget />
          </Suspense>
        </div>
        <div className="md:flex-[5]">
          <Suspense fallback={null}>
            <NowWidget />
          </Suspense>
        </div>
      </div>

      {/* 4행: jandi */}
      <Suspense fallback={null}>
        <JandiWidget />
      </Suspense>
    </main>
  );
}
