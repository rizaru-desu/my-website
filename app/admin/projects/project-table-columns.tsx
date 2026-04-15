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

import type { ProjectStatus } from "./project.schema";
import { formatProjectUpdatedAt, type AdminProjectRecord } from "@/lib/projects.shared";

function getStatusBadgeVariant(status: ProjectStatus) {
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
}: HeaderContext<AdminProjectRecord, unknown> & { label: string }) {
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

const updatedAtSortingFn: SortingFn<AdminProjectRecord> = (rowA, rowB, columnId) => {
  const first = Date.parse(rowA.getValue<string>(columnId));
  const second = Date.parse(rowB.getValue<string>(columnId));

  return first - second;
};

type ProjectTableColumnsOptions = {
  onDeleteProject: (project: AdminProjectRecord) => void;
  onDuplicateProject: (project: AdminProjectRecord) => void;
  onEditProject: (project: AdminProjectRecord) => void;
};

export function createProjectTableColumns({
  onDeleteProject,
  onDuplicateProject,
  onEditProject,
}: ProjectTableColumnsOptions): ColumnDef<AdminProjectRecord>[] {
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
            onClick={() => onEditProject(row.original)}
          >
            <span className="block font-display text-2xl uppercase leading-none text-ink">
              {row.original.values.title}
            </span>
          </button>
          <p className="max-w-xl text-sm leading-6 text-ink/72">
            {row.original.values.summary}
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
      id: "year",
      accessorFn: (row) => Number(row.values.year),
      header: (context) => <SortableHeader {...context} label="Year" />,
      cell: ({ row }) => (
        <span className="font-semibold uppercase tracking-[0.14em] text-ink/72">
          {row.original.values.year}
        </span>
      ),
    },
    {
      id: "updatedAt",
      accessorFn: (row) => row.updatedAt,
      header: (context) => <SortableHeader {...context} label="Last Updated" />,
      cell: ({ row }) => (
        <span className="text-sm text-ink/72">
          {formatProjectUpdatedAt(row.original.updatedAt)}
        </span>
      ),
      sortingFn: updatedAtSortingFn,
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
            <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditProject(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicateProject(row.original)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteProject(row.original)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
