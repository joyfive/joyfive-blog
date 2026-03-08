import { notion } from "./client";

export interface ProfileItem {
  id: string;
  title: string;
  content: string[];      // rich_text → \n으로 분리
  description: string[];  // rich_text → \n으로 분리
  img: string;
  start_date: string;     // "YYYY.MM.DD"
  end_date: string;       // "YYYY.MM.DD" (없으면 "")
}

function parseRichTextLines(prop: any): string[] {
  if (!prop?.rich_text?.length) return [];
  const text = prop.rich_text.map((t: any) => t.plain_text).join("");
  return text.split("\n").map((s: string) => s.trim()).filter(Boolean);
}

function getFileUrl(prop: any): string {
  const file = prop?.files?.[0];
  if (!file) return "";
  return file.type === "external" ? file.external.url : (file.file?.url ?? "");
}

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, ".");
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
    const endRaw = page.properties.end_date?.date?.start ?? "";
    return {
      id: page.id,
      title: page.properties.title?.title?.map((t: any) => t.plain_text).join("") ?? "",
      content: parseRichTextLines(page.properties.content),
      description: parseRichTextLines(page.properties.description),
      img: getFileUrl(page.properties.img),
      start_date: startRaw ? formatDate(startRaw) : "",
      end_date: endRaw ? formatDate(endRaw) : "",
    };
  });
}
