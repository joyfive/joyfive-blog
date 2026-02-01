// src/app/blog/page.tsx
import Link from "next/link"
import { fetchRecentPosts } from "@/lib/notion/fetchRecentPosts" // 새로 만든 함수
import { fetchCategories } from "@/lib/notion/fetchCategories" // Step 1에서 만든 함수

export default async function BlogPage() {
  // 최신글 5개와 카테고리 목록만 병렬로 페칭합니다.
  // 이제 전체 게시글(1000개 이상 가능성)을 불러오지 않으므로 매우 가볍습니다.
  const [recentPosts, categories] = await Promise.all([
    fetchRecentPosts(5),
    fetchCategories(),
  ])

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-stone-600">최신 소식과 생각을 공유합니다.</p>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        {/* LNB: 카테고리 메뉴 (비즈니스 로직은 공유, UI는 블로그용) */}
        <aside className="w-full md:w-48 shrink-0">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            Categories
          </h2>
          <nav className="flex flex-wrap md:flex-col gap-1">
            <Link
              href="/blog"
              className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 text-sm font-semibold transition-all"
            >
              All Posts
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/${category.name}`}
                className="px-4 py-2 rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-700 text-sm transition-all"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 메인 콘텐츠: 최신 게시글 5개 */}
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
                      <span className="text-xs font-bold px-2 py-1 bg-stone-100 text-stone-600 rounded">
                        {post.category}
                      </span>
                      <time className="text-xs text-stone-400">
                        {new Date(post.updated_at).toLocaleDateString("ko-KR")}
                      </time>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-stone-600 transition-colors">
                      {post.title}
                    </h3>
                    {/* 필요 시 요약(preview)을 추가할 수 있는 자리입니다 */}
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
