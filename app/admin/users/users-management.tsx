"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type HeaderContext,
  type PaginationState,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  banManagedUser,
  createManagedUser,
  revokeManagedUserSessions,
  unbanManagedUser,
} from "@/app/admin/users/actions";
import {
  fetchManagedUsers,
  managedUsersQueryKey,
} from "@/app/admin/users/users-management.queries";
import {
  managedUserRoleOptions,
  type BanManagedUserInput,
  type ManagedUserActionResult,
  type ManagedUserRecord,
  type ManagedUserRole,
  type UserStatusKey,
} from "@/app/admin/users/users-management.shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pageSizeOptions = [5, 10, 20];
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTimeLocalValue(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  const hours = `${value.getHours()}`.padStart(2, "0");
  const minutes = `${value.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultBanExpiryInput() {
  const nextWeek = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  nextWeek.setSeconds(0, 0);
  return formatDateTimeLocalValue(nextWeek);
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return dateTimeFormatter.format(date);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getStatusBadgeVariant(status: UserStatusKey) {
  if (status === "banned") {
    return "red";
  }

  if (status === "active") {
    return "blue";
  }

  return "cream";
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: string;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
    >
      {children}
    </label>
  );
}

function BannedReasonPopover({
  banExpires,
  banReason,
}: {
  banExpires: string | null;
  banReason: string | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (containerRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-red/30"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Show ban reason"
      >
        <Badge variant="red" className="cursor-pointer">
          banned
        </Badge>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.75rem)] z-[75] w-72 rounded-[24px] border-[3px] border-ink bg-panel p-4 shadow-[8px_8px_0_var(--ink)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/55">
            Ban reason
          </p>
          <p className="mt-3 text-sm leading-7 text-ink/78">
            {banReason ?? "No reason was recorded for this ban."}
          </p>
          {banExpires ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">
              Active until {formatDateLabel(banExpires)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SortableHeader({
  column,
  label,
}: HeaderContext<ManagedUserRecord, unknown> & { label: string }) {
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

function createUserColumns({
  actionUserId,
  onToggleBan,
  onRevokeSessions,
}: {
  actionUserId: string | null;
  onToggleBan: (user: ManagedUserRecord) => Promise<void>;
  onRevokeSessions: (user: ManagedUserRecord) => Promise<void>;
}): ColumnDef<ManagedUserRecord>[] {
  return [
    {
      id: "identity",
      accessorFn: (row) => `${row.name} ${row.email}`.toLowerCase(),
      header: (context) => <SortableHeader {...context} label="Member" />,
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-2xl uppercase leading-none text-ink">
              {row.original.name}
            </span>
            {row.original.isCurrentUser ? (
              <Badge variant="blue" className="shadow-none">
                Current Session
              </Badge>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-ink/72">{row.original.email}</p>
        </div>
      ),
      filterFn: "includesString",
    },
    {
      id: "role",
      accessorFn: (row) => row.role,
      header: "Role",
      cell: ({ row }) => <Badge variant="cream">{row.original.role}</Badge>,
    },
    {
      id: "statusKey",
      accessorFn: (row) => row.statusKey,
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {row.original.statusKey === "banned" ? (
              <BannedReasonPopover
                banReason={row.original.banReason}
                banExpires={row.original.banExpires}
              />
            ) : (
              <Badge variant={getStatusBadgeVariant(row.original.statusKey)}>
                {row.original.statusKey}
              </Badge>
            )}
            {row.original.emailVerified ? (
              <Badge variant="blue">Verified</Badge>
            ) : (
              <Badge variant="yellow">Unverified</Badge>
            )}
          </div>
        </div>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") {
          return true;
        }

        return row.getValue<string>(columnId) === filterValue;
      },
    },
    {
      id: "sessionCount",
      accessorFn: (row) => row.sessionCount,
      header: (context) => <SortableHeader {...context} label="Sessions" />,
      cell: ({ row }) => (
        <div className="space-y-2">
          <p className="font-display text-2xl uppercase leading-none text-ink">
            {row.original.sessionCount}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
            {row.original.inactive ? "Inactive" : "Live Access"}
          </p>
        </div>
      ),
    },
    {
      id: "lastSeenAt",
      accessorFn: (row) => (row.lastSeenAt ? Date.parse(row.lastSeenAt) : 0),
      header: (context) => <SortableHeader {...context} label="Last Seen" />,
      cell: ({ row }) => (
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/72">
            {formatDateLabel(row.original.lastSeenAt)}
          </p>
          {row.original.banExpires ? (
            <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
              Ban until {formatDateLabel(row.original.banExpires)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "joinedAt",
      accessorFn: (row) => Date.parse(row.createdAt),
      header: (context) => <SortableHeader {...context} label="Joined" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/72">
          {formatDateLabel(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.isCurrentUser ? (
          <Badge variant="cream">Protected</Badge>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              size="sm"
              variant="muted"
              disabled={actionUserId === row.original.id}
            >
              {actionUserId === row.original.id ? "Working..." : "Actions"}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>User Controls</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  void onToggleBan(row.original);
                }}
              >
                {row.original.banned ? "Unban User" : "Ban User"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  void onRevokeSessions(row.original);
                }}
              >
                Revoke Sessions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-default hover:border-transparent hover:bg-transparent">
                {row.original.inactive
                  ? "Currently inactive"
                  : `${row.original.sessionCount} active session${row.original.sessionCount === 1 ? "" : "s"}`}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ];
}

function UsersTablePagination({
  table,
}: {
  table: TanstackTable<ManagedUserRecord>;
}) {
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

function UsersTable({
  hasFilters,
  isLoading,
  onClearFilters,
  onRefresh,
  table,
}: {
  hasFilters: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
  onRefresh: () => Promise<void>;
  table: TanstackTable<ManagedUserRecord>;
}) {
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
              ? "No users match the current filters."
              : "No managed accounts are available yet."}
          </CardTitle>
          <CardDescription>
            {hasFilters
              ? "Adjust the search query or status filter to reveal user records again."
              : "Once accounts start signing in, they will appear in this management table."}
          </CardDescription>
          <div className="flex flex-wrap gap-3">
            {hasFilters ? (
              <Button type="button" variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            ) : null}
            <Button
              type="button"
              variant="blue"
              onClick={() => {
                void onRefresh();
              }}
            >
              Refresh Directory
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
          {filteredRows.length} user{filteredRows.length === 1 ? "" : "s"} match the
          current management view.
        </TableCaption>
      </Table>

      <UsersTablePagination table={table} />
    </div>
  );
}

export function UsersManagement() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [banTargetUser, setBanTargetUser] = useState<ManagedUserRecord | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banExpiresAt, setBanExpiresAt] = useState(getDefaultBanExpiryInput);
  const [newUserRole, setNewUserRole] = useState<ManagedUserRole>("architect");
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatusKey>("all");
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "joinedAt",
      desc: true,
    },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data,
    error,
    isPending,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: managedUsersQueryKey,
    queryFn: fetchManagedUsers,
  });

  const { mutateAsync: runCreateUser, isPending: isCreatingUser } = useMutation({
    mutationFn: async (values: {
      email: string;
      name: string;
      password: string;
      role: ManagedUserRole;
    }) => {
      const result = await createManagedUser(values);

      if (!result.ok) {
        throw new Error(result.message || "The user account could not be created.");
      }

      return result.message;
    },
    onMutate: () => {
      setErrorMessage(null);
      setFeedbackMessage(null);
    },
    onSuccess: async (message) => {
      setFeedbackMessage(message);
      setIsCreateDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: managedUsersQueryKey });
    },
    onError: (mutationError) => {
      setErrorMessage(
        getErrorMessage(mutationError, "The user account could not be created."),
      );
    },
  });

  const { mutateAsync: runUserAction } = useMutation({
    mutationFn: async ({
      type,
      user,
      banInput,
    }: {
      type: "toggle-ban" | "revoke-sessions";
      user: ManagedUserRecord;
      banInput?: BanManagedUserInput;
    }) => {
      let result: ManagedUserActionResult;

      if (type === "revoke-sessions") {
        result = await revokeManagedUserSessions(user.id);
      } else {
        result = user.banned
          ? await unbanManagedUser(user.id)
          : await banManagedUser(
              banInput ?? {
                userId: user.id,
                banReason: "",
                banExpiresAt: "",
              },
            );
      }

      if (!result.ok) {
        throw new Error(
          result.message ||
            (type === "revoke-sessions"
              ? `Failed to revoke sessions for ${user.email}.`
              : `Failed to ${user.banned ? "unban" : "ban"} ${user.email}.`),
        );
      }

      return {
        message:
          type === "revoke-sessions"
            ? `${user.email} sessions were revoked.`
            : `${user.email} was ${user.banned ? "unbanned" : "banned"} successfully.`,
      };
    },
    onMutate: ({ user }) => {
      setActionUserId(user.id);
      setErrorMessage(null);
      setFeedbackMessage(null);
    },
    onSuccess: async ({ message }) => {
      setFeedbackMessage(message);
      setBanTargetUser(null);
      setBanReason("");
      setBanExpiresAt(getDefaultBanExpiryInput());
      await queryClient.invalidateQueries({ queryKey: managedUsersQueryKey });
    },
    onError: (mutationError) => {
      setErrorMessage(
        getErrorMessage(mutationError, "The user action could not be completed."),
      );
    },
    onSettled: () => {
      setActionUserId(null);
    },
  });

  const users = data ?? [];
  const columns = useMemo(
    () =>
      createUserColumns({
        actionUserId,
        onToggleBan: async (user) => {
          if (!user.banned) {
            setErrorMessage(null);
            setFeedbackMessage(null);
            setBanTargetUser(user);
            setBanReason(user.banReason ?? "");
            setBanExpiresAt(
              user.banExpires
                ? formatDateTimeLocalValue(new Date(user.banExpires))
                : getDefaultBanExpiryInput(),
            );
            return;
          }

          try {
            await runUserAction({
              type: "toggle-ban",
              user,
            });
          } catch {
            // The mutation handlers already surface the failure in the UI.
          }
        },
        onRevokeSessions: async (user) => {
          try {
            await runUserAction({
              type: "revoke-sessions",
              user,
            });
          } catch {
            // The mutation handlers already surface the failure in the UI.
          }
        },
      }),
    [actionUserId, runUserAction],
  );

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      {
        id: "identity",
        value: deferredSearchQuery.trim().toLowerCase(),
      },
      {
        id: "statusKey",
        value: statusFilter,
      },
    ],
    [deferredSearchQuery, statusFilter],
  );

  const table = useReactTable({
    data: users,
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

  const queryErrorMessage = error
    ? getErrorMessage(error, "The user directory could not be loaded.")
    : null;
  const combinedErrorMessage = errorMessage ?? queryErrorMessage;
  const isLoading = isPending && users.length === 0;
  const isRefreshing = isRefetching;
  const bannedCount = users.filter((user) => user.banned).length;
  const inactiveCount = users.filter((user) => user.inactive).length;
  const activeCount = users.filter((user) => !user.banned && !user.inactive).length;
  const architectCount = users.filter((user) => user.role === "architect").length;
  const hasFilters = deferredSearchQuery.trim().length > 0 || statusFilter !== "all";

  async function handleCreateUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      await runCreateUser({
        name: String(formData.get("create-user-name") ?? ""),
        email: String(formData.get("create-user-email") ?? ""),
        password: String(formData.get("create-user-password") ?? ""),
        role: newUserRole,
      });

      event.currentTarget.reset();
      setNewUserRole("architect");
    } catch {
      // The mutation handlers already surface the failure in the UI.
    }
  }

  async function handleBanUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!banTargetUser) {
      return;
    }

    try {
      await runUserAction({
        type: "toggle-ban",
        user: banTargetUser,
        banInput: {
          userId: banTargetUser.id,
          banReason,
          banExpiresAt,
        },
      });
    } catch {
      // The mutation handlers already surface the failure in the UI.
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-white/75">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Total Users
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {users.length}
            </p>
          </CardContent>
        </Card>
        <Card accent="blue">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Active
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {activeCount}
            </p>
          </CardContent>
        </Card>
        <Card accent="red">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Banned
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {bannedCount}
            </p>
          </CardContent>
        </Card>
        <Card accent="cream">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Inactive
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {inactiveCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <Badge variant="cream">User Management</Badge>
              <CardTitle>Search, inspect, and restrict account access.</CardTitle>
              <CardDescription>
                Architect users can review live session footprint, find inactive
                accounts, and take immediate action without modifying the schema.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="cream">Architects: {architectCount}</Badge>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger type="button" variant="outline">
                  Create User
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <Badge variant="blue">Architect Access</Badge>
                    <DialogTitle>Create a new admin user</DialogTitle>
                    <DialogDescription>
                      Create a new account and choose the role before it appears
                      in the management table.
                    </DialogDescription>
                  </DialogHeader>

                  <form className="mt-6 space-y-5" onSubmit={handleCreateUserSubmit}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <FieldLabel htmlFor="create-user-name">Full name</FieldLabel>
                        <Input
                          id="create-user-name"
                          name="create-user-name"
                          placeholder="Rizal Achmad"
                          autoComplete="name"
                          required
                          disabled={isCreatingUser}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
                        <Input
                          id="create-user-email"
                          name="create-user-email"
                          type="email"
                          placeholder="architect@example.com"
                          autoComplete="email"
                          required
                          disabled={isCreatingUser}
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        <FieldLabel htmlFor="create-user-password">Temporary password</FieldLabel>
                        <Input
                          id="create-user-password"
                          name="create-user-password"
                          type="password"
                          placeholder="Create a secure password"
                          autoComplete="new-password"
                          required
                          disabled={isCreatingUser}
                        />
                      </div>
                      <div className="space-y-2 md:min-w-52">
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                          Role
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {managedUserRoleOptions.map((role) => (
                            <Button
                              key={role}
                              type="button"
                              size="sm"
                              variant={newUserRole === role ? "blue" : "muted"}
                              onClick={() => setNewUserRole(role)}
                              disabled={isCreatingUser}
                            >
                              {role}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-7 text-ink/65">
                      The new account will appear in the table after creation and can
                      be managed immediately from this screen.
                    </p>

                    <DialogFooter>
                      <DialogClose disabled={isCreatingUser}>Cancel</DialogClose>
                      <Button type="submit" variant="blue" disabled={isCreatingUser}>
                        {isCreatingUser ? "Creating User..." : `Create ${newUserRole}`}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                type="button"
                variant="blue"
                onClick={() => {
                  setErrorMessage(null);
                  void refetch();
                }}
                disabled={isRefreshing || isLoading}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          <Dialog
            open={Boolean(banTargetUser)}
            onOpenChange={(open) => {
              if (open) {
                return;
              }

              setBanTargetUser(null);
              setBanReason("");
              setBanExpiresAt(getDefaultBanExpiryInput());
            }}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <Badge variant="red">Restrict Access</Badge>
                <DialogTitle>Ban access for this user</DialogTitle>
                <DialogDescription>
                  Add a reason and choose when the restriction should expire before
                  banning {banTargetUser?.email ?? "this user"}.
                </DialogDescription>
              </DialogHeader>

              <form className="mt-6 space-y-5" onSubmit={handleBanUserSubmit}>
                <div className="space-y-2">
                  <FieldLabel htmlFor="ban-reason">Ban reason</FieldLabel>
                  <Textarea
                    id="ban-reason"
                    value={banReason}
                    onChange={(event) => setBanReason(event.target.value)}
                    placeholder="Explain why this account is being restricted."
                    required
                    disabled={actionUserId === banTargetUser?.id}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel htmlFor="ban-expires-at">Ban until</FieldLabel>
                  <Input
                    id="ban-expires-at"
                    type="datetime-local"
                    value={banExpiresAt}
                    onChange={(event) => setBanExpiresAt(event.target.value)}
                    required
                    disabled={actionUserId === banTargetUser?.id}
                  />
                </div>

                <DialogFooter>
                  <DialogClose disabled={actionUserId === banTargetUser?.id}>
                    Cancel
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={actionUserId === banTargetUser?.id}
                  >
                    {actionUserId === banTargetUser?.id ? "Banning User..." : "Confirm Ban"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Separator />

          {feedbackMessage ? (
            <div className="rounded-[22px] border-[3px] border-ink bg-[#dce8ff] px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/72">
                {feedbackMessage}
              </p>
            </div>
          ) : null}

          {combinedErrorMessage ? (
            <div className="rounded-[22px] border-[3px] border-ink bg-[#ffd9d3] px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/72">
                {combinedErrorMessage}
              </p>
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-2">
              <label
                htmlFor="user-search"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
              >
                Search users
              </label>
              <Input
                id="user-search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
                placeholder="Search by name or email"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                Status filter
              </p>
              <div className="flex flex-wrap gap-3">
                {(["all", "active", "inactive", "banned"] as const).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={
                      statusFilter === status
                        ? status === "active"
                          ? "blue"
                          : status === "banned"
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

          <UsersTable
            table={table}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onRefresh={async () => {
              setErrorMessage(null);
              await refetch();
            }}
            onClearFilters={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
