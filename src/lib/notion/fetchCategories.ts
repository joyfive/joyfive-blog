// src/lib/notion/fetchCategories.ts
import { notion } from "./client"
import { Category } from "@/types/blog"

export async function fetchCategories(): Promise<Category[]> {
  // 데이터베이스의 메타데이터(구조)를 가져옵니다.
  const response = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID!,
  })

  // 'category'라는 이름의 속성을 찾습니다.
  const categoryProperty = response.properties.category

  if (categoryProperty?.type === "select") {
    // 노션에 설정된 select 옵션들을 우리 타입에 맞게 매핑합니다.
    return categoryProperty.select.options.map((option) => ({
      id: option.id,
      name: option.name,
      color: option.color,
    }))
  }

  return []
}
