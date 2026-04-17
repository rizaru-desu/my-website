"use client";

import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminBlogRecord } from "@/lib/blog.shared";

import { BlogTablePagination } from "./blog-table-pagination";

type BlogTableProps = {
  canAddPost: boolean;
  hasFilters: boolean;
  isLoading: boolean;
  onAddPost: () => void;
  onClearFilters: () => void;
  table: TanstackTable<AdminBlogRecord>;
};

export function BlogTable({
  canAddPost,
  hasFilters,
  isLoading,
  onAddPost,
  onClearFilters,
  table,
}: BlogTableProps) {
  const filteredRows = table.getFilteredRowModel().rows;
  const visibleRows = table.getRowModel().rows;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded-[24px] border-[3px] border-ink bg-white/70 p-5 shadow-[6px_6px_0_var(--ink)]"
          >
            <div className="h-4 w-24 animate-pulse rounded-full bg-ink/10" />
            <div className="mt-4 h-8 w-3/4 animate-pulse rounded-full bg-ink/10" />
            <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-ink/10" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredRows.length === 0) {
    return (
      <Card accent="cream" className="bg-white/75">
        <CardContent className="space-y-4">
          <Badge variant="yellow">No Results</Badge>
          <CardTitle>
            {hasFilters
              ? "No blog posts match the current filters."
              : "The editorial board is still empty."}
          </CardTitle>
          <CardDescription>
            {hasFilters
              ? "Adjust the search or filter controls to reveal posts again."
              : "Start a new article to populate the issue board."}
          </CardDescription>
          <div className="flex flex-wrap gap-3">
            {hasFilters ? (
              <Button type="button" variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            ) : null}
            <Button type="button" onClick={onAddPost} disabled={!canAddPost}>
              Add First Post
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.id === "actions" ? "w-[1%] whitespace-nowrap" : undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {visibleRows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>
          {filteredRows.length} post{filteredRows.length === 1 ? "" : "s"} match the
          current editorial board.
        </TableCaption>
      </Table>

      <BlogTablePagination table={table} />
    </div>
  );
}
