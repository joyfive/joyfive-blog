import { fetchPostByPath } from "@/lib/notion/fetchPostByPath";
import { getTitle, getMultiSelect, getDate } from "@/lib/utils/post";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer";
import PostHeader from "@/components/layout/PostHeader";

interface Props {
  params: { category: string; path: string };
}

export default async function PostDetailPage({ params }: Props) {
  const { path, category } = params;
  const postData = await fetchPostByPath("blog", category, path);

  if (!postData) return notFound();

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <PostHeader
        title={getTitle(postData.properties.title)}
        updatedAt={getDate(postData.properties.published_at)}
        tags={getMultiSelect(postData.properties.tags)}
        backHref={`/blog/${category}`}
        backLabel={category}
      />
      <article className="notion-content">
        <NotionDetailRenderer recordMap={postData.recordMap} />
      </article>
    </main>
  );
}