// src/lib/notion/fetchPostMeta.ts
// generateMetadata 전용 — 블록 fetch 없이 properties만 조회 (공식 API)
import { notion } from "./client"
import { getTitle, getMultiSelect } from "@/lib/utils/post"
import { NotionRawResponse } from "@/types/blog"

export async function fetchPostMeta(page: string, category: string, path: string) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        { property: "page", select: { equals: page } },
        { property: "category", select: { equals: category } },
        { property: "path", rich_text: { equals: path } },
        { property: "path", rich_text: { is_not_empty: true } },
      ],
    },
  })

  if (response.results.length !== 1) return null

  const notionPage = response.results[0] as unknown as NotionRawResponse
  return {
    title: getTitle(notionPage.properties.title),
    tags: getMultiSelect(notionPage.properties.tags),
  }
}
