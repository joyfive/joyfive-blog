import { fetchRecentPosts } from "@/lib/notion/fetchRecentPosts";
import { fetchCategories } from "@/lib/notion/fetchCategories";
import CategoryNav from "@/components/blog/CategoryNav";
import BlogPostItem from "@/components/blog/BlogPostItem";

export default async function BlogPage() {
  const [recentPosts, categories] = await Promise.all([
    fetchRecentPosts(5),
    fetchCategories(),
  ]);

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-stone-400 text-sm">읽고, 만들고, 생각한 것들을 남깁니다.</p>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-48 shrink-0">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            Categories
          </h2>
          <CategoryNav categories={categories} />
        </aside>

        <section className="flex-1">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-8">
            Recent Posts
          </h2>
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <BlogPostItem key={post.id} post={post} />
            ))
          ) : (
            <p className="text-stone-400 py-12">곧 채워질 예정입니다.</p>
          )}
        </section>
      </div>
    </main>
  );
}
