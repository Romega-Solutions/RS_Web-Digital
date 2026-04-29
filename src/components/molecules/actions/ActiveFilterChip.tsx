type ActiveFilterChipProps = {
  label: string;
  className?: string;
  ariaLabel: string;
  onRemove: () => void;
};

export function ActiveFilterChip({
  label,
  className = "",
  ariaLabel,
  onRemove,
}: ActiveFilterChipProps) {
  return (
    <button type="button" className={className} onClick={onRemove} aria-label={ariaLabel}>
      {label} <span aria-hidden="true">×</span>
    </button>
  );
}
