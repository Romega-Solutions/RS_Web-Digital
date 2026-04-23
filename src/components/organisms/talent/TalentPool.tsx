"use client";

import { useAccessibleOverlay } from "@/components/accessibility/useAccessibleOverlay";
import { useMemo, useRef, useState } from "react";
import type { TalentProfile } from "./talentData";
import { TalentCard } from "./TalentCard";

type TalentPoolProps = {
  talents: TalentProfile[];
};

const PAGE_SIZE = 6;
const SENIORITY_LEVELS = ["Junior", "Mid-Level", "Senior", "Lead", "Principal"] as const;

export function TalentPool({ talents }: TalentPoolProps) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
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
  const locations = useMemo(
    () => Array.from(new Set(talents.map((talent) => talent.location))).sort(),
    [talents],
  );
  const skills = useMemo(
    () => Array.from(new Set(talents.flatMap((talent) => talent.skills))).sort(),
    [talents],
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

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

  useAccessibleOverlay({
    isOpen: mobileFiltersOpen,
    containerRef: filterDrawerRef,
    initialFocusRef: closeButtonRef,
    onClose: () => setMobileFiltersOpen(false),
  });

  const visibleCount = visibleState.filterKey === filterKey ? visibleState.count : PAGE_SIZE;
  const visibleTalents = filteredTalents.slice(0, visibleCount);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedLocations([]);
    setSelectedRoles([]);
    setSelectedSkills([]);
    setVisibleState({ filterKey: "", count: PAGE_SIZE });
  };

  const filterSection = (title: string, children: React.ReactNode) => (
    <section className="talent-pool__sidebar-section">
      <h2 className="talent-pool__sidebar-heading">{title}</h2>
      {children}
    </section>
  );

  return (
    <section className="talent-pool" aria-labelledby="talent-pool-heading">
      <div className="talent-pool__layout">
        <div className="talent-pool__mobile-filter-bar">
          <button
            type="button"
            className="talent-pool__filter-toggle"
            onClick={() => setMobileFiltersOpen(true)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="talent-filters-panel"
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <span className="talent-pool__count-badge talent-pool__count-badge--mobile">
            {filteredTalents.length} talents
          </span>
        </div>

        {mobileFiltersOpen ? (
          <div
            className="talent-pool__overlay"
            aria-hidden="true"
            onClick={() => setMobileFiltersOpen(false)}
          />
        ) : null}

        <aside
          id="talent-filters-panel"
          ref={filterDrawerRef}
          className={`talent-pool__sidebar ${
            mobileFiltersOpen ? "talent-pool__sidebar--open" : ""
          }`}
          aria-label="Talent filters"
          role={mobileFiltersOpen ? "dialog" : undefined}
          aria-modal={mobileFiltersOpen ? "true" : undefined}
          tabIndex={mobileFiltersOpen ? -1 : undefined}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="talent-pool__close-button"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          >
            ×
          </button>

          {activeFilterCount > 0 || search ? (
            <div className="talent-pool__sidebar-section">
              <button type="button" className="talent-pool__clear-filters" onClick={clearAllFilters}>
                Clear all filters
              </button>
            </div>
          ) : null}

          {filterSection(
            "Specialization",
            <div className="talent-pool__pills">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    toggleSelection(selectedCategories, category, setSelectedCategories)
                  }
                  className={`talent-pool__pill ${
                    selectedCategories.includes(category) ? "talent-pool__pill--active" : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>,
          )}

          {filterSection(
            "Seniority",
            <div className="talent-pool__check-list">
              {SENIORITY_LEVELS.map((level) => (
                <label key={level} className="talent-pool__checkbox-row">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleSelection(selectedLevels, level, setSelectedLevels)}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>,
          )}

          {filterSection(
            "Roles",
            <div className="talent-pool__check-list">
              {roles.map((role) => (
                <label key={role} className="talent-pool__checkbox-row">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleSelection(selectedRoles, role, setSelectedRoles)}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>,
          )}

          {filterSection(
            "Skills",
            <div className="talent-pool__pills">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSelection(selectedSkills, skill, setSelectedSkills)}
                  className={`talent-pool__pill ${
                    selectedSkills.includes(skill) ? "talent-pool__pill--active" : ""
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>,
          )}

          {filterSection(
            "Location",
            <div className="talent-pool__check-list">
              {locations.map((location) => (
                <label key={location} className="talent-pool__checkbox-row">
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
            </div>,
          )}

          <div className="talent-pool__mobile-actions">
            <button
              type="button"
              className="talent-pool__apply-button"
              onClick={() => setMobileFiltersOpen(false)}
            >
              View results ({filteredTalents.length})
            </button>
          </div>
        </aside>

        <div className="talent-pool__main">
          <div className="talent-pool__search-row">
            <div className="talent-pool__search-wrap">
              <span className="talent-pool__search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by role, skill, location, or keyword..."
                className="talent-pool__search-input"
                aria-label="Search talent"
              />
            </div>
            <span id="talent-pool-heading" className="talent-pool__count-badge" role="status" aria-live="polite">
              Available talents: {filteredTalents.length}
            </span>
          </div>

          {visibleTalents.length > 0 ? (
            <div className="talent-pool__grid">
              {visibleTalents.map((talent) => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>
          ) : (
            <div className="talent-pool__empty-state">
              <p className="talent-pool__empty-title">No matching talents</p>
              <p className="talent-pool__empty-copy">
                Try adjusting your search or removing a few filters.
              </p>
            </div>
          )}

          {visibleCount < filteredTalents.length ? (
            <div className="talent-pool__load-more-wrap">
              <button
                type="button"
                className="talent-pool__load-more"
                onClick={() =>
                  setVisibleState((state) => {
                    const currentCount = state.filterKey === filterKey ? state.count : PAGE_SIZE;
                    return { filterKey, count: currentCount + PAGE_SIZE };
                  })
                }
              >
                Load More Talents
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
