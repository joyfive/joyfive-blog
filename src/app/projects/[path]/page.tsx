export const revalidate = 300;

import { fetchPostByPath } from "@/lib/notion/fetchPostByPath";
import { getTitle, getMultiSelect, getDate } from "@/lib/utils/post";
import { extractOgDescription, getOgImage } from "@/lib/utils/og";
import { notFound } from "next/navigation";
import { NotionDetailRenderer } from "@/components/notion/NotionDetailRenderer";
import PostHeader from "@/components/layout/PostHeader";
import type { Metadata } from "next";

interface Props {
  params: { path: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPostByPath("projects", "", params.path);
  if (!post) return {};

  const title = getTitle(post.properties.title);
  const description = extractOgDescription(post.recordMap) || "오늘의 기쁨 프로젝트";
  const ogImage = getOgImage(post.recordMap);

  return {
    title: `${title} | 오늘의 기쁨`,
    description,
    openGraph: {
      title,
      description,
      url: `https://joyfive-blog.vercel.app/projects/${params.path}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
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