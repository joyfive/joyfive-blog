import Link from "next/link"
import { fetchRecentPosts } from "@/lib/notion/fetchRecentPosts"
import { fetchCategories } from "@/lib/notion/fetchCategories"
import CategoryNav from "@/components/blog/CategoryNav"

export default async function BlogPage() {
  const [recentPosts, categories] = await Promise.all([
    fetchRecentPosts(5),
    fetchCategories(),
  ])

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-stone-500">최신 소식과 생각을 공유합니다.</p>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-48 shrink-0">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            Categories
          </h2>
          <CategoryNav categories={categories} />
        </aside>

        <section className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recent Posts</h2>
            <Link
              href="/blog/all"
              className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
            >
              전체보기 →
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <article key={post.id} className="py-8 first:pt-0 group">
                  <Link
                    href={`/blog/${post.category}/${post.path}`}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-stone-500 border border-stone-200 px-2 py-0.5">
                        {post.category}
                      </span>
                      <time className="text-xs text-stone-400">
                        {new Date(post.published_at).toLocaleDateString("ko-KR")}
                      </time>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-stone-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                </article>
              ))
            ) : (
              <p className="text-stone-500 py-12">아직 작성된 글이 없습니다.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
