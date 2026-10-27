"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { countryOptions, toCountryOption, type CountryCode } from "@/lib/form/countries";
import {
  TYPEAHEAD_START,
  isTypeaheadActive,
  typeaheadStep,
  type TypeaheadState,
} from "@/lib/form/typeahead";
import styles from "./CountryPicker.module.css";

// A custom list instead of a native select, so the list is a small scrolling
// box under the phone control (never the whole window), and typing a letter
// finds a country by NAME (see lib/form/typeahead).

const MAX_LIST_HEIGHT = 300; // px
const MIN_LIST_HEIGHT = 120;
const MAX_LIST_WIDTH = 320;
const EDGE = 8;
const GAP = 4;
const PAGE_STEP = 8;

type Placement = { flip: boolean; maxHeight: number; width: number; left: number };

/** The visible area for the list: the window, narrowed by any ancestor that clips its content (a card with rounded, hidden edges). */
function visibleBounds(anchor: HTMLElement) {
  const bounds = {
    top: 0,
    left: 0,
    right: document.documentElement.clientWidth,
    bottom: window.innerHeight,
  };
  for (let el = anchor.parentElement; el && el !== document.body; el = el.parentElement) {
    const style = getComputedStyle(el);
    if (/(hidden|clip|auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)) {
      const rect = el.getBoundingClientRect();
      bounds.top = Math.max(bounds.top, rect.top);
      bounds.left = Math.max(bounds.left, rect.left);
      bounds.right = Math.min(bounds.right, rect.right);
      bounds.bottom = Math.min(bounds.bottom, rect.bottom);
    }
  }
  return bounds;
}

/** Where the list goes: under the control, or above it when there is no room below. */
function measure(anchor: HTMLElement): Placement {
  const rect = anchor.getBoundingClientRect();
  const view = visibleBounds(anchor);
  const width = Math.min(MAX_LIST_WIDTH, view.right - view.left - EDGE * 2);
  const below = view.bottom - rect.bottom - GAP - EDGE;
  const above = rect.top - view.top - GAP - EDGE;
  const flip = below < 200 && above > below;
  const room = flip ? above : below;
  const maxHeight = Math.max(MIN_LIST_HEIGHT, Math.min(MAX_LIST_HEIGHT, room));
  let left = 0;
  if (rect.left + width > view.right - EDGE) left = view.right - EDGE - width - rect.left;
  if (rect.left + left < view.left + EDGE) left = view.left + EDGE - rect.left;
  return { flip, maxHeight, width, left };
}

type CountryPickerProps = {
  country: CountryCode;
  /** Listed first, above the A-Z list. */
  defaultCountry: CountryCode;
  onSelect: (code: CountryCode) => void;
  /** The element the list hangs under (the phone box). */
  anchorRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
};

