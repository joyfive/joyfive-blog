import { fetchPostByPage } from "@/lib/notion/fetchPostByPage";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer";

export default async function ResumePage() {
  const postData = await fetchPostByPage('resume');

  if (!postData) return notFound();

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <article className="notion-content">
        <NotionDetailRenderer recordMap={postData.recordMap} />
      </article>
    </main>
  );
}