// src/app/blog/[category]/[path]/page.tsx
import { fetchPostByPath } from "@/lib/notion/fetchPostByPath";
import { getTitle } from "@/lib/utils/post";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer"; // 방금 만든 것
import Link from "next/link";

interface Props {
  params: { category: string; path: string };
}

export default async function PostDetailPage({ params }: Props) {
  const { path, category } = params;
  const postData = await fetchPostByPath(category, path);

  if (!postData) return notFound();

  const title = getTitle(postData.properties.title);

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-10">
        <div className="text-sm text-gray-400 mb-2">
          <Link href={`/blog/${category}`}>  {category} </Link>
        </div>
        <h1 className="text-4xl font-bold">{title}</h1>
      </header>

      <article className="notion-content">
        {/* 클라이언트 컴포넌트에 데이터만 전달합니다 */}
        <NotionDetailRenderer recordMap={postData.recordMap} />
      </article>
    </main>
  );
}