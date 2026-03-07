// Notion select 컬러명 → hex 매핑 (notion-overrides.css 기준)
export const NOTION_COLORS: Record<string, string> = {
  default: "#44403c",
  gray: "#f5f5f4",
  brown: "#e5e3dc",
  orange: "#ffedd4",
  yellow: "#f3eace",
  green: "#e0f8e5",
  blue: "#dbe7fe",
  purple: "#f1ecfb",
  pink: "#f9eaf1",
  red: "#fae6e7",
};

export function getNotionColor(color: string): string {
  return NOTION_COLORS[color] ?? NOTION_COLORS.default;
}
