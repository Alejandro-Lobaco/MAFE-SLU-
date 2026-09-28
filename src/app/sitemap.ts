import type { MetadataRoute } from "next";
import { business } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = business.url.replace(/\/$/, "");
  return [{ url: `${base}/`, changeFrequency: "monthly", priority: 1, lastModified: new Date() }];
}
