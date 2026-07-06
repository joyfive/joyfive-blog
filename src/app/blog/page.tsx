export const dynamic = "force-dynamic";

import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory";
import { fetchCategories } from "@/lib/notion/fetchCategories";
import CategoryNav from "@/components/blog/CategoryNav";
import BlogPostItem from "@/components/blog/BlogPostItem";
import PageHeader from "@/components/layout/PageHeader";
import Pagination from "@/components/blog/Pagination";

const POSTS_PER_PAGE = 10;

interface Props {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: Props) {
  const [allPosts, categories] = await Promise.all([
    fetchPostsByCategory("blog", "", false),
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
      <PageHeader title="Blog" description="읽고, 만들고, 생각한 것들을 남깁니다." />

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-48 shrink-0">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            Categories
          </h2>
          <CategoryNav categories={categories} />
        </aside>

        <section className="flex-1">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-8">
            All Posts
          </h2>
          {posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <BlogPostItem key={post.id} post={post} />
              ))}
              <Pagination basePath="/blog" currentPage={currentPage} totalPages={totalPages} />
            </>
          ) : (
            <p className="text-stone-400 py-12">곧 채워질 예정입니다.</p>
          )}
        </section>
      </div>
    </main>
  );
}
