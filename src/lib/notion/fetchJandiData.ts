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

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 89);
  const startStr = toDateStr(start);

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
        date: raw.slice(0, 10),
      };
    })
    .filter((r) => r.type && r.date >= startStr);
}
