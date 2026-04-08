"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import type { ProjectRecord } from "./project.default-values";
import type { ProjectStatus } from "./project.schema";
import { createProjectTableColumns } from "./project-table-columns";
import { ProjectTable } from "./project-table";

type ProjectListProps = {
  isLoading: boolean;
  items: ProjectRecord[];
  onAddProject: () => void;
  onDeleteProject: (project: ProjectRecord) => void;
  onDuplicateProject: (project: ProjectRecord) => void;
  onEditProject: (project: ProjectRecord) => void;
};

export function ProjectList({
  isLoading,
  items,
  onAddProject,
  onDeleteProject,
  onDuplicateProject,
  onEditProject,
}: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "lastUpdated",
      desc: true,
    },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const categories = useMemo(
    () => ["all", ...new Set(items.map((item) => item.values.category))],
    [items],
  );

  const columns = useMemo(
    () =>
      createProjectTableColumns({
        onDeleteProject,
        onDuplicateProject,
        onEditProject,
      }),
    [onDeleteProject, onDuplicateProject, onEditProject],
  );

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      {
        id: "title",
        value: searchQuery,
      },
      {
        id: "status",
        value: statusFilter,
      },
      {
        id: "category",
        value: categoryFilter,
      },
    ],
    [categoryFilter, searchQuery, statusFilter],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: {
      columnFilters,
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const publishedCount = items.filter((item) => item.values.status === "published").length;
  const featuredCount = items.filter((item) => item.values.featured).length;

  const hasFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-white/75">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Total Projects
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {items.length}
            </p>
          </CardContent>
        </Card>
        <Card accent="blue">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Published
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {publishedCount}
            </p>
          </CardContent>
        </Card>
        <Card accent="red">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Featured Rail
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {featuredCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <Badge variant="cream">Project Directory</Badge>
              <CardTitle>Search, sort, and open any project entry.</CardTitle>
              <CardDescription>
                This table drives the local editor flow for add, edit, duplicate,
                and delete interactions.
              </CardDescription>
            </div>
            <Button onClick={onAddProject}>Add Project</Button>
          </div>

          <Separator />

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2">
              <label
                htmlFor="project-search"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
              >
                Search projects
              </label>
              <Input
                id="project-search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
                placeholder="Search by project title"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                Status filter
              </p>
              <div className="flex flex-wrap gap-3">
                {(["all", "draft", "published", "archived"] as const).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={
                      statusFilter === status
                        ? status === "published"
                          ? "blue"
                          : status === "draft"
                            ? "default"
                            : "outline"
                        : "muted"
                    }
                    onClick={() => {
                      setStatusFilter(status);
                      setPagination((current) => ({ ...current, pageIndex: 0 }));
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
              Category filter
            </p>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={
                    categoryFilter === category
                      ? category === "all"
                        ? "outline"
                        : "blue"
                      : category === "all"
                        ? "outline"
                        : "muted"
                  }
                  onClick={() => {
                    setCategoryFilter(category);
                    setPagination((current) => ({ ...current, pageIndex: 0 }));
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <ProjectTable
            table={table}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onAddProject={onAddProject}
            onClearFilters={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setCategoryFilter("all");
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
