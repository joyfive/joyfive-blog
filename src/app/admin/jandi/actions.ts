"use server";

import { notion } from "@/lib/notion/client";

export async function createJandiRecord(
  typeName: string,
  logKey: string
): Promise<{ ok: boolean; error?: string }> {
  if (!logKey || !process.env.LOG_KEY || logKey !== process.env.LOG_KEY) {
    return { ok: false, error: "Unauthorized" };
  }

  const todayKST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Seoul",
  });

  try {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_JANDI_DB_ID! },
      properties: {
        title: { title: [{ text: { content: typeName } }] },
        type: { select: { name: typeName } },
        created_at: { date: { start: todayKST } },
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[createJandiRecord]", e);
    return { ok: false, error: String(e) };
  }
}
