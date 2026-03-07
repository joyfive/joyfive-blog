// Notion select 컬러명 → hex 매핑 (notion-overrides.css 기준)
export const NOTION_COLORS: Record<string, string> = {
  default: "#44403c",
  gray: "#78716c",
  brown: "#605448",
  orange: "#ff6900",
  yellow: "#c08732",
  green: "#36b155",
  blue: "#3d73f4",
  purple: "#a471e1",
  pink: "#d46088",
  red: "#c53d46",
};

export function getNotionColor(color: string): string {
  return NOTION_COLORS[color] ?? NOTION_COLORS.default;
}
