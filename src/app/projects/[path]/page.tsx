// src/app/blog/[category]/[path]/page.tsx
import { fetchPostByPath } from "@/lib/notion/fetchPostByPath";
import { getTitle, getMultiSelect, getDate } from "@/lib/utils/post";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer"; // 방금 만든 것
import Link from "next/link";

interface Props {
  params: { path: string };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { path } = params;
  const postData = await fetchPostByPath("project", "", path);
  console.log("postData", postData)

  if (!postData) return notFound();

  const title = getTitle(postData.properties.title);
  const tags = getMultiSelect(postData.properties.tags);
  const updated_at = getDate(postData.properties.updated_at);
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-10 flex flex-col gap-2">
        <div className="text-sm text-gray-400 mb-2">
          <Link href={`/projects`}>  모든 프로젝트</Link>

        </div>
        <div className="flex items-center justify-between"><h1>{title}</h1>
          <div className="text-sm text-gray-400 mb-2">
            게시일: {new Date(updated_at).toLocaleDateString("ko-KR")}
          </div></div>
        <div className="flex items-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-100 rounded-sm px-2 py-1 border border-gray-200">
              # {tag}
            </span>
          ))}</div>
      </header>

      <article className="notion-content">
        {/* 클라이언트 컴포넌트에 데이터만 전달합니다 */}
        <NotionDetailRenderer recordMap={postData.recordMap} />
      </article>
    </main>
  );
}