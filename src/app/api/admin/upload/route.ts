import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key || !process.env.LOG_KEY || key !== process.env.LOG_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const apiKey = process.env.NOTION_API_KEY!;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
  };

  // 1단계: 업로드 초기화
  const initRes = await fetch("https://api.notion.com/v1/files", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "single_part",
      filename: file.name,
      content_type: file.type,
    }),
  });

  if (!initRes.ok) {
    const err = await initRes.text();
    console.error("[upload init]", err);
    return NextResponse.json({ error: "Init failed" }, { status: 500 });
  }

  const { id: fileId, upload_url: uploadUrl } = await initRes.json();

  // 2단계: 파일 바이너리 업로드
  const arrayBuffer = await file.arrayBuffer();
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: arrayBuffer,
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    console.error("[upload put]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // 3단계: 업로드 완료
  const completeRes = await fetch(
    `https://api.notion.com/v1/files/${fileId}/complete`,
    { method: "POST", headers }
  );

  if (!completeRes.ok) {
    const err = await completeRes.text();
    console.error("[upload complete]", err);
    return NextResponse.json({ error: "Complete failed" }, { status: 500 });
  }

  return NextResponse.json({ fileId });
}
