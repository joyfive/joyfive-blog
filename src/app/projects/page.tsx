import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory"
import ProjectCard from "@/components/layout/ProjectCard"

export default async function ProjectPage() {
  const posts = await fetchPostsByCategory("projects", "All", true)

  return (
    <main className="max-w-5xl mx-auto py-20 px-6">
      <div className="mb-16">
        <h1 className="text-5xl font-serif italic font-bold text-stone-900 tracking-tight">
          Project.
        </h1>
        <p className="text-stone-400 mt-4 font-ibmplex text-sm">
          직접 만들어본 것들과 경험한 것들을 기록합니다.
        </p>
      </div>

      <section>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
            {posts.map((post) => (
              <ProjectCard key={post.id} project={post} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="text-stone-400 py-10">곧 채워질 예정입니다.</p>
          </div>
        )}
      </section>
    </main>
  )
}