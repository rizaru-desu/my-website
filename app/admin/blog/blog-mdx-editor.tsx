"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";

const BlogMdxEditorClient = dynamic(
  () =>
    import("./blog-mdx-editor.client").then((module) => module.BlogMdxEditorClient),
  {
    loading: () => (
      <div className="blog-editor-loading rounded-[28px] border-[3px] border-ink bg-white/80 px-5 py-4 shadow-[6px_6px_0_var(--ink)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
          Loading editor
        </p>
        <p className="mt-2 text-sm leading-6 text-ink/68">
          Preparing the MDX workspace for this article.
        </p>
      </div>
    ),
    ssr: false,
  },
);

type BlogMdxEditorProps = {
  className?: string;
  markdown: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  placeholder?: ReactNode;
};

export function BlogMdxEditor({
  className,
  markdown,
  onBlur,
  onChange,
  placeholder,
}: BlogMdxEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const lastSyncedMarkdownRef = useRef(markdown);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (lastSyncedMarkdownRef.current === markdown) {
      return;
    }

    if (editor.getMarkdown() === markdown) {
      lastSyncedMarkdownRef.current = markdown;
      return;
    }

    editor.setMarkdown(markdown);
    lastSyncedMarkdownRef.current = markdown;
  }, [markdown]);

  const handleChange: MDXEditorProps["onChange"] = (nextMarkdown) => {
    lastSyncedMarkdownRef.current = nextMarkdown;
    onChange(nextMarkdown);
  };

  return (
    <div className={cn("blog-editor-shell", className)}>
      <BlogMdxEditorClient
        className="blog-editor-root"
        contentEditableClassName="blog-editor-prose themed-scrollbar"
        editorRef={editorRef}
        markdown={markdown}
        onBlur={onBlur}
        onChange={handleChange}
        placeholder={placeholder}
        suppressHtmlProcessing
      />
    </div>
  );
}
