"use client";

import { useEffect, useMemo, useState } from "react";
import type { TalentProfile } from "./talentData";
import { TalentCard } from "./TalentCard";
import styles from "./TalentPool.module.css";

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

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileFiltersOpen]);

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
    <section className={styles.sidebarSection}>
      <h2 className={styles.sidebarHeading}>{title}</h2>
      {children}
    </section>
  );

  return (
    <section className={styles.pool} aria-labelledby="talent-pool-heading">
      <div className={styles.layout}>
        <div className={styles.mobileFilterBar}>
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <span className={styles.countBadgeMobile}>{filteredTalents.length} talents</span>
        </div>

        {mobileFiltersOpen ? (
          <div
            className={styles.overlay}
            aria-hidden="true"
            onClick={() => setMobileFiltersOpen(false)}
          />
        ) : null}

        <aside
          className={`${styles.sidebar} ${mobileFiltersOpen ? styles.sidebarOpen : ""}`}
          aria-label="Talent filters"
        >
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          >
            ×
          </button>

          {activeFilterCount > 0 || search ? (
            <div className={styles.sidebarSection}>
              <button type="button" className={styles.clearFilters} onClick={clearAllFilters}>
                Clear all filters
              </button>
            </div>
          ) : null}

          {filterSection(
            "Specialization",
            <div className={styles.pills}>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    toggleSelection(selectedCategories, category, setSelectedCategories)
                  }
                  className={`${styles.pill} ${
                    selectedCategories.includes(category) ? styles.pillActive : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>,
          )}

          {filterSection(
            "Seniority",
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
            </div>,
          )}

          {filterSection(
            "Roles",
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
            </div>,
          )}

          {filterSection(
            "Skills",
            <div className={styles.pills}>
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSelection(selectedSkills, skill, setSelectedSkills)}
                  className={`${styles.pill} ${
                    selectedSkills.includes(skill) ? styles.pillActive : ""
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>,
          )}

          {filterSection(
            "Location",
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
            </div>,
          )}

          <div className={styles.mobileActions}>
            <button
              type="button"
              className={styles.applyButton}
              onClick={() => setMobileFiltersOpen(false)}
            >
              View results ({filteredTalents.length})
            </button>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by role, skill, location, or keyword..."
                className={styles.searchInput}
                aria-label="Search talent"
              />
            </div>
            <span id="talent-pool-heading" className={styles.countBadge}>
              Available talents: {filteredTalents.length}
            </span>
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
            </div>
          )}

          {visibleCount < filteredTalents.length ? (
            <div className={styles.loadMoreWrap}>
              <button
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
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
