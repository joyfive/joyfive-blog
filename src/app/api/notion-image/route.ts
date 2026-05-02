import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  // Notion 서명 URL은 1시간 유효 — 4분 캐싱으로 항상 신선한 URL 확보
  const pageRes = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY!}`,
      "Notion-Version": "2022-06-28",
    },
    next: { revalidate: 240 },
  });

  if (!pageRes.ok) return new NextResponse("Notion error", { status: 502 });

  const page = await pageRes.json();
  const file = page?.properties?.img?.files?.[0];
  if (!file) return new NextResponse("No image", { status: 404 });

  const imageUrl: string =
    file.type === "external" ? file.external.url : (file.file?.url ?? "");
  if (!imageUrl) return new NextResponse("No image URL", { status: 404 });

  const imageRes = await fetch(imageUrl, { cache: "no-store" });
  if (!imageRes.ok) return new NextResponse("Upstream error", { status: 502 });

  const data = await imageRes.arrayBuffer();
  return new NextResponse(data, {
    headers: {
      "Content-Type": imageRes.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=240, stale-while-revalidate=60",
    },
  });
}
