import RoughTape from "@/components/layout/RoughTape";
import TagBadge from "@/components/layout/TagBadge";
import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project }: { project: any }) {
  const hasImage = project.coverImage && project.coverImage !== "/images/empty.png";

  return (
    <Link href={`/projects/${project.path}`}>
      <div className="relative group border border-stone-200 flex flex-col min-h-[400px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* 마스킹테이프 */}
        <RoughTape position="t" absolute randomRotate={false} />

        {/* 이미지 영역 */}
        {hasImage ? (
          <div className="relative aspect-video overflow-hidden border-b border-stone-100 bg-stone-50">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-video border-b border-dashed border-stone-200 bg-stone-50 p-6 flex items-center justify-center overflow-hidden">
            <p className="text-stone-400 italic text-sm leading-relaxed line-clamp-6 text-center">
              {project.excerpt || "No content preview available."}
            </p>
          </div>
        )}

        {/* 텍스트 영역 */}
        <div className="flex flex-col flex-1 p-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 group-hover:text-stone-600 transition-colors">
              {project.title}
            </h3>
            {hasImage && project.excerpt && (
              <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed">
                {project.excerpt}
              </p>
            )}
          </div>

          {project.tags?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-2">
              {project.tags.map((tag: string) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}