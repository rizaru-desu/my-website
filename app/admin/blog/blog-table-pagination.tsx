"use client";

import type { Table as TanstackTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminBlogRecord } from "@/lib/blog.shared";

type BlogTablePaginationProps = {
  table: TanstackTable<AdminBlogRecord>;
};

const pageSizeOptions = [5, 10, 20];

function buildPageItems(pageCount: number, currentPage: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    pageCount - 1,
    pageCount,
  ]);

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((first, second) => first - second);

  const items: Array<number | "ellipsis"> = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

export function BlogTablePagination({
  table,
}: BlogTablePaginationProps) {
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const currentPage = pageIndex + 1;
  const pageItems = buildPageItems(pageCount, currentPage);

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
          Page {pageCount === 0 ? 0 : currentPage} of {pageCount}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger size="sm" variant="outline">
            Rows: {pageSize}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Rows Per Page</DropdownMenuLabel>
            {pageSizeOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => {
                  table.setPageSize(option);
                  table.setPageIndex(0);
                }}
              >
                {option} rows
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50"
              >
                ...
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={item === currentPage ? "blue" : "outline"}
                className="min-w-11"
                onClick={() => table.setPageIndex(item - 1)}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </Button>
            ),
          )}
        </div>
        <Button
          type="button"
          variant="blue"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
