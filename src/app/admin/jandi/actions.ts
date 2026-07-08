"use server";

import { notion } from "@/lib/notion/client";
import { fetchJandiTypesByDate } from "@/lib/notion/fetchJandiData";

function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

function todayKST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export async function createJandiRecord(
  typeName: string,
  logKey: string,
  dateStr?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!logKey || !process.env.LOG_KEY || logKey !== process.env.LOG_KEY) {
    return { ok: false, error: "Unauthorized" };
  }

  const date = dateStr ?? todayKST();
  if (!isValidDate(date) || date > todayKST()) {
    return { ok: false, error: "Invalid date" };
  }

  try {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_JANDI_DB_ID! },
      properties: {
        title: { title: [{ text: { content: typeName } }] },
        type: { select: { name: typeName } },
        created_at: { date: { start: date } },
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[createJandiRecord]", e);
    return { ok: false, error: String(e) };
  }
}

export async function fetchCompletedByDate(
  dateStr: string,
  logKey: string
): Promise<{ ok: boolean; completed: string[]; error?: string }> {
  if (!logKey || !process.env.LOG_KEY || logKey !== process.env.LOG_KEY) {
    return { ok: false, completed: [], error: "Unauthorized" };
  }
  if (!isValidDate(dateStr)) {
    return { ok: false, completed: [], error: "Invalid date" };
  }

  try {
    const completed = await fetchJandiTypesByDate(dateStr);
    return { ok: true, completed };
  } catch (e) {
    console.error("[fetchCompletedByDate]", e);
    return { ok: false, completed: [], error: String(e) };
  }
}
