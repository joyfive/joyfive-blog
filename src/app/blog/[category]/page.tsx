import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory";
import { fetchCategories } from "@/lib/notion/fetchCategories";
import CategoryNav from "@/components/blog/CategoryNav";
import BlogPostItem from "@/components/blog/BlogPostItem";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "@/components/blog/Pagination";
import { OG_FALLBACK_IMAGE } from "@/lib/utils/og";
import type { Metadata } from "next";

const POSTS_PER_PAGE = 10;

interface Props {
  params: { category: string };
  searchParams: { page?: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const { category } = params;
  return {
    title: `${category} | Blog | 오늘의 기쁨`,
    description: `${category} 카테고리의 포스트 모음`,
    openGraph: {
      title: `${category} | Blog | 오늘의 기쁨`,
      url: `https://joyfive-blog.vercel.app/blog/${category}`,
      images: [{ url: OG_FALLBACK_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_FALLBACK_IMAGE],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = params;

  const [allPosts, categories] = await Promise.all([
    fetchPostsByCategory("blog", category, false),
    fetchCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(searchParams.page) || 1), totalPages);
  const posts = allPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <PageHeader title={category} description={`${allPosts.length}개의 포스트`} />

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-48 shrink-0">
          <CategoryNav categories={categories} />
        </aside>

        <section className="flex-1">
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <BlogPostItem key={post.id} post={post} />
              ))}
              <Pagination
                basePath={`/blog/${category}`}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </>
          ) : (
            <p className="text-stone-400 py-20 text-center border border-dashed border-stone-200">
              곧 채워질 예정입니다.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
