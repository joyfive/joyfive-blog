export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="relative inline-flex items-center text-xs text-stone-600 px-2 py-0.5">
      <span
        className="absolute inset-0 bg-stone-700/10 border border-stone-700/20 filter-rough pointer-events-none"
        aria-hidden="true"
      />
      <span className="relative">#{tag}</span>
    </span>
  )
}
