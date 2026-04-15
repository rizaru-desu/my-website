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

import { ProjectTablePagination } from "./project-table-pagination";
import type { AdminProjectRecord } from "@/lib/projects.shared";

type ProjectTableProps = {
  hasFilters: boolean;
  isLoading: boolean;
  onAddProject: () => void;
  onClearFilters: () => void;
  table: TanstackTable<AdminProjectRecord>;
};

export function ProjectTable({
  hasFilters,
  isLoading,
  onAddProject,
  onClearFilters,
  table,
}: ProjectTableProps) {
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
              ? "No projects match the current filters."
              : "The project directory is still empty."}
          </CardTitle>
          <CardDescription>
            {hasFilters
              ? "Adjust the search or filter controls to reveal projects again."
              : "Start a new case study to populate the archive surface."}
          </CardDescription>
          <div className="flex flex-wrap gap-3">
            {hasFilters ? (
              <Button type="button" variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            ) : null}
            <Button type="button" onClick={onAddProject}>
              Add First Project
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
          {filteredRows.length} project{filteredRows.length === 1 ? "" : "s"} match the
          current directory view.
        </TableCaption>
      </Table>

      <ProjectTablePagination table={table} />
    </div>
  );
}
