import { NextRequest, NextResponse } from "next/server";
import { NotionAPI } from "notion-client";
import { notion } from "@/lib/notion/client";
import { sanitizeRecordMap } from "@/lib/notion/sanitizeRecordMap";
import { extractFirstImageUrl, OG_FALLBACK_IMAGE } from "@/lib/utils/og";

const notionClient = new NotionAPI({ authToken: process.env.NOTION_TOKEN });

const fallback = () => NextResponse.redirect(OG_FALLBACK_IMAGE, { status: 302 });

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

    // 신선한 signed URL을 매번 Notion에서 발급받아 이미지 바이트로 서빙
    const raw = await notionClient.getPage(pageId);
    const recordMap = sanitizeRecordMap(raw);
    const imageUrl = extractFirstImageUrl(recordMap);

    if (!imageUrl) return fallback();

    const imageRes = await fetch(imageUrl, { cache: "no-store" });
    if (!imageRes.ok) return fallback();

    const data = await imageRes.arrayBuffer();
    return new NextResponse(data, {
      headers: {
        "Content-Type": imageRes.headers.get("content-type") ?? "image/jpeg",
        // 이미지 바이트를 캐싱 — signed URL 만료와 무관하게 안정적으로 서빙
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
      },
    });
  } catch {
    return fallback();
  }
}
