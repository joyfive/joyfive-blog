import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory";
import { fetchCategories } from "@/lib/notion/fetchCategories";
import CategoryNav from "@/components/blog/CategoryNav";
import BlogPostItem from "@/components/blog/BlogPostItem";

interface Props {
  params: { category: string };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = params;

  const [posts, categories] = await Promise.all([
    fetchPostsByCategory("blog", category, false),
    fetchCategories(),
  ]);

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-2 capitalize">{category}</h1>
        <p className="text-stone-400 text-sm">{posts.length}개의 포스트</p>
      </section>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-48 shrink-0">
          <CategoryNav categories={categories} />
        </aside>

        <section className="flex-1">
          {posts.length > 0 ? (
            posts.map((post) => (
              <BlogPostItem key={post.id} post={post} />
            ))
          ) : (
            <p className="text-stone-400 py-20 text-center border border-dashed border-stone-200">
              곧 채워질 예정입니다.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
