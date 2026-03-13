// src/lib/notion/fetchAllPostsForSitemap.ts
// 사이트맵 생성용 — 블록 없이 path/category/published_at만 조회
import { notion } from "./client"
import { getTitle, getRichText, getSelect, getMultiSelect, getDate, filterUniquePosts } from "@/lib/utils/post"
import { NotionRawResponse } from "@/types/blog"

export async function fetchAllPostsForSitemap(pageName: string) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        { property: "page", select: { equals: pageName } },
        { property: "path", rich_text: { is_not_empty: true } },
      ],
    },
    sorts: [{ property: "published_at", direction: "descending" }],
  })

  const posts = (response.results as unknown as NotionRawResponse[]).map((page) => ({
    id: page.id,
    title: getTitle(page.properties.title),
    path: getRichText(page.properties.path),
    category: getSelect(page.properties.category),
    tags: getMultiSelect(page.properties.tags),
    published_at: getDate(page.properties.published_at),
  }))

  return filterUniquePosts(posts)
}
