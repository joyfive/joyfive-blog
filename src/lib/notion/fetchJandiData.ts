import { notion } from "./client";

export interface JandiType {
  id: string;
  name: string;
  color: string;
}

export interface JandiRecord {
  type: string;
  date: string; // YYYY-MM-DD
}

function toKSTDateStr(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export async function fetchJandiTypes(): Promise<JandiType[]> {
  const db = await notion.databases.retrieve({
    database_id: process.env.NOTION_JANDI_DB_ID!,
  });

  const typeProp = db.properties["type"];
  if (typeProp?.type === "select") {
    return typeProp.select.options.map((opt: any) => ({
      id: opt.id,
      name: opt.name,
      color: opt.color,
    }));
  }
  return [];
}

export async function fetchJandiRecords(): Promise<JandiRecord[]> {
  const startStr = toKSTDateStr(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));

  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_JANDI_DB_ID!,
      sorts: [{ property: "created_at", direction: "ascending" }],
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    results.push(...response.results);
    cursor =
      response.has_more && response.next_cursor
        ? response.next_cursor
        : undefined;
  } while (cursor);

  return results
    .map((page: any) => {
      // created_time 타입과 date 타입 모두 대응
      const raw =
        page.properties.created_at?.created_time ??
        page.properties.created_at?.date?.start ??
        "";
      return {
        type: page.properties.type?.select?.name ?? "",
        date: raw ? toKSTDateStr(new Date(raw)) : "",
      };
    })
    .filter((r) => r.type && r.date >= startStr);
}
