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

function extractDate(prop: any): string {
  return prop?.type === "date" ? (prop.date?.start ?? "") : "";
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

export async function fetchTodayJandiTypes(): Promise<string[]> {
  const todayKST = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Seoul",
  });

  const response = await notion.databases.query({
    database_id: process.env.NOTION_JANDI_DB_ID!,
    filter: {
      property: "created_at",
      date: { equals: todayKST },
    },
  });

  const types = new Set<string>();
  for (const page of response.results) {
    const name = (page as any).properties.type?.select?.name;
    if (name) types.add(name);
  }
  return Array.from(types);
}

export async function fetchJandiRecords(): Promise<JandiRecord[]> {
  const startStr = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

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
      const date = extractDate(page.properties.created_at);
      return {
        type: page.properties.type?.select?.name ?? "",
        date,
      };
    })
    .filter((r) => r.type && r.date >= startStr);
}
