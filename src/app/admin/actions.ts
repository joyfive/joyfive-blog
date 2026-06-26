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
  imgUrl?: string;    // 외부 이미지 URL
  clearImg?: boolean;
}

export async function updateProfileItem(
  pageId: string,
  logKey: string,
  data: ItemData
): Promise<{ ok: boolean; error?: string }> {
  try {
    authorize(logKey);

    const imgProp = data.clearImg
      ? { img: { files: [] } }
      : data.imgUrl
      ? { img: { files: [{ type: "external", external: { url: data.imgUrl } }] } }
      : {};

    await notion.pages.update({
      page_id: pageId,
      properties: {
        title: { title: [{ text: { content: data.title } }] },
        content: { rich_text: [{ text: { content: data.content } }] },
        description: { rich_text: [{ text: { content: data.description } }] },
        start_date: data.start_date ? { date: { start: data.start_date } } : { date: null },
        end_date: data.end_date ? { date: { start: data.end_date } } : { date: null },
        ...imgProp,
      } as any,
    });
    return { ok: true };
  } catch (e) {
    console.error("[updateProfileItem]", e);
    return { ok: false, error: String(e) };
  }
}
