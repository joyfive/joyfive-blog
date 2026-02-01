// src/app/blog/[category]/page.tsx
import Link from "next/link"
import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory"
import { fetchCategories } from "@/lib/notion/fetchCategories"

export default async function ProjectPage() {

  // 데이터 병렬 페칭
  const [posts] = await Promise.all([
    fetchPostsByCategory("projects", "")
  ])

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mt-4 capitalize">Project</h1>
        <p className="text-gray-500 mt-2">
          {posts.length}개의 포스트가 있습니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">


        {/* 게시글 리스트 */}
        <section className="flex-1">
          <div className="grid gap-10">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`projects/${post.path}`}>
                    <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <time className="text-sm text-gray-400 mt-4 block">
                      {new Date(post.updated_at).toLocaleDateString("ko-KR")}
                    </time>
                  </Link>
                </article>
              ))
            ) : (
              <p className="text-gray-500 py-20 text-center border-2 border-dashed rounded-xl">
                이 카테고리에 작성된 글이 아직 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
