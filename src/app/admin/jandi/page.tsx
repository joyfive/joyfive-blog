import { notFound } from "next/navigation";
import { fetchJandiTypes, fetchTodayJandiTypes } from "@/lib/notion/fetchJandiData";
import JandiLogger from "./JandiLogger";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: { key?: string };
}

export default async function JandiAdminPage({ searchParams }: Props) {
  const { key } = searchParams;

  if (!key || !process.env.LOG_KEY || key !== process.env.LOG_KEY) {
    return notFound();
  }

  const [types, completedToday] = await Promise.all([
    fetchJandiTypes(),
    fetchTodayJandiTypes(),
  ]);
  if (types.length === 0) return notFound();

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <JandiLogger
      types={types}
      logKey={key}
      todayLabel={todayLabel}
      initialCompleted={completedToday}
    />
  );
}
