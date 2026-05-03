// src/lib/notion/fetchPostByPage.ts
import { notion } from "./client"
import { NotionAPI } from "notion-client"
import { NotionRawResponse } from "@/types/blog"
import { sanitizeRecordMap } from "./sanitizeRecordMap"

const notionClient = new NotionAPI({
  authToken: process.env.NOTION_TOKEN,
})

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

export async function fetchPostByPage(page: string) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          { property: "page", select: { equals: page } },
        ],
      },
    })

    const notionPage = response.results[0] as unknown as NotionRawResponse

    const [allBlocks, raw] = await Promise.all([
      fetchAllBlocksViaCursor(notionPage.id),
      notionClient.getPage(notionPage.id, { fetchMissingBlocks: false }),
    ])
    raw.block = { ...raw.block, ...allBlocks }

    const recordMap = sanitizeRecordMap(raw)

    return {
      recordMap,
      properties: notionPage.properties,
    }
  } catch (error) {
    console.error("fetchPostByPage error:", error)
    return null
  }
}
