"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
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

import type { SkillRecord } from "./skill.default-values";

type SkillListProps = {
  isLoading: boolean;
  items: SkillRecord[];
  onAddSkill: () => void;
  onDeleteSkill: (skill: SkillRecord) => void;
  onEditSkill: (skill: SkillRecord) => void;
};

export function SkillList({
  isLoading,
  items,
  onAddSkill,
  onDeleteSkill,
  onEditSkill,
}: SkillListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(
    () => ["all", ...new Set(items.map((item) => item.values.category))],
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.values.name.toLowerCase().includes(normalizedQuery) ||
        item.values.category.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        categoryFilter === "all" || item.values.category === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [categoryFilter, items, searchQuery]);

  const groupedSkills = useMemo(() => {
    return filteredItems.reduce<Record<string, SkillRecord[]>>((groups, item) => {
      if (!groups[item.values.category]) {
        groups[item.values.category] = [];
      }

      groups[item.values.category].push(item);
      return groups;
    }, {});
  }, [filteredItems]);

  const orderedCategories = useMemo(
    () => Object.keys(groupedSkills).sort(),
    [groupedSkills],
  );

  const featuredCount = items.filter((item) => item.values.featured).length;
  const hasFilters = searchQuery.trim().length > 0 || categoryFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-white/75">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Total Skills
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {items.length}
            </p>
          </CardContent>
        </Card>
        <Card accent="blue">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Categories
            </p>
            <p className="font-display text-4xl uppercase leading-none text-ink">
              {categories.length - 1}
            </p>
          </CardContent>
        </Card>
        <Card accent="red">
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Featured Skills
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
              <Badge variant="cream">Capability Board</Badge>
              <CardTitle>Group, search, and tune each skill entry.</CardTitle>
              <CardDescription>
                This list stays card-based so category groupings remain visible instead of
                collapsing into a generic management grid.
              </CardDescription>
            </div>
            <Button onClick={onAddSkill}>Add Skill</Button>
          </div>

          <Separator />

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2">
              <label
                htmlFor="skill-search"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
              >
                Search skills
              </label>
              <Input
                id="skill-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by skill name or category"
              />
            </div>

            <div className="space-y-2">
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
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="rounded-[24px] border-[3px] border-ink bg-white/70 p-5 shadow-[6px_6px_0_var(--ink)]"
                >
                  <div className="h-4 w-24 animate-pulse rounded-full bg-ink/10" />
                  <div className="mt-4 h-8 w-3/4 animate-pulse rounded-full bg-ink/10" />
                  <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-ink/10" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card accent="cream" className="bg-white/75">
              <CardContent className="space-y-4">
                <Badge variant="yellow">No Results</Badge>
                <CardTitle>
                  {hasFilters
                    ? "No skills match the current filters."
                    : "The skills board is still empty."}
                </CardTitle>
                <CardDescription>
                  {hasFilters
                    ? "Adjust the search or category filter to reveal grouped skills again."
                    : "Start a new skill entry to build out the capabilities board."}
                </CardDescription>
                <div className="flex flex-wrap gap-3">
                  {hasFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setCategoryFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                  <Button type="button" onClick={onAddSkill}>
                    Add First Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orderedCategories.map((category) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                      <Badge variant="cream">{category}</Badge>
                      <h3 className="font-display text-3xl uppercase leading-none text-ink">
                        {category}
                      </h3>
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
                      {groupedSkills[category]?.length ?? 0} items
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {groupedSkills[category]?.map((skill) => (
                      <Card key={skill.id} className="bg-white/75">
                        <CardContent className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-2">
                              <p className="font-display text-3xl uppercase leading-none text-ink">
                                {skill.values.name}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant={
                                    skill.values.level === "advanced"
                                      ? "blue"
                                      : skill.values.level === "intermediate"
                                        ? "yellow"
                                        : "cream"
                                  }
                                >
                                  {skill.values.level}
                                </Badge>
                                {skill.values.featured ? (
                                  <Badge variant="red">Featured</Badge>
                                ) : null}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger size="sm" variant="muted">
                                Actions
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Skill Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onEditSkill(skill)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDeleteSkill(skill)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-sm leading-7 text-ink/72">
                            Used inside the {skill.values.category.toLowerCase()} group for the
                            public portfolio and resume-facing skill modules.
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
