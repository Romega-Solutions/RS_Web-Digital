import Link from "next/link";

type ExploreServicesButtonProps = {
  className: string;
  href?: string;
};

export function ExploreServicesButton({
  className,
  href = "/services",
}: ExploreServicesButtonProps) {
  return (
    <Link
      href={href}
      className={`${className} inline-flex items-center justify-center text-center font-semibold`}
    >
      Explore Our Services
    </Link>
  );
}
