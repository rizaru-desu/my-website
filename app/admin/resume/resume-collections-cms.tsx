"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  certificates,
  education,
  experiences,
  type CertificateItem,
  type EducationItem,
  type ExperienceItem,
} from "@/lib/mock-content";

import { ResumePagination } from "./resume-pagination";

type ExperienceRecord = ExperienceItem & {
  id: string;
  updatedAt: string;
};

type EducationRecord = EducationItem & {
  id: string;
  updatedAt: string;
};

type CertificateRecord = CertificateItem & {
  id: string;
  updatedAt: string;
};

type ExperienceFormValues = {
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  achievementsText: string;
};

type EducationFormValues = {
  degree: string;
  school: string;
  period: string;
  description: string;
  highlightsText: string;
};

type CertificateFormValues = {
  name: string;
  issuer: string;
  year: string;
  verificationLink: string;
  credentialId: string;
  featured: boolean;
};

type FeedbackState = {
  title: string;
  detail: string;
} | null;

const defaultCollectionPageSize = 3;

const experienceSeedRecords: ExperienceRecord[] = experiences.map((item, index) => ({
  id: `resume-exp-${index + 1}`,
  updatedAt: index === 0 ? "Today" : index === 1 ? "2 days ago" : "1 week ago",
  ...item,
}));

const educationSeedRecords: EducationRecord[] = education.map((item, index) => ({
  id: `resume-edu-${index + 1}`,
  updatedAt: index === 0 ? "This week" : "2 weeks ago",
  ...item,
}));

const certificateSeedRecords: CertificateRecord[] = certificates.map((item, index) => ({
  id: `resume-cert-${index + 1}`,
  updatedAt: index === 0 ? "Today" : "3 days ago",
  ...item,
}));

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function paginateItems<T>(items: T[], currentPage: number, pageSize: number) {
  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), pageCount);
  const start = (safeCurrentPage - 1) * safePageSize;

  return {
    pageCount,
    pagedItems: items.slice(start, start + safePageSize),
    safeCurrentPage,
  };
}

function createExperienceFormValues(item?: ExperienceRecord | null): ExperienceFormValues {
  return {
    role: item?.role ?? "",
    company: item?.company ?? "",
    period: item?.period ?? "",
    location: item?.location ?? "",
    summary: item?.summary ?? "",
    achievementsText: item?.achievements.join("\n") ?? "",
  };
}

function createEducationFormValues(item?: EducationRecord | null): EducationFormValues {
  return {
    degree: item?.degree ?? "",
    school: item?.school ?? "",
    period: item?.period ?? "",
    description: item?.description ?? "",
    highlightsText: item?.highlights.join("\n") ?? "",
  };
}

function createCertificateFormValues(item?: CertificateRecord | null): CertificateFormValues {
  return {
    name: item?.name ?? "",
    issuer: item?.issuer ?? "",
    year: item?.year ?? "",
    verificationLink: item?.verificationLink ?? "",
    credentialId: item?.credentialId ?? "",
    featured: item?.featured ?? false,
  };
}

function validateExperience(values: ExperienceFormValues) {
  const errors: Partial<Record<keyof ExperienceFormValues, string>> = {};

  if (!values.role.trim()) errors.role = "Role is required.";
  if (!values.company.trim()) errors.company = "Company is required.";
  if (!values.period.trim()) errors.period = "Period is required.";
  if (!values.location.trim()) errors.location = "Location is required.";
  if (!values.summary.trim()) errors.summary = "Summary is required.";
  if (toLines(values.achievementsText).length === 0) {
    errors.achievementsText = "Add at least one achievement.";
  }

  return errors;
}

function validateEducation(values: EducationFormValues) {
  const errors: Partial<Record<keyof EducationFormValues, string>> = {};

  if (!values.degree.trim()) errors.degree = "Degree is required.";
  if (!values.school.trim()) errors.school = "School is required.";
  if (!values.period.trim()) errors.period = "Period is required.";
  if (!values.description.trim()) errors.description = "Description is required.";
  if (toLines(values.highlightsText).length === 0) {
    errors.highlightsText = "Add at least one highlight.";
  }

  return errors;
}

