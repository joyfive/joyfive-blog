// src/lib/notion/fetchPostByPath.ts
import { notion } from "./client"
import { NotionAPI } from "notion-client"
import { NotionRawResponse } from "@/types/blog"

const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN,
})

export async function fetchPostByPage(page: string) {
  try {
    // 1. 카테고리와 패스가 동시에 일치하는 데이터 쿼리
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          { property: "page", select: { equals: page } },
        ],
      },
    })

    const notionPage = response.results[0] as unknown as NotionRawResponse

    // 2. 해당 페이지의 블록 데이터 가져오기
    const recordMap = await notionClient.getPage(notionPage.id)

    return {
      recordMap,
      properties: notionPage.properties,
    }
  } catch (error) {
    console.error("fetchPostByPage error:", error)
    return null
  }
}
