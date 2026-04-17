"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ResumePaginationProps = {
  currentPage: number;
  label?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageCount: number;
  pageSize: number;
  totalItems: number;
};

const pageSizeOptions = [3, 6, 9];

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

export function ResumePagination({
  currentPage,
  label = "items",
  onPageChange,
  onPageSizeChange,
  pageCount,
  pageSize,
  totalItems,
}: ResumePaginationProps) {
  const pageItems = buildPageItems(pageCount, currentPage);
  const safeCurrentPage = pageCount === 0 ? 0 : currentPage;
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = totalItems === 0 ? 0 : Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)] xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-[20px] border-[2.5px] border-ink bg-cream px-3 py-2 shadow-[3px_3px_0_var(--ink)] sm:w-fit">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink/60">
            Showing
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-ink">
            {rangeStart}-{rangeEnd}
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink/55">
            of {totalItems} total
          </span>
        </div>

        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink/60">
          Page {safeCurrentPage}/{pageCount} · {label}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger size="sm" variant="outline">
            Rows {pageSize}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Rows Per Page</DropdownMenuLabel>
            {pageSizeOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => onPageSizeChange(option)}
              >
                {option} rows
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="sm:min-w-24"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <div className="flex flex-wrap items-center gap-2 rounded-full border-[2.5px] border-ink bg-white px-2 py-2 shadow-[3px_3px_0_var(--ink)]">
          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink/50"
              >
                ...
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={item === currentPage ? "blue" : "outline"}
                className="min-w-10"
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </Button>
            ),
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="blue"
          className="sm:min-w-20"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
