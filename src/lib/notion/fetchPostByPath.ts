// src/lib/notion/fetchPostByPath.ts
import { notion } from "./client"
import { NotionAPI } from "notion-client"
import { NotionRawResponse } from "@/types/blog"
import { sanitizeRecordMap } from "./sanitizeRecordMap"

const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN,
})

export async function fetchPostByPath(page: string, category: string, path: string) {
  try {
    // 1. 카테고리와 패스가 동시에 일치하는 데이터 쿼리
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          { property: "page", select: { equals: page } },
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
    const notionPage = response.results[0] as unknown as NotionRawResponse

    // 2. 해당 페이지의 블록 데이터 가져오기
    const raw = await notionClient.getPage(notionPage.id)
    const recordMap = sanitizeRecordMap(raw)

    // --- DEBUG: recordMap 진단 로그 ---
    const blockKeys = Object.keys(recordMap?.block ?? {})
    const rootId = blockKeys[0]
    const rootEntry = recordMap?.block?.[rootId]
    console.log('[DEBUG] recordMap 블록 수:', blockKeys.length)
    console.log('[DEBUG] 루트 블록 ID:', rootId)
    console.log('[DEBUG] 루트 value 존재:', !!rootEntry?.value)
    console.log('[DEBUG] 루트 content 길이:', rootEntry?.value?.content?.length ?? 'N/A')
    console.log('[DEBUG] value가 null인 블록 수:', blockKeys.filter(k => !recordMap.block[k]?.value).length)
    // --- END DEBUG ---

    return {
      id: notionPage.id,
      recordMap,
      properties: notionPage.properties,
    }
  } catch (error) {
    console.error("fetchPostByPath error:", error)
    return null
  }
}
