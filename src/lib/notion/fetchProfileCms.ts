import { notion } from "./client";

export interface ProfileItem {
  id: string;
  title: string;
  content: string[];      // rich_text → \n으로 분리한 불릿 목록
  description: string[];  // rich_text → \n으로 분리한 불릿 목록
  img: string;            // files 속성 (book 표지)
  start_date: string;     // date 속성 → "YYYY.MM.DD~" 형식
}

function parseRichTextBullets(prop: any): string[] {
  if (!prop?.rich_text?.length) return [];
  const text = prop.rich_text.map((t: any) => t.plain_text).join("");
  return text.split("\n").map((s: string) => s.trim()).filter(Boolean);
}

function getFileUrl(prop: any): string {
  const file = prop?.files?.[0];
  if (!file) return "";
  return file.type === "external" ? file.external.url : (file.file?.url ?? "");
}

function formatStartDate(dateStr: string): string {
  return dateStr.replace(/-/g, ".") + "~";
}

export async function fetchProfileItems(category: string): Promise<ProfileItem[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_PROFILE_DB_ID!,
    filter: {
      property: "category",
      select: { equals: category },
    },
  });

  return response.results.map((page: any) => {
    const startRaw = page.properties.start_date?.date?.start ?? "";
    return {
      id: page.id,
      title: page.properties.title?.title?.map((t: any) => t.plain_text).join("") ?? "",
      content: parseRichTextBullets(page.properties.content),
      description: parseRichTextBullets(page.properties.description),
      img: getFileUrl(page.properties.img),
      start_date: startRaw ? formatStartDate(startRaw) : "",
    };
  });
}
