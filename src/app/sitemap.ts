import { MetadataRoute } from "next";
import { fetchAllPostsForSitemap } from "@/lib/notion/fetchAllPostsForSitemap";
import { fetchPostsByCategory } from "@/lib/notion/fetchPostsByCategory";

const BASE_URL = "https://joyfive-blog.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, projectPosts] = await Promise.all([
    fetchAllPostsForSitemap("blog"),
    fetchPostsByCategory("projects", "All", false),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/resume`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.category}/${post.path}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = projectPosts.map((post) => ({
    url: `${BASE_URL}/projects/${post.path}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogEntries, ...projectEntries];
}
