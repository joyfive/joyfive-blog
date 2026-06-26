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
    const errBody = await initRes.text();
    console.error("[upload init]", initRes.status, errBody);
    return NextResponse.json(
      { error: `Notion init (${initRes.status}): ${errBody}` },
      { status: 500 }
    );
  }

  const initJson = await initRes.json();
  const fileId: string = initJson.id;
  const uploadUrl: string = initJson.upload_url;

  // 2단계: 파일 바이너리 업로드 (S3 presigned URL — Notion 헤더 제외)
  const arrayBuffer = await file.arrayBuffer();
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: arrayBuffer,
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    console.error("[upload put]", putRes.status, errBody);
    return NextResponse.json(
      { error: `S3 upload (${putRes.status}): ${errBody}` },
      { status: 500 }
    );
  }

  // 3단계: 업로드 완료
  const completeRes = await fetch(
    `https://api.notion.com/v1/files/${fileId}/complete`,
    { method: "POST", headers }
  );

  if (!completeRes.ok) {
    const errBody = await completeRes.text();
    console.error("[upload complete]", completeRes.status, errBody);
    return NextResponse.json(
      { error: `Notion complete (${completeRes.status}): ${errBody}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ fileId });
}