export function CountryPicker({ country, defaultCountry, onSelect, anchorRef, disabled }: CountryPickerProps) {
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (code: string) => `${id}-opt-${code}`;
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const typed = useRef<TypeaheadState>(TYPEAHEAD_START);
  // How to bring the highlighted row into view after the next render (list scroll only, never the page).
  const scrollMode = useRef<"center" | "nearest" | null>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<CountryCode>(country);
  const [placement, setPlacement] = useState<Placement | null>(null);

  const selected = useMemo(() => toCountryOption(country), [country]);
  const all = useMemo(() => countryOptions(), []);
  const first = useMemo(() => toCountryOption(defaultCountry), [defaultCountry]);
  // The default country is listed once, at the top; arrow keys follow the shown order.
  const shown = useMemo(
    () => [first, ...all.filter((option) => option.code !== defaultCountry)],
    [all, first, defaultCountry],
  );

  function openList(startAt: CountryCode) {
    const anchor = anchorRef.current;
    if (anchor) setPlacement(measure(anchor));
    setActive(startAt);
    scrollMode.current = "center";
    typed.current = TYPEAHEAD_START;
    setOpen(true);
  }

  function closeList() {
    typed.current = TYPEAHEAD_START;
    setOpen(false);
  }

  function choose(code: CountryCode) {
    closeList();
    if (code !== country) onSelect(code);
  }

  function moveTo(code: CountryCode) {
    scrollMode.current = "nearest";
    setActive(code);
  }

  function step(delta: number) {
    const index = shown.findIndex((option) => option.code === active);
    const next = Math.min(shown.length - 1, Math.max(0, (index < 0 ? 0 : index) + delta));
    moveTo(shown[next].code);
  }

  // Keep the highlighted row inside the list box by moving the list only.
  useLayoutEffect(() => {
    const mode = scrollMode.current;
    scrollMode.current = null;
    const list = listRef.current;
    if (!open || !mode || !list) return;
    const row = document.getElementById(optionId(active));
    if (!row) return;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (mode === "center") {
      list.scrollTop = Math.max(0, top - (list.clientHeight - row.offsetHeight) / 2);
    } else if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId only depends on id
  }, [open, active]);

  // A tap or click outside closes the list.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (root && event.target instanceof Node && !root.contains(event.target)) closeList();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function typeAhead(key: string): boolean {
    const now = Date.now();
    const result = typeaheadStep(typed.current, key, now, all);
    const changed = result.state !== typed.current;
    if (result.match) {
      if (open) moveTo(result.match.code);
      else openList(result.match.code);
    }
    // After openList, which starts a fresh search.
    typed.current = result.state;
    return changed || Boolean(result.match);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || event.ctrlKey || event.metaKey || event.altKey) return;
    const { key } = event;

    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
        event.preventDefault();
        openList(country);
        return;
      }
      if (typeAhead(key)) event.preventDefault();
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        step(1);
        return;
      case "ArrowUp":
        event.preventDefault();
        step(-1);
        return;
      case "PageDown":
        event.preventDefault();
        step(PAGE_STEP);
        return;
      case "PageUp":
        event.preventDefault();
        step(-PAGE_STEP);
        return;
      case "Home":
        event.preventDefault();
        moveTo(shown[0].code);
        return;
      case "End":
        event.preventDefault();
        moveTo(shown[shown.length - 1].code);
        return;
      case "Enter":
        event.preventDefault();
        choose(active);
        return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        closeList();
        return;
      case "Tab":
        // Like a native select: Tab keeps the highlighted country and moves on.
        choose(active);
        return;
      case " ":
        event.preventDefault();
        // While a search is running a space is part of the name; otherwise it picks.
        if (isTypeaheadActive(typed.current, Date.now())) typeAhead(key);
        else choose(active);
        return;
      default:
        if (typeAhead(key)) event.preventDefault();
    }
  }

  const listStyle: CSSProperties | undefined = placement
    ? {
        maxHeight: placement.maxHeight,
        width: placement.width,
        left: placement.left,
        ...(placement.flip ? { bottom: `calc(100% + ${GAP}px)` } : { top: `calc(100% + ${GAP}px)` }),
      }
    : undefined;

  return (
    <span className={styles.root} ref={rootRef}>
      <button
        type="button"
        role="combobox"
        className={styles.button}
        aria-label={`Country calling code, ${selected.name} (+${selected.callingCode})`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        disabled={disabled}
        onClick={() => (open ? closeList() : openList(country))}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          // Some browsers click on Space key-up even after the key-down was handled.
          if (event.key === " ") event.preventDefault();
        }}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && !rootRef.current?.contains(next)) closeList();
        }}
      >
        <span className={styles.flag} aria-hidden="true" suppressHydrationWarning>
          {selected.flag}
        </span>
        <span aria-hidden="true">(+{selected.callingCode})</span>
        <svg className={styles.chevron} viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Countries"
          className={styles.list}
          style={listStyle}
          // Keep the focus on the button while the list is used with the mouse or a finger.
          onMouseDown={(event) => event.preventDefault()}
        >
          {shown.map((option, index) => (
            <Row
              key={option.code}
              id={optionId(option.code)}
              flag={option.flag}
              text={`${option.name} (+${option.callingCode})`}
              selected={option.code === country}
              active={option.code === active}
              onHover={() => setActive(option.code)}
              onPick={() => choose(option.code)}
              dividerAfter={index === 0}
            />
          ))}
        </ul>
      ) : null}
    </span>
  );
}

function Row({
  id,
  flag,
  text,
  selected,
  active,
  onHover,
  onPick,
  dividerAfter,
}: {
  id: string;
  flag: string;
  text: string;
  selected: boolean;
  active: boolean;
  onHover: () => void;
  onPick: () => void;
  dividerAfter: boolean;
}) {
  return (
    <>
      <li
        id={id}
        role="option"
        aria-selected={selected}
        className={`${styles.option} ${active ? styles.optionActive : ""} ${selected ? styles.optionSelected : ""}`}
        onMouseMove={onHover}
        onClick={onPick}
      >
        <span className={styles.optionFlag} aria-hidden="true">
          {flag}
        </span>
        <span className={styles.optionText}>{text}</span>
        <span className={styles.check} aria-hidden="true">
          {selected ? "✓" : ""}
        </span>
      </li>
      {dividerAfter ? <li role="separator" className={styles.divider} aria-hidden="true" /> : null}
    </>
  );
}
