// src/components/project/ProjectCard.tsx
import RoughCard from "@/components/layout/RoughCard";
import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project, index }: { project: any, index: number }) {
  // 이미지 우선순위: coverImage가 있으면 사용, 없으면 null
  const hasImage = project.coverImage && project.coverImage !== "/images/empty.png";

  return (
    <Link href={`/projects/${project.path}`}>
      <RoughCard
        tapes={["t"]}
        className="h-full flex flex-col group min-h-[400px]" // 최소 높이 설정으로 균형 유지
      >
        {/* 1. 이미지 영역 (우선순위 1, 2) */}
        {hasImage ? (
          <div className="relative aspect-video mb-6 overflow-hidden filter-rough border border-black/5 bg-stone-50">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          /* 2. 이미지가 아예 없을 때 출력되는 요약 텍스트 박스 (우선순위 3) */
          <div className="aspect-video mb-6 bg-stone-50 filter-rough border border-dashed border-stone-200 p-6 flex items-center justify-center overflow-hidden">
            <p className="text-stone-400 font-serif italic text-sm leading-relaxed line-clamp-6 text-center">
              {project.excerpt || "No content preview available."}
            </p>
          </div>
        )}

        {/* 3. 타이틀 영역 */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold font-serif italic mb-3 group-hover:text-stone-600 transition-colors">
            {project.title}
          </h3>

          {/* 이미지가 있을 때만 타이틀 아래에 짧은 요약 노출 (노션 갤러리 스타일) */}
          {hasImage && (
            <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed mb-4">
              {project.excerpt}
            </p>
          )}
        </div>

        {/* 4. 태그 영역 */}
        <div className="mt-auto pt-6 border-t border-dashed border-stone-200 flex flex-wrap gap-2">
          {project.tags?.map((tag: string) => (
            <span key={tag} className="text-[10px] font-mono border border-stone-200 px-2 py-0.5 text-stone-400 bg-white">
              #{tag}
            </span>
          ))}
        </div>
      </RoughCard>
    </Link>
  );
}