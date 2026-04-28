import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type AppButtonBaseProps = {
  className?: string;
  children?: ReactNode;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    label,
    ...rest
  } = props;

  const baseClass = "btn";
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const combinedClassName = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();

  const content = children ?? label;

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkProps } = rest as AppButtonLinkProps;
    return (
      <Link href={href} className={combinedClassName} {...linkProps}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as AppButtonElementProps;
  return (
    <button ref={ref} type={type} className={combinedClassName} {...buttonProps}>
      {content}
    </button>
  );
});

type ExploreServicesButtonProps = {
  className?: string;
  href?: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ExploreServicesButton({
  className = "home-hero__action",
  href = "/services",
  label = "Explore Our Services",
  variant = "primary",
  size = "md",
}: ExploreServicesButtonProps) {
  return (
    <AppButton
      href={href}
      label={label}
      variant={variant}
      size={size}
      className={className}
    />
  );
}
