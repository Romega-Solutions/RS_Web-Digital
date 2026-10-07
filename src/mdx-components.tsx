import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

// Required by @next/mdx with the App Router. Typography is styled by the
// article wrapper (ArticleView.module.css); only behaviour lives here.

function isExternal(href: string | undefined): href is string {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}

function MdxLink({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

function MdxImage({ alt, ...rest }: ComponentPropsWithoutRef<"img">) {
  // Article images are authored in markdown without intrinsic dimensions, so
  // they render as plain lazy images that the article CSS keeps responsive.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt ?? ""} loading="lazy" decoding="async" {...rest} />;
}

const components: MDXComponents = {
  a: MdxLink,
  img: MdxImage,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
