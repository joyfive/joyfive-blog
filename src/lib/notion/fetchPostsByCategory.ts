// src/lib/notion/fetchPostsByCategory.ts
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

export async function fetchPostsByCategory(
  pageName: string, categoryName: string
): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        {
          property: "page", // 노션 DB의 컬럼명
          select: {
            equals: pageName,
          },
        },
        {
          property: "category", // 노션 DB의 컬럼명
          select: {
            equals: categoryName,
          },
        },
        {
          property: "path",
          rich_text: {
            is_not_empty: true,
          },
        },
      ],
    },
    sorts: [
      {
        property: "updated_at", // 노션 DB의 컬럼명
        direction: "descending",
      },
    ],
  })

  // 유틸 함수를 통해 각 property 컬럼의 값을 추출합니다.
  const allPosts = (response.results as unknown as NotionRawResponse[]).map(
    (page) => ({
      id: page.id,
      title: getTitle(page.properties.title),
      path: getRichText(page.properties.path),
      category: getSelect(page.properties.category),
      tags: getMultiSelect(page.properties.tags),
      updated_at: getDate(page.properties.updated_at),
    })
  )

  // 2차 필터: 중복된 path가 있다면 리스트에서 제거
  const validatedPosts = filterUniquePosts(allPosts)

  // 최종적으로 limit만큼 잘라서 반환
  return validatedPosts.slice(0, 100)
}
