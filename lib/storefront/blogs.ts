import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cache } from "react";

export type BlogPost = {
  _id: ObjectId | string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: string;
  author: string;
  category?: string;
  tags?: string[];
  metaTitle: string;
  metaDescription: string;
  publishedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export async function getBlogPosts({
  page = 1,
  limit = 9,
  category,
  tag,
}: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
}) {
  const db = await connectDB();
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = { status: "published", deletedAt: { $exists: false } };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  const [posts, total] = await Promise.all([
    db.collection("blogs").find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection("blogs").countDocuments(filter),
  ]);
  return { posts: posts as BlogPost[], total, page, totalPages: Math.ceil(total / limit) };
}

// cache() de-duplicates the query when generateMetadata and the page both call it
export const getBlogPost = cache(async (slug: string) => {
  const db = await connectDB();
  return (await db.collection("blogs").findOne({ slug, status: "published", deletedAt: { $exists: false } })) as BlogPost | null;
});

export async function getBlogSlugs() {
  const db = await connectDB();
  return await db.collection("blogs").find({ status: "published", deletedAt: { $exists: false } }).project({ slug: 1 }).toArray();
}

export async function getLatestPosts(limit = 3, excludeSlug?: string) {
  const db = await connectDB();
  const filter: Record<string, unknown> = { status: "published", deletedAt: { $exists: false } };
  if (excludeSlug) filter.slug = { $ne: excludeSlug };
  const posts = await db
    .collection("blogs")
    .find(filter)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
  return posts as BlogPost[];
}

export function readingTime(html: string) {
  const words = (html || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatPostDate(date: Date | string, long = false) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: long ? "long" : "short",
    day: "numeric",
  }).format(new Date(date));
}
