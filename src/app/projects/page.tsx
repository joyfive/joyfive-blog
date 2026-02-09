// src/app/projects/page.tsx (또는 해당 경로의 page.tsx)
import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory"
import ProjectCard from "@/components/layout/ProjectCard" // 아까 만든 컴포넌트 임포트

export default async function ProjectPage() {
  // 1. 데이터 페칭 (needImage: true)
  const posts = await fetchPostsByCategory("projects", "All", true)

  return (
    <main className="max-w-5xl mx-auto py-20 px-6">
      {/* 상단 헤더 영역 */}
      <div className="mb-16">
        <h1 className="text-5xl font-serif italic font-bold text-stone-900 tracking-tight">
          Project.
        </h1>
        <p className="text-stone-400 mt-4 font-mono text-sm uppercase tracking-widest">
          {posts.length} Selected Archives
        </p>
      </div>

      {/* 갤러리 그리드 레이아웃 */}
      <section>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
            {posts.map((post, index) => (
              <ProjectCard
                key={post.id}
                project={post}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="text-stone-400 font-serif italic text-xl border-t border-b py-10 border-stone-100">
              The workshop is currently being organized. <br />
              <span className="text-sm font-sans not-italic">프로젝트를 준비 중입니다.</span>
            </p>
          </div>
        )}
      </section>
    </main>
  )
}