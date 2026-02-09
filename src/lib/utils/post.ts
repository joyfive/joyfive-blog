// src/lib/utils/post.ts
import {
  NotionTitleProp,
  NotionRichTextProp,
  NotionSelectProp,
  NotionMultiSelectProp,
  NotionDateProp,
  BlogPost,
} from "@/types/blog"

export function getTitle(prop: NotionTitleProp): string {
  return prop?.title?.[0]?.plain_text ?? ""
}

export function getRichText(prop: NotionRichTextProp): string {
  return prop?.rich_text?.[0]?.plain_text ?? ""
}

export function getSelect(prop: NotionSelectProp): string {
  return prop?.select?.name ?? ""
}

export function getMultiSelect(prop: NotionMultiSelectProp): string[] {
  return prop?.multi_select?.map((t) => t.name) ?? []
}

export function getDate(prop: NotionDateProp): string {
  // 노션 API에서 last_edited_time 타입은 해당 필드 안에 string 값이 바로 들어있습니다.
  return prop?.last_edited_time ?? ""
}

// src/lib/utils/post.ts 에 추가

/**
 * 동일한 path를 가진 게시글이 여러 개일 경우,
 * 데이터 무결성을 위해 리스트에서 모두 제외합니다.
 */
export function filterUniquePosts(posts: BlogPost[]): BlogPost[] {
  // 1. "category/path" 조합으로 카운팅
  const comboCounts = posts.reduce((acc, post) => {
    const key = `${post.category}/${post.path}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 2. 해당 조합이 정확히 1번인 것만 통과
  return posts.filter((post) => {
    const key = `${post.category}/${post.path}`
    const isUnique = comboCounts[key] === 1

    if (!isUnique) {
      console.warn(`[Validation Error] 중복된 카테고리 내 경로 발견: ${key}`)
    }
    return isUnique
  })
}

// 커버 이미지 URL 추출 유틸리티
export function getCoverImage(page: any): string | null {
  if (!page.cover) return null;

  if (page.cover.type === "external") {
    return page.cover.external.url;
  }
  if (page.cover.type === "file") {
    return page.cover.file.url;
  }
  return null;
}
// 본문 블록에서 순수 텍스트만 추출하여 요약본 만들기
export function getExcerptFromBlocks(blocks: any[]): string {
  return blocks
    .filter(block =>
      ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item'].includes(block.type)
    )
    .map(block => {
      const type = block.type;
      return block[type].rich_text.map((t: any) => t.plain_text).join("");
    })
    .join(" ")
    .slice(0, 150); // 갤러리 카드에 적절한 150자 내외
}