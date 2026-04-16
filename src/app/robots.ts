import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/resume" },
    sitemap: "https://joyfive-blog.vercel.app/sitemap.xml",
  };
}
