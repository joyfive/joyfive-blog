"use server";

import { notion } from "@/lib/notion/client";

function authorize(logKey: string) {
  if (!logKey || !process.env.LOG_KEY || logKey !== process.env.LOG_KEY) {
    throw new Error("Unauthorized");
  }
}

export interface ItemData {
  title: string;
  content: string;
  description: string;
  start_date: string;
  end_date: string;
}

export async function createProfileItem(
  category: string,
  logKey: string,
  data: ItemData
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    authorize(logKey);
    const page = await notion.pages.create({
      parent: { database_id: process.env.NOTION_PROFILE_DB_ID! },
      properties: {
        title: { title: [{ text: { content: data.title } }] },
        category: { select: { name: category } },
        content: { rich_text: [{ text: { content: data.content } }] },
        description: { rich_text: [{ text: { content: data.description } }] },
        ...(data.start_date
          ? { start_date: { date: { start: data.start_date } } }
          : {}),
        ...(data.end_date
          ? { end_date: { date: { start: data.end_date } } }
          : {}),
      },
    });
    return { ok: true, id: (page as any).id };
  } catch (e) {
    console.error("[createProfileItem]", e);
    return { ok: false, error: String(e) };
  }
}

export async function updateProfileItem(
  pageId: string,
  logKey: string,
  data: ItemData
): Promise<{ ok: boolean; error?: string }> {
  try {
    authorize(logKey);
    await notion.pages.update({
      page_id: pageId,
      properties: {
        title: { title: [{ text: { content: data.title } }] },
        content: { rich_text: [{ text: { content: data.content } }] },
        description: { rich_text: [{ text: { content: data.description } }] },
        start_date: data.start_date
          ? { date: { start: data.start_date } }
          : { date: null },
        end_date: data.end_date
          ? { date: { start: data.end_date } }
          : { date: null },
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[updateProfileItem]", e);
    return { ok: false, error: String(e) };
  }
}

export async function deleteProfileItem(
  pageId: string,
  logKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    authorize(logKey);
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    });
    return { ok: true };
  } catch (e) {
    console.error("[deleteProfileItem]", e);
    return { ok: false, error: String(e) };
  }
}
