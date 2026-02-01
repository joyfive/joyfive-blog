// src/lib/notion/fetchRecentPosts.ts
import { notion } from "./client"
import { BlogPost, NotionRawResponse } from "@/types/blog"
import {
  getTitle,
  getRichText,
  getSelect,
  getMultiSelect,
  getDate,
  filterUniquePosts,
} from "@/lib/utils/post"

export async function fetchRecentPosts(limit: number = 5): Promise<BlogPost[]> {
  // 1. 여유 있게 최근 15건을 가져옵니다. (중복/작성중 제외 대비)
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: "path",
      rich_text: {
        is_not_empty: true, // 1차 필터: path가 비어있지 않은 것 (작성중 제외)
      },
    },
    sorts: [
      {
        property: "updated_at",
        direction: "descending", // 최신 수정 순서
      },
    ],
    page_size: 15,
  })

  // 2. 노션 데이터를 BlogPost 타입으로 매핑
  const allPosts = (response.results as unknown as NotionRawResponse[]).map(
    (page) => {
      const props = page.properties
      return {
        id: page.id,
        title: getTitle(props.title),
        path: getRichText(props.path),
        category: getSelect(props.category),
        tags: getMultiSelect(props.tags),
        updated_at: getDate(props.updated_at),
      }
    }
  )

  // 3. 2차 필터: [카테고리 + 패스] 중복 건 전면 제외
  // (우리가 만든 filterUniquePosts 유틸리티 사용)
  const validatedPosts = filterUniquePosts(allPosts)

  // 4. 최종적으로 검증된 데이터 중 상위 5개(limit)만 반환
  return validatedPosts.slice(0, limit)
}
