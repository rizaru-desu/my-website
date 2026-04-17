"use client";

import { useEffect } from "react";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Review the Mermaid syntax in the editor and try again.";
}

export function MermaidContentUpgrade() {
  useEffect(() => {
    let cancelled = false;

    async function upgradeMermaidBlocks() {
      const codeBlocks = Array.from(
        document.querySelectorAll<HTMLElement>(".blog-mdx pre > code.language-mermaid"),
      );

      if (!codeBlocks.length) {
        return;
      }

      const mermaidModule = await import("mermaid");
      const mermaid = mermaidModule.default;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "neutral",
        flowchart: {
          htmlLabels: false,
          useMaxWidth: true,
        },
      });

      for (const codeBlock of codeBlocks) {
        if (cancelled) {
          return;
        }

        const parentPre = codeBlock.closest("pre");

        if (!parentPre || parentPre.dataset.mermaidUpgraded === "true") {
          continue;
        }

        const source = codeBlock.textContent?.trim() ?? "";

        if (!source) {
          continue;
        }

        try {
          const renderId = `blog-mermaid-${globalThis.crypto.randomUUID()}`;
          const { svg } = await mermaid.render(renderId, source);

          if (cancelled) {
            return;
          }

          parentPre.dataset.mermaidUpgraded = "true";
          parentPre.className =
            "blog-mermaid themed-scrollbar overflow-x-auto rounded-[24px] border-[3px] border-ink bg-white/90 px-4 py-4 shadow-[6px_6px_0_var(--ink)]";
          parentPre.innerHTML = svg;
        } catch (error) {
          if (cancelled) {
            return;
          }

          parentPre.dataset.mermaidUpgraded = "true";
          parentPre.className =
            "rounded-[24px] border-[3px] border-accent-red bg-white/80 px-5 py-4 shadow-[6px_6px_0_var(--ink)]";
          parentPre.replaceChildren();

          const label = document.createElement("p");
          label.className =
            "text-xs font-semibold uppercase tracking-[0.18em] text-accent-red";
          label.textContent = "Mermaid Error";

          const description = document.createElement("p");
          description.className = "mt-3 text-sm leading-7 text-ink/75";
          description.textContent = getErrorMessage(error);

          parentPre.append(label, description);
        }
      }
    }

    upgradeMermaidBlocks();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
