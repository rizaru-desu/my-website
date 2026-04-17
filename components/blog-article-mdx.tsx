import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

import {
  MDXRemote,
  type MDXComponents,
  type MDXRemoteOptions,
} from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";

import { MermaidContentUpgrade } from "@/components/mermaid-content-upgrade";

function ArticleError({ error }: { error: Error }) {
  return (
    <div className="rounded-[24px] border-[3px] border-accent-red bg-white/80 p-5 shadow-[6px_6px_0_var(--ink)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-red">
        Article Render Error
      </p>
      <h3 className="mt-3 font-display text-2xl uppercase leading-none text-ink">
        This story could not be rendered right now.
      </h3>
      <p className="mt-3 text-sm leading-7 text-ink/75">
        Review the MDX formatting in the admin editor, then save the article again.
      </p>
      <p className="mt-3 text-xs leading-6 text-ink/55">{error.message}</p>
    </div>
  );
}

function ArticleLink({
  children,
  className,
  href,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const normalizedHref = typeof href === "string" ? href : "";
  const isInternal = normalizedHref.startsWith("/");
  const isExternal = /^https?:\/\//i.test(normalizedHref);

  if (isInternal) {
    return (
      <Link
        href={normalizedHref}
        className={[
          "font-semibold text-accent-blue underline decoration-[3px] underline-offset-4 transition hover:text-ink",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      {...props}
      href={normalizedHref}
      className={[
        "font-semibold text-accent-blue underline decoration-[3px] underline-offset-4 transition hover:text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      rel={isExternal ? "noreferrer" : props.rel}
      target={isExternal ? "_blank" : props.target}
    >
      {children}
    </a>
  );
}

const blogArticleMdxComponents: MDXComponents = {
  a: ArticleLink,
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={[
        "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(135deg,#fff1e0_0%,#fffaf0_100%)] px-5 py-4 font-medium italic text-ink shadow-[6px_6px_0_var(--ink)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => {
    const isBlockCode = typeof className === "string" && className.includes("language-");

    return (
    <code
      className={[
        isBlockCode
          ? "bg-transparent px-0 py-0 text-inherit"
          : "rounded-[10px] border border-ink/15 bg-ink px-2 py-1 font-mono text-[0.92em] text-panel",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
    );
  },
  h1: ({ className, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className={[
        "font-display text-5xl uppercase leading-none text-ink sm:text-6xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  h2: ({ className, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className={[
        "font-display text-4xl uppercase leading-none text-ink sm:text-5xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className={[
        "font-display text-3xl uppercase leading-none text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-t-[3px] border-dashed border-ink/25" {...props} />
  ),
  img: ({ alt, className, ...props }: ComponentPropsWithoutRef<"img">) => (
    <img
      alt={alt ?? ""}
      className={[
        "w-full rounded-[24px] border-[3px] border-ink object-cover shadow-[6px_6px_0_var(--ink)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className={["leading-8 text-ink/80", className].filter(Boolean).join(" ")} {...props} />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={[
        "ml-6 list-decimal space-y-3 marker:font-semibold marker:text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className={["text-base leading-8 text-ink/80", className].filter(Boolean).join(" ")} {...props} />
  ),
  pre: ({ className, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className={[
        "themed-scrollbar overflow-x-auto rounded-[24px] border-[3px] border-ink bg-ink px-5 py-4 text-sm leading-7 text-panel shadow-[6px_6px_0_var(--ink)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  table: ({ className, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="themed-scrollbar overflow-x-auto">
      <table
        className={[
          "min-w-full border-collapse overflow-hidden rounded-[24px] border-[3px] border-ink bg-white/80 text-left shadow-[6px_6px_0_var(--ink)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </div>
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td className={["border border-ink/15 px-4 py-3 text-sm leading-7 text-ink/80", className].filter(Boolean).join(" ")} {...props} />
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      className={[
        "border border-ink/15 bg-accent-blue px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={[
        "ml-6 list-disc space-y-3 marker:text-accent-red",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
};

const blogArticleMdxOptions: MDXRemoteOptions = {
  disableExports: true,
  disableImports: true,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

type BlogArticleMdxProps = {
  source: string;
};

export async function BlogArticleMdx({ source }: BlogArticleMdxProps) {
  if (!source.trim()) {
    return (
      <div className="rounded-[24px] border-[3px] border-dashed border-ink/25 bg-white/60 px-5 py-6">
        <p className="text-sm leading-7 text-ink/72">
          This article does not have MDX body content yet.
        </p>
      </div>
    );
  }

  const content = await MDXRemote({
    components: blogArticleMdxComponents,
    onError: ArticleError,
    options: blogArticleMdxOptions,
    source,
  });

  return (
    <>
      <div className="story-prose blog-mdx space-y-6">{content}</div>
      <MermaidContentUpgrade />
    </>
  );
}
