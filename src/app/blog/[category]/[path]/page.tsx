import { fetchPostByPath } from "@/lib/notion/fetchPostByPath";
import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory";
import { getTitle, getMultiSelect, getDate, getRichText } from "@/lib/utils/post";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer";
import PostDetailHeader from "@/components/blog/PostDetailHeader";
import { DesktopTOC, MobileTOC } from "@/components/blog/TableOfContents";
import { extractHeadings } from "@/lib/utils/toc";
import RelatedPosts from "@/components/blog/RelatedPosts";

interface Props {
  params: { category: string; path: string };
}

export default async function PostDetailPage({ params }: Props) {
  const { path, category } = params;

  const [postData, relatedPostsRaw] = await Promise.all([
    fetchPostByPath("blog", category, path),
    fetchPostsByCategory("blog", category, false),
  ]);

  if (!postData) return notFound();

  const title = getTitle(postData.properties.title);
  const publishedAt = getDate(postData.properties.published_at);
  const tags = getMultiSelect(postData.properties.tags);
  const currentPath = getRichText(postData.properties.path);

  const headings = extractHeadings(postData.recordMap);
  const relatedPosts = relatedPostsRaw
    .filter((p) => p.path !== currentPath)
    .slice(0, 3);

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <PostDetailHeader
        category={category}
        publishedAt={publishedAt}
        title={title}
        tags={tags}
      />

      <div className="flex gap-12 items-start">
        <article className="flex-1 min-w-0 notion-content">
          <NotionDetailRenderer recordMap={postData.recordMap} />
        </article>
        <DesktopTOC headings={headings} />
      </div>

      <MobileTOC headings={headings} />

      <RelatedPosts posts={relatedPosts} category={category} />
    </main>
  );
}
