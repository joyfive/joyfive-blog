import RoughCard from "@/components/layout/RoughCard";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-full items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-full w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <RoughCard tapes={["t"]}>
          <h1 className="mb-8 text-5xl font-bold text-gray-900 dark:text-white sm:text-6xl leading-snug">
            Joyfive Blog.
          </h1>
        </RoughCard>
      </main>
    </div>
  );
}
