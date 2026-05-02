// src/lib/notion/fetchPostByPath.ts
import { cache } from "react"
import { notion } from "./client"
import { NotionAPI } from "notion-client"
import { NotionRawResponse } from "@/types/blog"
import { sanitizeRecordMap } from "./sanitizeRecordMap"

const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN,
})

export const fetchPostByPath = cache(async function fetchPostByPath(page: string, category: string, path: string) {
  try {
    // 1. 카테고리와 패스가 동시에 일치하는 데이터 쿼리
    const filters: any[] = [
      { property: "page", select: { equals: page } },
      { property: "path", rich_text: { equals: path } },
      { property: "path", rich_text: { is_not_empty: true } },
    ];
    // category가 비어있으면 필터 생략 (projects처럼 category 미사용 페이지 대응)
    if (category) {
      filters.push({ property: "category", select: { equals: category } });
    }

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: { and: filters },
    })
    if (response.results.length !== 1) {
      if (response.results.length > 1) {
        console.warn(
          `[Validation Error] 중복된 경로 발견: category=${category}, path=${path}`
        )
      }
      return null
    }
    const notionPage = response.results[0] as unknown as NotionRawResponse

    // 2. 해당 페이지의 블록 데이터 가져오기
    const raw = await notionClient.getPage(notionPage.id)
    const recordMap = sanitizeRecordMap(raw)

    return {
      id: notionPage.id,
      recordMap,
      properties: notionPage.properties,
    }
  } catch (error) {
    console.error("fetchPostByPath error:", error)
    return null
  }
})
