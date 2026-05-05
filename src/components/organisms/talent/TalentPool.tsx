"use client";

import { useAccessibleOverlay } from "@/components/accessibility/useAccessibleOverlay";
import { ActiveFilterChip } from "@/components/molecules/actions/ActiveFilterChip";
import { TalentCard } from "@/components/molecules/Card/TalentCard";
import { FilterSection } from "@/components/molecules/content/FilterSection";
import { SectionIntro } from "@/components/molecules/content/SectionIntro";
import { AppButton } from "@/components/atoms/Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TalentProfile } from "./talentData";
import styles from "./TalentPool.module.css";

type TalentPoolProps = {
  talents: TalentProfile[];
};

const PAGE_SIZE = 6;
const SENIORITY_LEVELS = ["Junior", "Mid-Level", "Senior", "Lead", "Principal"] as const;
const SENIORITY_RANK: Record<(typeof SENIORITY_LEVELS)[number], number> = {
  Junior: 1,
  "Mid-Level": 2,
  Senior: 3,
  Lead: 4,
  Principal: 5,
};

export function TalentPool({ talents }: TalentPoolProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSortParam = searchParams.get("sort");
  const initialSortBy =
    initialSortParam === "name" || initialSortParam === "seniority"
      ? initialSortParam
      : "best-match";
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"best-match" | "name" | "seniority">(initialSortBy);
  const [visibleState, setVisibleState] = useState({ filterKey: "", count: PAGE_SIZE });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterDrawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(talents.map((talent) => talent.category))).sort(),
    [talents],
  );
  const roles = useMemo(
    () => Array.from(new Set(talents.map((talent) => talent.role))).sort(),
    [talents],
  );
  const quickSearches = useMemo(() => roles.slice(0, 4), [roles]);
  const locations = useMemo(
    () => Array.from(new Set(talents.map((talent) => talent.location))).sort(),
    [talents],
  );
  const skills = useMemo(
    () => Array.from(new Set(talents.flatMap((talent) => talent.skills))).sort(),
    [talents],
  );
  const searchTerms = useMemo(
    () => Array.from(new Set(talents.flatMap((talent) => [talent.name, talent.role, talent.location, ...talent.skills]))),
    [talents],
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const filterKey = useMemo(
    () =>
      JSON.stringify([
        search,
        selectedCategories,
        selectedLevels,
        selectedLocations,
        selectedRoles,
        selectedSkills,
      ]),
    [search, selectedCategories, selectedLevels, selectedLocations, selectedRoles, selectedSkills],
  );

  const activeFilterCount =
    selectedCategories.length +
    selectedLevels.length +
    selectedLocations.length +
    selectedRoles.length +
    selectedSkills.length;

  const toggleSelection = (
    current: string[],
    value: string,
    setter: (next: string[]) => void,
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const filteredTalents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return talents.filter((talent) => {
      if (query) {
        const haystack = [
          talent.name,
          talent.role,
          talent.location,
          talent.category,
          talent.tagline,
          ...talent.skills,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (selectedCategories.length > 0 && !selectedCategories.includes(talent.category)) {
        return false;
      }

      if (selectedLevels.length > 0 && !selectedLevels.includes(talent.experienceLevel)) {
        return false;
      }

      if (selectedLocations.length > 0 && !selectedLocations.includes(talent.location)) {
        return false;
      }

      if (selectedRoles.length > 0 && !selectedRoles.includes(talent.role)) {
        return false;
      }

      if (
        selectedSkills.length > 0 &&
        !selectedSkills.some((skill) => talent.skills.includes(skill))
      ) {
        return false;
      }

      return true;
    });
  }, [
    search,
    selectedCategories,
    selectedLevels,
    selectedLocations,
    selectedRoles,
    selectedSkills,
    talents,
  ]);

  const sortedTalents = useMemo(() => {
    if (sortBy === "best-match") {
      return filteredTalents;
    }

    const sorted = [...filteredTalents];

    if (sortBy === "name") {
      sorted.sort((left, right) => left.name.localeCompare(right.name));
      return sorted;
    }

    sorted.sort(
      (left, right) =>
        SENIORITY_RANK[right.experienceLevel] - SENIORITY_RANK[left.experienceLevel],
    );
    return sorted;
  }, [filteredTalents, sortBy]);
  const suggestionTerms = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }

    return searchTerms
      .filter((term) => term.toLowerCase().includes(query) && term.toLowerCase() !== query)
      .slice(0, 5);
  }, [search, searchTerms]);

  useAccessibleOverlay({
    isOpen: mobileFiltersOpen,
    containerRef: filterDrawerRef,
    initialFocusRef: closeButtonRef,
    onClose: () => setMobileFiltersOpen(false),
  });

  const visibleCount = visibleState.filterKey === filterKey ? visibleState.count : PAGE_SIZE;
  const visibleTalents = sortedTalents.slice(0, visibleCount);
  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;
  const hasSuggestions = suggestionTerms.length > 0;
  const suggestionsListId = "talent-search-suggestions";

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (search.trim().length > 0) {
      nextParams.set("q", search.trim());
    } else {
      nextParams.delete("q");
    }

    if (sortBy !== "best-match") {
      nextParams.set("sort", sortBy);
    } else {
      nextParams.delete("sort");
    }

    const currentQuery = searchParams.toString();
    const nextQuery = nextParams.toString();
    if (currentQuery !== nextQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [search, sortBy, router, pathname, searchParams]);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedLocations([]);
    setSelectedRoles([]);
    setSelectedSkills([]);
    setVisibleState({ filterKey: "", count: PAGE_SIZE });
  };

  const applySearchTerm = (term: string) => {
    setSearch(term);
    setActiveSuggestionIndex(-1);
  };

  return (
    <section id="talent-pool" className={styles.root} aria-labelledby="talent-pool-heading">
      <h2 id="talent-pool-heading" className="sr-only">
        Talent directory and filters
      </h2>
      <div className={styles.layout}>
        <div className={styles.mobileFilterBar}>
          <AppButton
            type="button"
            className={styles.filterToggle}
            onClick={() => setMobileFiltersOpen(true)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="talent-filters-panel"
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </AppButton>
          <span className={styles.countBadgeMobile}>
            {filteredTalents.length} talents
          </span>
        </div>

        {mobileFiltersOpen ? (
          <div
            className={styles.overlay}
            aria-hidden="true"
            onClick={() => setMobileFiltersOpen(false)}
          />
        ) : null}

        <aside
          id="talent-filters-panel"
          ref={filterDrawerRef}
          className={`${styles.sidebar} ${
            mobileFiltersOpen ? styles.sidebarOpen : ""
          }`}
          aria-label="Talent filters"
          role={mobileFiltersOpen ? "dialog" : undefined}
          aria-modal={mobileFiltersOpen ? "true" : undefined}
          tabIndex={mobileFiltersOpen ? -1 : undefined}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          >
            ×
          </button>

          {hasActiveFilters ? (
            <div className={styles.sidebarSection}>
              <AppButton type="button" className={styles.clearFilters} onClick={clearAllFilters}>
                Clear all filters
              </AppButton>
            </div>
          ) : null}

          <FilterSection
            title="Specialization"
            className={styles.sidebarSection}
            headingClassName={styles.sidebarHeading}
          >
            <div className={styles.pills}>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    toggleSelection(selectedCategories, category, setSelectedCategories)
                  }
                  aria-pressed={selectedCategories.includes(category)}
                  className={`${styles.pill} ${
                    selectedCategories.includes(category) ? styles.pillActive : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </FilterSection>
          <FilterSection
            title="Seniority"
            className={styles.sidebarSection}
            headingClassName={styles.sidebarHeading}
          >
            <div className={styles.checkList}>
              {SENIORITY_LEVELS.map((level) => (
                <label key={level} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleSelection(selectedLevels, level, setSelectedLevels)}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </FilterSection>
          <FilterSection
            title="Roles"
            className={styles.sidebarSection}
            headingClassName={styles.sidebarHeading}
          >
            <div className={styles.checkList}>
              {roles.map((role) => (
                <label key={role} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleSelection(selectedRoles, role, setSelectedRoles)}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </FilterSection>
          <FilterSection
            title="Skills"
            className={styles.sidebarSection}
            headingClassName={styles.sidebarHeading}
          >
            <div className={styles.pills}>
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSelection(selectedSkills, skill, setSelectedSkills)}
                  aria-pressed={selectedSkills.includes(skill)}
                  className={`${styles.pill} ${
                    selectedSkills.includes(skill) ? styles.pillActive : ""
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </FilterSection>
          <FilterSection
            title="Location"
            className={styles.sidebarSection}
            headingClassName={styles.sidebarHeading}
          >
            <div className={styles.checkList}>
              {locations.map((location) => (
                <label key={location} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(location)}
                    onChange={() =>
                      toggleSelection(selectedLocations, location, setSelectedLocations)
                    }
                  />
                  <span>{location}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <div className={styles.mobileActions}>
            <AppButton
              type="button"
              className={styles.applyButton}
              onClick={() => setMobileFiltersOpen(false)}
            >
              View results ({filteredTalents.length})
            </AppButton>
          </div>
        </aside>

        <div className={styles.main}>
          <p className="sr-only" role="status" aria-live="polite">
            {sortedTalents.length} talents match current filters.
          </p>
          <SectionIntro
            title="Talent matches"
            body="Filter and browse profiles ready for your next role."
            className={styles.resultsIntro}
          />
          {hasActiveFilters ? (
            <div className={styles.activeFilters} aria-label="Active filters">
              {selectedCategories.map((category) => (
                <ActiveFilterChip
                  key={`category-${category}`}
                  className={styles.activeFilterChip}
                  onRemove={() =>
                    toggleSelection(selectedCategories, category, setSelectedCategories)
                  }
                  ariaLabel={`Remove category filter ${category}`}
                  label={category}
                />
              ))}
              {selectedLevels.map((level) => (
                <ActiveFilterChip
                  key={`level-${level}`}
                  className={styles.activeFilterChip}
                  onRemove={() => toggleSelection(selectedLevels, level, setSelectedLevels)}
                  ariaLabel={`Remove seniority filter ${level}`}
                  label={level}
                />
              ))}
              {selectedLocations.map((location) => (
                <ActiveFilterChip
                  key={`location-${location}`}
                  className={styles.activeFilterChip}
                  onRemove={() =>
                    toggleSelection(selectedLocations, location, setSelectedLocations)
                  }
                  ariaLabel={`Remove location filter ${location}`}
                  label={location}
                />
              ))}
              {selectedRoles.map((role) => (
                <ActiveFilterChip
                  key={`role-${role}`}
                  className={styles.activeFilterChip}
                  onRemove={() => toggleSelection(selectedRoles, role, setSelectedRoles)}
                  ariaLabel={`Remove role filter ${role}`}
                  label={role}
                />
              ))}
              {selectedSkills.map((skill) => (
                <ActiveFilterChip
                  key={`skill-${skill}`}
                  className={styles.activeFilterChip}
                  onRemove={() => toggleSelection(selectedSkills, skill, setSelectedSkills)}
                  ariaLabel={`Remove skill filter ${skill}`}
                  label={skill}
                />
              ))}
              <AppButton type="button" className={styles.clearInline} onClick={clearAllFilters}>
                Clear all
              </AppButton>
            </div>
          ) : null}
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <label htmlFor="talent-search-input" className={styles.searchLabel}>
                Search talent
              </label>
              <span className={styles.searchIcon} aria-hidden="true">
                <svg
                  className={styles.searchIconSvg}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8 15.8L21 21M10.2 17.4a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                id="talent-search-input"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveSuggestionIndex(-1);
                }}
                onKeyDown={(event) => {
                  if (!hasSuggestions) {
                    return;
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveSuggestionIndex((index) =>
                      index >= suggestionTerms.length - 1 ? 0 : index + 1,
                    );
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveSuggestionIndex((index) =>
                      index <= 0 ? suggestionTerms.length - 1 : index - 1,
                    );
                  }

                  if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                    event.preventDefault();
                    applySearchTerm(suggestionTerms[activeSuggestionIndex]);
                  }

                  if (event.key === "Escape") {
                    setActiveSuggestionIndex(-1);
                  }
                }}
                placeholder="Search by role, skill, location, or keyword..."
                className={styles.searchInput}
                aria-label="Search talent"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={hasSuggestions}
                aria-controls={hasSuggestions ? suggestionsListId : undefined}
                aria-activedescendant={
                  activeSuggestionIndex >= 0
                    ? `${suggestionsListId}-${activeSuggestionIndex}`
                    : undefined
                }
              />
              <p className={styles.searchHelper}>Try role, location, skill, or candidate name.</p>
              {search.trim().length > 1 ? (
                hasSuggestions ? (
                  <ul className={styles.autoSuggestList} id={suggestionsListId} role="listbox" aria-label="Search suggestions">
                    {suggestionTerms.map((term, index) => (
                      <li key={`suggest-${term}`} role="option" aria-selected={index === activeSuggestionIndex}>
                        <button
                          id={`${suggestionsListId}-${index}`}
                          type="button"
                          className={`${styles.autoSuggestItem} ${
                            index === activeSuggestionIndex ? styles.autoSuggestItemActive : ""
                          }`}
                          onClick={() => applySearchTerm(term)}
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.autoSuggestEmpty}>No direct suggestions. Try a broader keyword.</p>
                )
              ) : null}
              <div className={styles.quickSearches} aria-label="Popular searches">
                {quickSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className={styles.quickSearch}
                    onClick={() => applySearchTerm(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            <span className={styles.countBadge} role="status" aria-live="polite">
              Available talents: {sortedTalents.length}
            </span>
          </div>
          <div className={styles.controlsRow}>
            <label className={styles.sortLabel} htmlFor="talent-sort-select">
              Sort by
            </label>
            <select
              id="talent-sort-select"
              className={styles.sortSelect}
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as "best-match" | "name" | "seniority")
              }
            >
              <option value="best-match">Best match</option>
              <option value="name">Name (A-Z)</option>
              <option value="seniority">Seniority (High to low)</option>
            </select>
          </div>

          {visibleTalents.length > 0 ? (
            <div className={styles.grid}>
              {visibleTalents.map((talent) => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No matching talents</p>
              <p className={styles.emptyCopy}>
                Try adjusting your search or removing a few filters.
              </p>
              {quickSearches.length > 0 ? (
                <div className={styles.emptySuggestions}>
                  <p className={styles.emptySuggestionsLabel}>Suggested searches</p>
                  <div className={styles.quickSearches}>
                    {quickSearches.map((term) => (
                      <button
                        key={`empty-${term}`}
                        type="button"
                        className={styles.quickSearch}
                        onClick={() => applySearchTerm(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {hasActiveFilters ? (
                <AppButton type="button" className={styles.emptyAction} onClick={clearAllFilters}>
                  Clear filters and show all talent
                </AppButton>
              ) : null}
            </div>
          )}

          {visibleCount < sortedTalents.length ? (
            <div className={styles.loadMoreWrap}>
              <AppButton
                type="button"
                className={styles.loadMore}
                onClick={() =>
                  setVisibleState((state) => {
                    const currentCount = state.filterKey === filterKey ? state.count : PAGE_SIZE;
                    return { filterKey, count: currentCount + PAGE_SIZE };
                  })
                }
              >
                Load More Talents
              </AppButton>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
