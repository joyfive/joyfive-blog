import Link from "next/link";
import TagBadge from "@/components/layout/TagBadge";

interface PostHeaderProps {
  title: string;
  updatedAt: string;
  tags: string[];
  backHref: string;
  backLabel: string;
}

export default function PostHeader({ title, updatedAt, tags, backHref, backLabel }: PostHeaderProps) {
  return (
    <header className="border-b border-stone-100 pb-8 mb-8 flex flex-col gap-2">
      <div className="text-sm text-stone-400 mb-2">
        <Link href={backHref} className="hover:text-stone-700 transition-colors">← {backLabel}</Link>
      </div>
      <div className="flex items-start justify-between flex-col md:flex-row">
        <h1>{title}</h1>
        <div className="text-sm text-stone-400 md:mb-2 shrink-0 md:ml-8">
          {new Date(updatedAt).toLocaleDateString("ko-KR")}
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </header>
  );
}
