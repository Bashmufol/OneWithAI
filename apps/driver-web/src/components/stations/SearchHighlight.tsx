import { highlightSearchMatch } from "@/lib/filterStations"

interface SearchHighlightTextProps {
  text: string
  query: string
  className?: string
}

export function SearchHighlightText({
  text,
  query,
  className,
}: SearchHighlightTextProps) {
  const segments = highlightSearchMatch(text, query)

  if (!segments) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {segments.before}
      <span className="font-medium text-brand-cyan">{segments.match}</span>
      {segments.after}
    </span>
  )
}
