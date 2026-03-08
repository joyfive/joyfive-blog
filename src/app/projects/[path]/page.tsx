import { fetchPostByPath } from "@/lib/notion/fetchPostByPath";
import { getTitle, getMultiSelect, getDate } from "@/lib/utils/post";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer";
import PostHeader from "@/components/layout/PostHeader";

interface Props {
  params: { path: string };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { path } = params;
  const postData = await fetchPostByPath("project", "", path);

  if (!postData) return notFound();

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <PostHeader
        title={getTitle(postData.properties.title)}
        updatedAt={getDate(postData.properties.published_at)}
        tags={getMultiSelect(postData.properties.tags)}
        backHref="/projects"
        backLabel="모든 프로젝트"
      />
      <article className="notion-content">
        <NotionDetailRenderer recordMap={postData.recordMap} />
      </article>
    </main>
  );
}