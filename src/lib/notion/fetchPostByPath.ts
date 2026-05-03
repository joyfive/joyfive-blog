// src/lib/notion/fetchPostByPath.ts
import { cache } from "react"
import { notion } from "./client"
import { NotionAPI } from "notion-client"
import { NotionRawResponse } from "@/types/blog"
import { sanitizeRecordMap } from "./sanitizeRecordMap"

const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN,
})

// Notion 서버는 loadPageChunk limit 파라미터를 ~100으로 캡핑한다.
// 초과 블록을 syncRecordValuesMain(getBlocks)으로 가져오면 인증 없이 null 반환.
// cursor 기반 loadPageChunk 페이지네이션으로 직접 모든 블록을 수집한다.
async function fetchAllBlocksViaCursor(pageId: string): Promise<Record<string, any>> {
  const allBlocks: Record<string, any> = {}
  let cursor: any = { stack: [] }

  do {
    const response: any = await (notionClient as any).fetch({
      endpoint: "loadPageChunk",
      body: {
        pageId,
        limit: 100,
        cursor,
        chunkNumber: 0,
        verticalColumns: false,
      },
    })
    Object.assign(allBlocks, response?.recordMap?.block ?? {})
    cursor = response?.cursor ?? { stack: [] }
  } while (cursor?.stack?.length > 0)

  return allBlocks
}

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

    // 2. cursor 페이지네이션으로 전체 블록 수집 후 getPage로 컬렉션·서명URL 처리
    const [allBlocks, raw] = await Promise.all([
      fetchAllBlocksViaCursor(notionPage.id),
      notionClient.getPage(notionPage.id, { fetchMissingBlocks: false }),
    ])
    raw.block = { ...raw.block, ...allBlocks }

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
