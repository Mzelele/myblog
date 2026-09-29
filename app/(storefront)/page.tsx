import PostCard from "components/blog/post-card";
import CategorySections from "components/layout/category-sections";
import { formatPostDate, getBlogPosts, readingTime } from "lib/storefront/blogs";
import { getAllCategories } from "lib/storefront/categories";
import { getProducts } from "lib/storefront/products";
import { getStoreSettings } from "lib/storefront/settings";
import { baseUrl } from "lib/utils";
import Link from "next/link";

export const revalidate = 300;

export async function generateMetadata() {
  let title = "Blog";
  let description = "Articles, guides and updates.";
  try {
    const settings = await getStoreSettings();
    title = settings.metaTitle || settings.storeName || title;
    description = settings.metaDescription || description;
  } catch {
    // fall back to defaults
  }
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/` },
    openGraph: { type: "website", title, description, url: baseUrl },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function HomePage() {
  const [{ posts }, categories] = await Promise.all([
    getBlogPosts({ page: 1, limit: 7 }),
    getAllCategories(),
  ]);
  const [featured, ...latest] = posts;

  // Shop strip: only the first couple of categories that actually have products
  const candidates = categories.slice(0, 4);
  const initialData: Record<string, any> = {};
  await Promise.all(
    candidates.map(async (cat) => {
      initialData[cat.handle] = await getProducts({ category: cat.handle, limit: 4, page: 1 });
    }),
  );
  const shopCategories = candidates
    .filter((c) => initialData[c.handle]?.products?.length > 0)
    .slice(0, 2);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {featured ? (
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-neutral-200 bg-white md:grid-cols-2"
          >
            <div className="aspect-[16/10] bg-neutral-100 md:aspect-auto md:min-h-[320px]">
              {featured.featuredImage ? (
                <img src={featured.featuredImage} alt={featured.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Featured</p>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 group-hover:underline md:text-4xl">
                {featured.title}
              </h1>
              <p className="line-clamp-4 text-neutral-600">{featured.excerpt || featured.metaDescription}</p>
              <p className="text-xs text-neutral-500">
                {formatPostDate(featured.publishedAt || featured.createdAt)} · {readingTime(featured.content)} min read
              </p>
            </div>
          </Link>
        ) : (
          <div className="py-16 text-center">
            <h1 className="text-3xl font-bold text-neutral-900">Welcome</h1>
            <p className="mt-3 text-neutral-600">No posts published yet. Check back soon.</p>
          </div>
        )}

        {latest.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Latest posts</h2>
              <Link href="/blog" className="text-sm font-medium text-neutral-700 hover:underline">
                View all posts →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latest.map((post) => (
                <PostCard key={post._id.toString()} post={post} />
              ))}
            </div>
          </div>
        )}
      </section>

      {shopCategories.length > 0 && (
        <section className="border-t border-neutral-200 bg-white py-10">
          <div className="mx-auto mb-2 flex max-w-7xl items-end justify-between px-4">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">From the shop</h2>
            <Link href="/shop" className="text-sm font-medium text-neutral-700 hover:underline">
              Browse all products →
            </Link>
          </div>
          <CategorySections
            categories={shopCategories.map((c) => ({ slug: c.handle, name: c.title, description: c.description }))}
            initialData={initialData}
          />
        </section>
      )}
    </>
  );
}
