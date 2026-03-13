import { fetchPostByPath } from "@/lib/notion/fetchPostByPath";
import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory";
import { fetchPostMeta } from "@/lib/notion/fetchPostMeta";
import { getTitle, getMultiSelect, getDate, getRichText } from "@/lib/utils/post";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer";
import PostDetailHeader from "@/components/blog/PostDetailHeader";
import { DesktopTOC, MobileTOC } from "@/components/blog/TableOfContents";
import { extractHeadings } from "@/lib/utils/toc";
import RelatedPosts from "@/components/blog/RelatedPosts";
import type { Metadata } from "next";

interface Props {
  params: { category: string; path: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, path } = params;
  const meta = await fetchPostMeta("blog", category, path);
  if (!meta) return {};

  const description = meta.tags.length > 0 ? meta.tags.join(", ") : "오늘의 기쁨 블로그";
  return {
    title: `${meta.title} | 오늘의 기쁨`,
    description,
    openGraph: {
      title: meta.title,
      description,
      url: `https://joyfive-blog.vercel.app/blog/${category}/${path}`,
    },
  };
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
