import Link from "next/link"
import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory"
import { fetchCategories } from "@/lib/notion/fetchCategories"
import CategoryNav from "@/components/blog/CategoryNav"
import TagBadge from "@/components/layout/TagBadge"

interface Props {
  params: { category: string }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = params

  const [posts, categories] = await Promise.all([
    fetchPostsByCategory("blog", category, false),
    fetchCategories(),
  ])

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-12">
        <Link href="/blog" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
          ← 전체 글 보기
        </Link>
        <h1 className="text-4xl font-bold mt-4 capitalize">{category}</h1>
        <p className="text-stone-400 mt-2 text-sm">{posts.length}개의 포스트</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-48 shrink-0">
          <CategoryNav categories={categories} showAllPosts={false} />
        </aside>

        <section className="flex-1">
          <div className="grid gap-10">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="group border-b border-stone-100 pb-10 last:border-0">
                  <Link href={`/blog/${post.category}/${post.path}`}>
                    <h3 className="text-2xl font-bold group-hover:text-stone-600 transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                    <time className="text-sm text-stone-400 mt-3 block">
                      {new Date(post.updated_at).toLocaleDateString("ko-KR")}
                    </time>
                  </Link>
                </article>
              ))
            ) : (
              <p className="text-stone-400 py-20 text-center border border-dashed border-stone-200">
                이 카테고리에 작성된 글이 아직 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
