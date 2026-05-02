const BASE_URL = "https://joyfive-blog.vercel.app";
export const OG_FALLBACK_IMAGE = `${BASE_URL}/og-image.png`;

// 텍스트를 포함하는 블록 타입 (react-notion-x recordMap 기준)
const TEXT_BLOCK_TYPES = new Set([
  "text",
  "quote",
  "bulleted_list",
  "numbered_list",
  "toggle",
  "to_do",
  "callout",
]);

/**
 * recordMap에서 텍스트 블록을 순서대로 읽어 maxLen자로 말줄임 처리한 문자열 반환
 */
export function extractOgDescription(recordMap: any, maxLen = 100): string {
  if (!recordMap?.block) return "";

  const pageBlock = Object.values(recordMap.block as Record<string, any>).find(
    (b) => b?.value?.type === "page"
  );
  if (!pageBlock?.value?.content) return "";

  const parts: string[] = [];
  let totalLen = 0;

  function traverse(blockIds: string[]) {
    for (const blockId of blockIds) {
      if (totalLen >= maxLen) return;
      const blockData = recordMap.block[blockId];
      if (!blockData?.value) continue;
      const block = blockData.value;

      if (TEXT_BLOCK_TYPES.has(block.type) && block.properties?.title) {
        const text = block.properties.title
          .map((chunk: any[]) => chunk[0])
          .join("")
          .trim();
        if (text) {
          parts.push(text);
          totalLen += text.length;
        }
      }

      if (block.content) traverse(block.content);
    }
  }

  traverse(pageBlock.value.content);
  const full = parts.join(" ");
  if (full.length <= maxLen) return full;
  return full.slice(0, maxLen) + "…";
}

/**
 * recordMap에서 첫 번째 이미지 블록의 URL 반환. 없으면 null.
 */
export function extractFirstImageUrl(recordMap: any): string | null {
  if (!recordMap?.block) return null;

  const pageBlock = Object.values(recordMap.block as Record<string, any>).find(
    (b) => b?.value?.type === "page"
  );
  if (!pageBlock?.value?.content) return null;

  const signedUrls = recordMap.signed_urls as Record<string, string> | undefined;

  function traverse(blockIds: string[]): string | null {
    for (const blockId of blockIds) {
      const blockData = recordMap.block[blockId];
      if (!blockData?.value) continue;
      const block = blockData.value;

      if (block.type === "image") {
        // signed_urls 우선 — notion-client가 authToken으로 발급한 서명 URL (1시간 유효)
        // source[0][0]은 서명 없는 S3 URL이라 크롤러 접근 시 403 반환
        const url =
          signedUrls?.[blockId] ?? block.properties?.source?.[0]?.[0];
        if (url) return url;
      }

      if (block.content) {
        const found = traverse(block.content);
        if (found) return found;
      }
    }
    return null;
  }

  return traverse(pageBlock.value.content);
}

/**
 * 첫 번째 이미지 URL 반환. 없으면 사이트 공통 og-image.png 폴백.
 */
export function getOgImage(recordMap: any): string {
  return extractFirstImageUrl(recordMap) ?? OG_FALLBACK_IMAGE;
}
