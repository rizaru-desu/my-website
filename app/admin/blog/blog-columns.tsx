"use client";

import type { ColumnDef, HeaderContext, SortingFn } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { BlogRecord } from "./blog.default-values";
import type { BlogStatus } from "./blog.schema";

function getStatusBadgeVariant(status: BlogStatus) {
  if (status === "published") {
    return "blue";
  }

  if (status === "archived") {
    return "cream";
  }

  return "yellow";
}

function SortableHeader({
  column,
  label,
}: HeaderContext<BlogRecord, unknown> & { label: string }) {
  const sortDirection = column.getIsSorted();

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 text-left uppercase tracking-[0.2em] text-inherit"
      onClick={column.getToggleSortingHandler()}
    >
      <span>{label}</span>
      <span className="text-[0.65rem] text-ink/50">
        {sortDirection === "asc"
          ? "ASC"
          : sortDirection === "desc"
            ? "DESC"
            : "SORT"}
      </span>
    </button>
  );
}

const publishDateSortingFn: SortingFn<BlogRecord> = (rowA, rowB, columnId) => {
  const first = Date.parse(rowA.getValue<string>(columnId) || "");
  const second = Date.parse(rowB.getValue<string>(columnId) || "");

  return (Number.isNaN(first) ? 0 : first) - (Number.isNaN(second) ? 0 : second);
};

const lastUpdatedSortingFn: SortingFn<BlogRecord> = (rowA, rowB, columnId) => {
  const first = Date.parse(rowA.getValue<string>(columnId));
  const second = Date.parse(rowB.getValue<string>(columnId));

  return first - second;
};

type BlogColumnsOptions = {
  onDeletePost: (post: BlogRecord) => void;
  onDuplicatePost: (post: BlogRecord) => void;
  onEditPost: (post: BlogRecord) => void;
};

export function createBlogColumns({
  onDeletePost,
  onDuplicatePost,
  onEditPost,
}: BlogColumnsOptions): ColumnDef<BlogRecord>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => row.values.title,
      header: (context) => <SortableHeader {...context} label="Title" />,
      cell: ({ row }) => (
        <div className="space-y-2">
          <button
            type="button"
            className="text-left"
            onClick={() => onEditPost(row.original)}
          >
            <span className="block font-display text-2xl uppercase leading-none text-ink">
              {row.original.values.title}
            </span>
          </button>
          <p className="max-w-xl text-sm leading-6 text-ink/72">
            {row.original.values.excerpt}
          </p>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      id: "category",
      accessorFn: (row) => row.values.category,
      header: "Category",
      cell: ({ row }) => <Badge variant="cream">{row.original.values.category}</Badge>,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") {
          return true;
        }

        return row.getValue<string>(columnId) === filterValue;
      },
    },
    {
      id: "status",
      accessorFn: (row) => row.values.status,
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.values.status)}>
          {row.original.values.status}
        </Badge>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") {
          return true;
        }

        return row.getValue<string>(columnId) === filterValue;
      },
    },
    {
      id: "featured",
      accessorFn: (row) => row.values.featured,
      header: "Featured",
      cell: ({ row }) =>
        row.original.values.featured ? (
          <Badge variant="red">Featured</Badge>
        ) : (
          <Badge variant="cream">Standard</Badge>
        ),
    },
    {
      id: "publishDate",
      accessorFn: (row) => row.values.publishDate,
      header: (context) => <SortableHeader {...context} label="Publish Date" />,
      cell: ({ row }) =>
        row.original.values.publishDate ? (
          <span className="text-sm text-ink/72">{row.original.values.publishDate}</span>
        ) : (
          <Badge variant="yellow">Unscheduled</Badge>
        ),
      sortingFn: publishDateSortingFn,
    },
    {
      id: "lastUpdated",
      accessorFn: (row) => row.lastUpdated,
      header: (context) => <SortableHeader {...context} label="Last Updated" />,
      cell: ({ row }) => <span className="text-sm text-ink/72">{row.original.lastUpdated}</span>,
      sortingFn: lastUpdatedSortingFn,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger size="sm" variant="muted">
            Actions
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Post Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditPost(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicatePost(row.original)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeletePost(row.original)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
