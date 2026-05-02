import { NextRequest, NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { OG_FALLBACK_IMAGE } from "@/lib/utils/og";

const fallback = () => NextResponse.redirect(OG_FALLBACK_IMAGE, { status: 302 });

async function findFirstImageUrl(blockId: string, depth = 2): Promise<string | null> {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 20,
  });

  for (const block of response.results) {
    const b = block as any;
    if (b.type === "image") {
      // 공식 API는 업로드 이미지에 fresh signed URL, 외부 이미지는 external.url 반환
      return b.image?.file?.url ?? b.image?.external?.url ?? null;
    }
    if (b.has_children && depth > 0) {
      const nested = await findFirstImageUrl(b.id, depth - 1);
      if (nested) return nested;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page") ?? "blog";
  const category = searchParams.get("category") ?? "";
  const path = searchParams.get("path") ?? "";

  if (!path) return fallback();

  try {
    const filters: any[] = [
      { property: "page", select: { equals: page } },
      { property: "path", rich_text: { equals: path } },
      { property: "path", rich_text: { is_not_empty: true } },
    ];
    if (category) filters.push({ property: "category", select: { equals: category } });

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: { and: filters },
    });

    if (response.results.length !== 1) return fallback();
    const pageId = (response.results[0] as any).id;

    const imageUrl = await findFirstImageUrl(pageId);
    if (!imageUrl) return fallback();

    // 이미지 바이트로 서빙 — signed URL 만료와 무관하게 캐시 기간 동안 안정적으로 서빙
    const imageRes = await fetch(imageUrl, { cache: "no-store" });
    if (!imageRes.ok) return fallback();

    const data = await imageRes.arrayBuffer();
    return new NextResponse(data, {
      headers: {
        "Content-Type": imageRes.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
      },
    });
  } catch {
    return fallback();
  }
}
