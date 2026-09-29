import { BlogPost, formatPostDate, readingTime } from "@/lib/storefront/blogs";
import Link from "next/link";

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] bg-neutral-100">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-2 p-5">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {formatPostDate(post.publishedAt || post.createdAt)} · {readingTime(post.content)} min read
        </p>
        <h3 className="text-xl font-semibold text-neutral-900 group-hover:underline">{post.title}</h3>
        <p className="line-clamp-3 text-sm text-neutral-600">{post.excerpt || post.metaDescription}</p>
      </div>
    </Link>
  );
}
