// src/lib/notion/fetchPostByPath.ts
import { notion } from "./client"
import { NotionAPI } from "notion-client"
import { NotionRawResponse } from "@/types/blog"

const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN,
})

export async function fetchPostByPath(category: string, path: string) {
  try {
    // 1. 카테고리와 패스가 동시에 일치하는 데이터 쿼리
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          { property: "category", select: { equals: category } },
          { property: "path", rich_text: { equals: path } },
          { property: "path", rich_text: { is_not_empty: true } }, // 안전장치 추가
        ],
      },
    })

    if (response.results.length !== 1) {
      if (response.results.length > 1) {
        console.warn(
          `[Validation Error] 중복된 경로 발견: category=${category}, path=${path}`
        )
      }
      return null
    }
    const page = response.results[0] as unknown as NotionRawResponse

    // 2. 해당 페이지의 블록 데이터 가져오기
    const recordMap = await notionClient.getPage(page.id)

    return {
      recordMap,
      properties: page.properties,
    }
  } catch (error) {
    console.error("fetchPostByPath error:", error)
    return null
  }
}
