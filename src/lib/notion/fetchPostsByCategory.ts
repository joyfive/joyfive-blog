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
  getCoverImage,
  getExcerptFromBlocks // utils에 추가한 본문 요약 함수
} from "@/lib/utils/post"

export async function fetchPostsByCategory(
  pageName: string,
  categoryName: string,
  needImage: boolean
): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      and: [
        { property: "page", select: { equals: pageName } },
        { property: "category", select: { equals: categoryName } },
        { property: "path", rich_text: { is_not_empty: true } },
      ],
    },
    sorts: [{ property: "updated_at", direction: "descending" }],
  })

  const results = response.results as any[];

  const postsWithImages = await Promise.all(
    results.map(async (page) => {
      let coverImage = "/images/empty.png"; // 기본 이미지 세팅
      let excerpt = ""; // 본문 요약 기본값

      // 이미지가 필요하거나 본문 요약이 필요한 경우(프로젝트 갤러리 뷰 등)
      if (needImage) {
        // 1. 우선 페이지 커버 이미지 확인
        const notionCover = getCoverImage(page);

        // 2. 본문 블록 조회 (이미지 추출 및 텍스트 요약용)
        const blocks = await notion.blocks.children.list({ block_id: page.id });

        // 본문 내 첫 번째 이미지 찾기
        const firstImageBlock = blocks.results.find((block: any) => block.type === 'image') as any;

        if (notionCover) {
          coverImage = notionCover;
        } else if (firstImageBlock) {
          coverImage = firstImageBlock.image.type === 'external'
            ? firstImageBlock.image.external.url
            : firstImageBlock.image.file.url;
        }

        // 3. 본문 텍스트 요약 생성
        excerpt = getExcerptFromBlocks(blocks.results);
      }

      return {
        id: page.id,
        title: getTitle(page.properties.title),
        path: getRichText(page.properties.path),
        category: getSelect(page.properties.category),
        tags: getMultiSelect(page.properties.tags),
        updated_at: getDate(page.properties.updated_at),
        coverImage: coverImage,
        excerpt: excerpt, // 프로젝트 카드에서 보여줄 동적 텍스트
      };
    })
  );

  const validatedPosts = filterUniquePosts(postsWithImages);
  return validatedPosts.slice(0, 100);
}