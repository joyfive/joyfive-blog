// src/lib/notion/mapper.ts
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { Post } from "@/lib/domain/post"

export const mapNotionPost = (page: PageObjectResponse): Post | null => {
  if (!("properties" in page)) return null

  const props = page.properties

  const category =
    props.category?.type === "select" ? props.category.select?.name : null

  const path =
    props.path?.type === "rich_text"
      ? props.path.rich_text[0]?.plain_text
      : null

  if (!category || !path) return null

  return {
    id: page.id,
    title:
      props.title.type === "title"
        ? props.title.title[0]?.plain_text ?? ""
        : "",
    category,
    path,
    updatedAt:
      props.updated_at.type === "last_edited_time"
        ? String(props.updated_at)
        : "",
    tags:
      props.tags?.type === "multi_select"
        ? props.tags.multi_select.map((t) => t.name)
        : [],
  }
}
