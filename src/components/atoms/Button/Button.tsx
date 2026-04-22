import Link from "next/link";

type ExploreServicesButtonProps = {
  className: string;
  href?: string;
  label?: string;
};

export function ExploreServicesButton({
  className,
  href = "/services",
  label = "Explore Our Services",
}: ExploreServicesButtonProps) {
  return (
    <Link
      href={href}
      className={`${className} inline-flex items-center justify-center text-center font-semibold`}
    >
      {label}
    </Link>
  );
}