function validateCertificate(values: CertificateFormValues) {
  const errors: Partial<Record<keyof CertificateFormValues, string>> = {};

  if (!values.name.trim()) errors.name = "Certificate name is required.";
  if (!values.issuer.trim()) errors.issuer = "Issuer is required.";
  if (!values.year.trim()) errors.year = "Year is required.";
  if (!values.verificationLink.trim()) {
    errors.verificationLink = "Verification link is required.";
  } else if (!isValidUrl(values.verificationLink)) {
    errors.verificationLink = "Enter a valid URL.";
  }

  return errors;
}

function Field({
  label,
  error,
  children,
  helper,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  helper?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
        {label}
      </span>
      {children}
      {helper ? <p className="text-sm leading-6 text-ink/62">{helper}</p> : null}
      {error ? <p className="text-sm font-semibold text-accent-red">{error}</p> : null}
    </label>
  );
}

function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) {
    return null;
  }

  return (
    <Card accent="blue">
      <CardContent className="space-y-2">
        <Badge variant="blue">Local Save State</Badge>
        <CardTitle>{feedback.title}</CardTitle>
        <CardDescription>{feedback.detail}</CardDescription>
      </CardContent>
    </Card>
  );
}

function FilterToolbar({
  actions,
  clearDisabled,
  filterLabel,
  onClear,
  onSearchChange,
  placeholder,
  resultSummary,
  searchValue,
}: {
  actions?: ReactNode;
  clearDisabled: boolean;
  filterLabel: string;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  placeholder: string;
  resultSummary: string;
  searchValue: string;
}) {
  return (
    <div className="rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[6px_6px_0_var(--ink)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <label className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
              {filterLabel}
            </span>
            <Input
              className="max-w-2xl"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={placeholder}
            />
          </label>
          <p className="break-words pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/52">
            {resultSummary}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[220px] lg:flex-none lg:items-end">
          {actions ? (
            <div className="flex w-full flex-wrap gap-2 lg:justify-end">{actions}</div>
          ) : null}
          <Button
            type="button"
            variant="muted"
            className="w-full lg:w-auto"
            onClick={onClear}
            disabled={clearDisabled}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

type ExperienceManagerProps = {
  setFeedback: (feedback: FeedbackState) => void;
};

function ExperienceManager({ setFeedback }: ExperienceManagerProps) {
  const [items, setItems] = useState(experienceSeedRecords);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultCollectionPageSize);
  const [values, setValues] = useState<ExperienceFormValues>(createExperienceFormValues());
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExperienceFormValues, string>>
  >({});

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [editingId, items],
  );
  const filteredItems = useMemo(() => {
    const query = normalizeQuery(searchQuery);

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      [
        item.role,
        item.company,
        item.location,
        item.period,
        item.summary,
        ...item.achievements,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchQuery]);
  const pagination = useMemo(
    () => paginateItems(filteredItems, currentPage, pageSize),
    [currentPage, filteredItems, pageSize],
  );
  const resultSummary = `${filteredItems.length} of ${items.length} experience records`;

  function openEditor(item?: ExperienceRecord | null) {
    setEditingId(item?.id ?? null);
    setValues(createExperienceFormValues(item));
    setErrors({});
    setOpen(true);
  }

  function closeEditor() {
    setOpen(false);
    setEditingId(null);
    setValues(createExperienceFormValues());
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateExperience(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const nextRecord: ExperienceRecord = {
      id: editingItem?.id ?? `resume-exp-${slugify(values.role)}-${Date.now()}`,
      role: values.role.trim(),
      company: values.company.trim(),
      period: values.period.trim(),
      location: values.location.trim(),
      summary: values.summary.trim(),
      achievements: toLines(values.achievementsText),
      updatedAt: "Just now",
    };

    setItems((currentItems) =>
      editingItem
        ? currentItems.map((item) => (item.id === editingItem.id ? nextRecord : item))
        : [nextRecord, ...currentItems],
    );
    setCurrentPage(1);

    setFeedback({
      title: editingItem ? "Experience updated" : "Experience added",
      detail: `${nextRecord.role} at ${nextRecord.company} is now reflected in the local resume manager.`,
    });
    closeEditor();
  }

  function handleDelete(item: ExperienceRecord) {
    setItems((currentItems) => currentItems.filter((current) => current.id !== item.id));
    setCurrentPage(1);
    setFeedback({
      title: "Experience removed",
      detail: `${item.role} at ${item.company} was removed from the local resume manager.`,
    });
    if (editingId === item.id) {
      closeEditor();
    }
  }

  return (
    <Card className="paper-grid">
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="cream">Experience Manager</Badge>
            <CardTitle>Control the public resume timeline.</CardTitle>
            <CardDescription>
              Every role shown on the public resume route should be editable here.
            </CardDescription>
          </div>
          <Button type="button" variant="blue" onClick={() => openEditor()}>
            Add Experience
          </Button>
        </div>

        <FilterToolbar
          clearDisabled={!searchQuery}
          filterLabel="Filter experience"
          onClear={() => {
            setSearchQuery("");
            setCurrentPage(1);
          }}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          placeholder="Search role, company, location, or achievement..."
          resultSummary={resultSummary}
          searchValue={searchQuery}
        />

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="bg-white/75">
              <CardContent className="space-y-4 text-center">
                <Badge variant="yellow">No Matches</Badge>
                <CardTitle>No experience records match this filter.</CardTitle>
                <CardDescription>
                  Try a broader role, company, or keyword search to bring entries back.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            pagination.pagedItems.map((item, index) => (
              <Card
                key={item.id}
                accent={index % 2 === 0 ? "cream" : "red"}
                className="bg-white/75"
              >
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
                        {item.period}
                      </p>
                      <CardTitle>{item.role}</CardTitle>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/66">
                        {item.company} • {item.location}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="yellow">{item.updatedAt}</Badge>
                      <Button type="button" variant="muted" onClick={() => openEditor(item)}>
                        Edit
                      </Button>
                      <Button type="button" variant="default" onClick={() => handleDelete(item)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-ink/78">{item.summary}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredItems.length > 0 ? (
          <ResumePagination
            currentPage={pagination.safeCurrentPage}
            label="experience items"
            onPageChange={setCurrentPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrentPage(1);
            }}
            pageCount={pagination.pageCount}
            pageSize={pageSize}
            totalItems={filteredItems.length}
          />
        ) : null}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit experience" : "Add experience"}
              </DialogTitle>
              <DialogDescription>
                This manager controls the timeline content shown on the public resume page.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Role" error={errors.role}>
                <Input
                  value={values.role}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, role: event.target.value }))
                  }
                />
              </Field>
              <Field label="Company" error={errors.company}>
                <Input
                  value={values.company}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, company: event.target.value }))
                  }
                />
              </Field>
              <Field label="Period" error={errors.period}>
                <Input
                  value={values.period}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, period: event.target.value }))
                  }
                />
              </Field>
              <Field label="Location" error={errors.location}>
                <Input
                  value={values.location}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, location: event.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Summary" error={errors.summary}>
              <Textarea
                value={values.summary}
                onChange={(event) =>
                  setValues((current) => ({ ...current, summary: event.target.value }))
                }
              />
            </Field>
            <Field
              label="Achievements"
              helper="Use one line per achievement."
              error={errors.achievementsText}
            >
              <Textarea
                value={values.achievementsText}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    achievementsText: event.target.value,
                  }))
                }
                className="min-h-40"
              />
            </Field>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <Button type="button" variant="blue" onClick={handleSubmit}>
                {editingItem ? "Save Experience" : "Add Experience"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

type EducationManagerProps = {
  setFeedback: (feedback: FeedbackState) => void;
};

function EducationManager({ setFeedback }: EducationManagerProps) {
  const [items, setItems] = useState(educationSeedRecords);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultCollectionPageSize);
  const [values, setValues] = useState<EducationFormValues>(createEducationFormValues());
  const [errors, setErrors] = useState<
    Partial<Record<keyof EducationFormValues, string>>
  >({});

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [editingId, items],
  );
  const filteredItems = useMemo(() => {
    const query = normalizeQuery(searchQuery);

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      [item.degree, item.school, item.period, item.description, ...item.highlights]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchQuery]);
  const pagination = useMemo(
    () => paginateItems(filteredItems, currentPage, pageSize),
    [currentPage, filteredItems, pageSize],
  );
  const resultSummary = `${filteredItems.length} of ${items.length} education records`;

  function openEditor(item?: EducationRecord | null) {
    setEditingId(item?.id ?? null);
    setValues(createEducationFormValues(item));
    setErrors({});
    setOpen(true);
  }

  function closeEditor() {
    setOpen(false);
    setEditingId(null);
    setValues(createEducationFormValues());
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateEducation(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const nextRecord: EducationRecord = {
      id: editingItem?.id ?? `resume-edu-${slugify(values.school)}-${Date.now()}`,
      degree: values.degree.trim(),
      school: values.school.trim(),
      period: values.period.trim(),
      description: values.description.trim(),
      highlights: toLines(values.highlightsText),
      updatedAt: "Just now",
    };

    setItems((currentItems) =>
      editingItem
        ? currentItems.map((item) => (item.id === editingItem.id ? nextRecord : item))
        : [nextRecord, ...currentItems],
    );
    setCurrentPage(1);

    setFeedback({
      title: editingItem ? "Education updated" : "Education added",
      detail: `${nextRecord.school} now appears in the local education manager.`,
    });
    closeEditor();
  }

  function handleDelete(item: EducationRecord) {
    setItems((currentItems) => currentItems.filter((current) => current.id !== item.id));
    setCurrentPage(1);
    setFeedback({
      title: "Education removed",
      detail: `${item.school} was removed from the local education manager.`,
    });
    if (editingId === item.id) {
      closeEditor();
    }
  }

  return (
    <Card accent="blue">
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="blue">Education Manager</Badge>
            <CardTitle>Keep academic history current.</CardTitle>
            <CardDescription>
              This covers the education content already visible on the public resume route.
            </CardDescription>
          </div>
          <Button type="button" variant="muted" onClick={() => openEditor()}>
            Add Education
          </Button>
        </div>

        <FilterToolbar
          clearDisabled={!searchQuery}
          filterLabel="Filter education"
          onClear={() => {
            setSearchQuery("");
            setCurrentPage(1);
          }}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          placeholder="Search degree, school, period, or highlight..."
          resultSummary={resultSummary}
          searchValue={searchQuery}
        />

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="bg-white/75">
              <CardContent className="space-y-4 text-center">
                <Badge variant="yellow">No Matches</Badge>
                <CardTitle>No education records match this filter.</CardTitle>
                <CardDescription>
                  Try a broader school, degree, or keyword search to surface the entries again.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            pagination.pagedItems.map((item) => (
              <Card key={item.id} className="bg-white/75">
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
                        {item.period}
                      </p>
                      <CardTitle>{item.degree}</CardTitle>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/66">
                        {item.school}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="cream">{item.updatedAt}</Badge>
                      <Button type="button" variant="muted" onClick={() => openEditor(item)}>
                        Edit
                      </Button>
                      <Button type="button" variant="default" onClick={() => handleDelete(item)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-ink/78">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.highlights.map((highlight) => (
                      <Badge key={highlight} variant="cream">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredItems.length > 0 ? (
          <ResumePagination
            currentPage={pagination.safeCurrentPage}
            label="education items"
            onPageChange={setCurrentPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrentPage(1);
            }}
            pageCount={pagination.pageCount}
            pageSize={pageSize}
            totalItems={filteredItems.length}
          />
        ) : null}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit education" : "Add education"}
              </DialogTitle>
              <DialogDescription>
                Keep the education section aligned with the public resume route.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Degree" error={errors.degree}>
                <Input
                  value={values.degree}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, degree: event.target.value }))
                  }
                />
              </Field>
              <Field label="School" error={errors.school}>
                <Input
                  value={values.school}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, school: event.target.value }))
                  }
                />
              </Field>
              <Field label="Period" error={errors.period}>
                <Input
                  value={values.period}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, period: event.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Description" error={errors.description}>
              <Textarea
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({ ...current, description: event.target.value }))
                }
              />
            </Field>
            <Field
              label="Highlights"
              helper="Use one line per highlight."
              error={errors.highlightsText}
            >
              <Textarea
                value={values.highlightsText}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    highlightsText: event.target.value,
                  }))
                }
                className="min-h-36"
              />
            </Field>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <Button type="button" variant="blue" onClick={handleSubmit}>
                {editingItem ? "Save Education" : "Add Education"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

type CertificatesManagerProps = {
  setFeedback: (feedback: FeedbackState) => void;
};

function CertificatesManager({ setFeedback }: CertificatesManagerProps) {
  const [items, setItems] = useState(certificateSeedRecords);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "standard">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultCollectionPageSize);
  const [values, setValues] = useState<CertificateFormValues>(
    createCertificateFormValues(),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof CertificateFormValues, string>>
  >({});

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [editingId, items],
  );
  const filteredItems = useMemo(() => {
    const query = normalizeQuery(searchQuery);

    return items.filter((item) => {
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" ? item.featured : !item.featured);

      const matchesQuery =
        !query ||
        [item.name, item.issuer, item.year, item.verificationLink, item.credentialId ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesFeatured && matchesQuery;
    });
  }, [featuredFilter, items, searchQuery]);
  const pagination = useMemo(
    () => paginateItems(filteredItems, currentPage, pageSize),
    [currentPage, filteredItems, pageSize],
  );
  const resultSummary = `${filteredItems.length} of ${items.length} certificate records`;

  function openEditor(item?: CertificateRecord | null) {
    setEditingId(item?.id ?? null);
    setValues(createCertificateFormValues(item));
    setErrors({});
    setOpen(true);
  }

  function closeEditor() {
    setOpen(false);
    setEditingId(null);
    setValues(createCertificateFormValues());
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateCertificate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const nextRecord: CertificateRecord = {
      id: editingItem?.id ?? `resume-cert-${slugify(values.name)}-${Date.now()}`,
      name: values.name.trim(),
      issuer: values.issuer.trim(),
      year: values.year.trim(),
      verificationLink: values.verificationLink.trim(),
      credentialId: values.credentialId.trim() || undefined,
      featured: values.featured,
      updatedAt: "Just now",
    };

    setItems((currentItems) =>
      editingItem
        ? currentItems.map((item) => (item.id === editingItem.id ? nextRecord : item))
        : [nextRecord, ...currentItems],
    );
    setCurrentPage(1);

    setFeedback({
      title: editingItem ? "Certificate updated" : "Certificate added",
      detail: `${nextRecord.name} is now available in the local certificates manager.`,
    });
    closeEditor();
  }

  function handleDelete(item: CertificateRecord) {
    setItems((currentItems) => currentItems.filter((current) => current.id !== item.id));
    setCurrentPage(1);
    setFeedback({
      title: "Certificate removed",
      detail: `${item.name} was removed from the local certificates manager.`,
    });
    if (editingId === item.id) {
      closeEditor();
    }
  }

  return (
    <Card id="certificates-manager" accent="red">
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="red">Certificates Manager</Badge>
            <CardTitle>Add credentials that support the resume story.</CardTitle>
            <CardDescription>
              Certificates are required in this review, even though the public resume
              route does not display them yet.
            </CardDescription>
          </div>
          <Button type="button" variant="muted" onClick={() => openEditor()}>
            Add Certificate
          </Button>
        </div>

        <FilterToolbar
          actions={
            <>
              <Button
                type="button"
                size="sm"
                variant={featuredFilter === "all" ? "blue" : "muted"}
                onClick={() => {
                  setFeaturedFilter("all");
                  setCurrentPage(1);
                }}
              >
                All
              </Button>
              <Button
                type="button"
                size="sm"
                variant={featuredFilter === "featured" ? "blue" : "muted"}
                onClick={() => {
                  setFeaturedFilter("featured");
                  setCurrentPage(1);
                }}
              >
                Featured
              </Button>
              <Button
                type="button"
                size="sm"
                variant={featuredFilter === "standard" ? "blue" : "muted"}
                onClick={() => {
                  setFeaturedFilter("standard");
                  setCurrentPage(1);
                }}
              >
                Standard
              </Button>
            </>
          }
          clearDisabled={!searchQuery && featuredFilter === "all"}
          filterLabel="Filter certificates"
          onClear={() => {
            setSearchQuery("");
            setFeaturedFilter("all");
            setCurrentPage(1);
          }}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          placeholder="Search certificate, issuer, year, or credential..."
          resultSummary={resultSummary}
          searchValue={searchQuery}
        />

        <div className="space-y-4">
          {items.length === 0 ? (
            <Card className="bg-white/75">
              <CardContent className="space-y-4 text-center">
                <Badge variant="yellow">Empty State</Badge>
                <CardTitle>No certificates added yet.</CardTitle>
                <CardDescription>
                  Add credentials that support the resume story and future public profile expansions.
                </CardDescription>
                <Button type="button" variant="blue" onClick={() => openEditor()}>
                  Add First Certificate
                </Button>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="bg-white/75">
              <CardContent className="space-y-4 text-center">
                <Badge variant="yellow">No Matches</Badge>
                <CardTitle>No certificates match the current filters.</CardTitle>
                <CardDescription>
                  Try a broader keyword or switch the featured filter back to all certificates.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            pagination.pagedItems.map((item) => (
              <Card key={item.id} className="bg-white/75">
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="cream">{item.year}</Badge>
                        {item.featured ? <Badge variant="blue">Featured</Badge> : null}
                      </div>
                      <CardTitle>{item.name}</CardTitle>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/66">
                        {item.issuer}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="yellow">{item.updatedAt}</Badge>
                      <Button type="button" variant="muted" onClick={() => openEditor(item)}>
                        Edit
                      </Button>
                      <Button type="button" variant="default" onClick={() => handleDelete(item)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <p className="text-sm leading-7 text-ink/78">
                      Verification link: {item.verificationLink}
                    </p>
                    {item.credentialId ? (
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/62">
                        Credential ID: {item.credentialId}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {items.length > 0 && filteredItems.length > 0 ? (
          <ResumePagination
            currentPage={pagination.safeCurrentPage}
            label="certificate items"
            onPageChange={setCurrentPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrentPage(1);
            }}
            pageCount={pagination.pageCount}
            pageSize={pageSize}
            totalItems={filteredItems.length}
          />
        ) : null}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit certificate" : "Add certificate"}
              </DialogTitle>
              <DialogDescription>
                Manage certification details for the resume workspace with local actions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Certificate name" error={errors.name}>
                <Input
                  value={values.name}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </Field>
              <Field label="Issuer" error={errors.issuer}>
                <Input
                  value={values.issuer}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, issuer: event.target.value }))
                  }
                />
              </Field>
              <Field label="Year" error={errors.year}>
                <Input
                  value={values.year}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, year: event.target.value }))
                  }
                />
              </Field>
              <Field label="Credential ID" helper="Optional">
                <Input
                  value={values.credentialId}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      credentialId: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Verification link" error={errors.verificationLink}>
              <Input
                value={values.verificationLink}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    verificationLink: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/72">
                    Featured certificate
                  </p>
                  <p className="text-sm leading-6 text-ink/62">
                    Use this to surface standout credentials later in public resume views.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={values.featured ? "blue" : "muted"}
                  onClick={() =>
                    setValues((current) => ({ ...current, featured: !current.featured }))
                  }
                >
                  {values.featured ? "Featured" : "Mark Featured"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <Button type="button" variant="blue" onClick={handleSubmit}>
                {editingItem ? "Save Certificate" : "Add Certificate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function ResumeCollectionsCms() {
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  return (
    <div className="space-y-6">
      <FeedbackBanner feedback={feedback} />

      <ExperienceManager setFeedback={setFeedback} />

      <div className="grid gap-6 xl:grid-cols-2">
        <EducationManager setFeedback={setFeedback} />
        <CertificatesManager setFeedback={setFeedback} />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <Badge variant="cream">Audit Summary</Badge>
          <CardTitle>The resume workspace now covers the missing sections.</CardTitle>
          <CardDescription>
            The admin resume surface now includes PDF upload, experience management,
            education management, and certificate management, which closes the gap
            between the public resume route and the required workspace modules.
          </CardDescription>
          <Separator />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
                Upload
              </p>
              <p className="mt-3 font-display text-3xl uppercase leading-none text-ink">
                Ready
              </p>
            </div>
            <div className="rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
                Experience
              </p>
              <p className="mt-3 font-display text-3xl uppercase leading-none text-ink">
                Managed
              </p>
            </div>
            <div className="rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
                Education
              </p>
              <p className="mt-3 font-display text-3xl uppercase leading-none text-ink">
                Managed
              </p>
            </div>
            <div className="rounded-[22px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
                Certificates
              </p>
              <p className="mt-3 font-display text-3xl uppercase leading-none text-ink">
                Added
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
