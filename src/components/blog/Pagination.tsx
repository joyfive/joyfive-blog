import Link from "next/link";

interface Props {
  basePath: string;
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ basePath, currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) => (page === 1 ? basePath : `${basePath}?page=${page}`);

  return (
    <nav className="flex items-center justify-center gap-6 mt-12" aria-label="페이지네이션">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        className={`text-sm text-stone-500 hover:text-stone-700 transition-colors ${
          currentPage === 1 ? "pointer-events-none opacity-30" : ""
        }`}
        aria-disabled={currentPage === 1}
      >
        이전
      </Link>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={pageHref(page)}
              aria-current={isActive ? "page" : undefined}
              className="relative inline-flex items-center justify-center w-7 h-7 text-sm"
            >
              {isActive && (
                <span
                  className="absolute inset-0 bg-stone-700/10 border border-stone-700/20 filter-rough pointer-events-none"
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative ${
                  isActive ? "font-bold text-stone-800" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {page}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        className={`text-sm text-stone-500 hover:text-stone-700 transition-colors ${
          currentPage === totalPages ? "pointer-events-none opacity-30" : ""
        }`}
        aria-disabled={currentPage === totalPages}
      >
        다음
      </Link>
    </nav>
  );
}
