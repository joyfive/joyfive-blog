// src/types/blog.ts

export interface Category {
  id: string
  name: string
  color: string
}

export interface BlogPost {
  id: string
  title: string
  path: string
  category: string
  tags: string[]
  updated_at: string
}

// 노션 속성별 상세 타입
export type NotionTitleProp = { type: "title"; title: { plain_text: string }[] }
export type NotionRichTextProp = {
  type: "rich_text"
  rich_text: { plain_text: string }[]
}
export type NotionSelectProp = {
  type: "select"
  select: { name: string } | null
}
export type NotionMultiSelectProp = {
  type: "multi_select"
  multi_select: { name: string }[]
}
export type NotionDateProp = {
  type: "last_edited_time"
  last_edited_time: string
}

// 전체 응답 구조
export interface NotionRawResponse {
  id: string
  properties: {
    title: NotionTitleProp
    path: NotionRichTextProp
    category: NotionSelectProp
    tags: NotionMultiSelectProp
    updated_at: NotionDateProp
  }
}
