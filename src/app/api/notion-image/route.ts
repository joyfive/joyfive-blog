import { NextRequest, NextResponse } from "next/server";
import { notion } from "@/lib/notion/client";
import { unstable_cache } from "next/cache";

const fetchNotionImageUrl = unstable_cache(
  async (pageId: string): Promise<string> => {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const file = (page as any).properties?.img?.files?.[0];
    if (!file) return "";
    return file.type === "external"
      ? file.external.url
      : (file.file?.url ?? "");
  },
  ["notion-img-url"],
  { revalidate: 300 }
);

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const notionUrl = await fetchNotionImageUrl(id);
  if (!notionUrl) return new NextResponse("Not found", { status: 404 });

  const res = await fetch(notionUrl);
  if (!res.ok) return new NextResponse("Upstream error", { status: 502 });

  const data = await res.arrayBuffer();
  return new NextResponse(data, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
