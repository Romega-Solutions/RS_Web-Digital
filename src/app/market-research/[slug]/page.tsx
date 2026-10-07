import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MainTemplate } from "@/components/templates/MainTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/organisms/layout/SiteFooter";
import { SiteHeader } from "@/components/organisms/layout/SiteHeader";
import { ArticleView } from "@/components/organisms/market-research/ArticleView";
import { getAllPosts, getAuthorHref, getPostBySlug } from "@/lib/market-research";
import { absoluteUrl, createBreadcrumbSchema, createMetadata, siteConfig } from "@/lib/seo";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

// Only posts that exist at build time are routable; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const base = createMetadata({
    title: post.title,
    description: post.summary,
    path: `/market-research/${post.slug}`,
    image: post.cover.src,
    keywords: ["market research", ...post.authors.map((author) => author.name)],
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.date,
      authors: post.authors.map((author) => author.name),
      images: [
        {
          url: absoluteUrl(post.cover.src),
          width: post.cover.width,
          height: post.cover.height,
          alt: post.cover.alt,
        },
      ],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { default: Body } = await import(`@/content/market-research/${slug}.mdx`);

  const authors = post.authors.map((author) => ({
    name: author.name,
    href: getAuthorHref(author),
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Market Research", path: "/market-research" },
        { name: post.title, path: `/market-research/${post.slug}` },
      ]),
      {
        "@type": "Article",
        "@id": absoluteUrl(`/market-research/${post.slug}#article`),
        mainEntityOfPage: absoluteUrl(`/market-research/${post.slug}`),
        headline: post.title,
        description: post.summary,
        datePublished: post.date,
        image: absoluteUrl(post.cover.src),
        author: authors.map((author) => ({
          "@type": "Person",
          name: author.name,
          ...(author.href ? { url: author.href } : {}),
        })),
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: { "@type": "ImageObject", url: absoluteUrl(siteConfig.logo) },
        },
        isPartOf: { "@id": absoluteUrl("/#website") },
      },
    ],
  };

  return (
    <MainTemplate
      jsonLd={<JsonLd id="market-research-article-structured-data" data={structuredData} />}
      header={<SiteHeader activeItem="Market Research" />}
      footer={<SiteFooter />}
    >
      <ArticleView post={post} authors={authors}>
        <Body />
      </ArticleView>
    </MainTemplate>
  );
}
