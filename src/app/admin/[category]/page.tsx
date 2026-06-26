import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fetchProfileItems } from "@/lib/notion/fetchProfileCms";
import {
  CATEGORY_CONFIG,
  VALID_CATEGORIES,
  type CategoryKey,
} from "../categoryConfig";
import BlogCmsEditor from "./BlogCmsEditor";
import FloatingNav from "../FloatingNav";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: { category: string };
  searchParams: { key?: string };
}

export default async function CategoryAdminPage({ params, searchParams }: Props) {
  const { key } = searchParams;

  if (!key || !process.env.LOG_KEY || key !== process.env.LOG_KEY) {
    return notFound();
  }

  const category = params.category as CategoryKey;
  if (!VALID_CATEGORIES.includes(category)) return notFound();

  const config = CATEGORY_CONFIG[category];
  const items = await fetchProfileItems(category);

  return (
    <>
      <BlogCmsEditor
        category={category}
        config={config}
        logKey={key}
        initialItems={items}
      />
      <Suspense fallback={null}>
        <FloatingNav />
      </Suspense>
    </>
  );
}
