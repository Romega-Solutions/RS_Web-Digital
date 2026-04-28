import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";

type AppButtonBaseProps = {
  className: string;
  children?: ReactNode;
  label?: string;
};

type AppButtonLinkProps = AppButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children"> & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
  };

type AppButtonElementProps = AppButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
    href?: undefined;
  };

type AppButtonProps = AppButtonLinkProps | AppButtonElementProps;

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(props, ref) {
  if ("href" in props && props.href !== undefined) {
    const { className, children, label, href, ...linkProps } = props;
    return (
      <Link href={href} className={className} {...linkProps}>
        {children ?? label}
      </Link>
    );
  }

  const { className, children, label, type = "button", ...buttonProps } = props;
  return (
    <button ref={ref} type={type} className={className} {...buttonProps}>
      {children ?? label}
    </button>
  );
});

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
    <AppButton
      href={href}
      label={label}
      className={`${className} inline-flex items-center justify-center text-center font-semibold`}
    />
  );
}
