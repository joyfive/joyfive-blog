export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-block text-xs text-stone-600 bg-stone-700/10 border border-stone-700/20 filter-rough px-2 py-0.5">
      #{tag}
    </span>
  )
}
