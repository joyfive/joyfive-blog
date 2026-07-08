import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fetchJandiTypes, fetchTodayJandiTypes } from "@/lib/notion/fetchJandiData";
import JandiLogger from "./JandiLogger";
import FloatingNav from "../FloatingNav";
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

  const todayKST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Seoul",
  });

  return (
    <>
      <JandiLogger
        types={types}
        logKey={key}
        todayKST={todayKST}
        initialCompleted={completedToday}
      />
      <Suspense fallback={null}>
        <FloatingNav />
      </Suspense>
    </>
  );
}
