"use client";

import { scrollToHash } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon, CopyIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { type ComponentProps, forwardRef } from "react";

const ICONS = {
  right: { Icon: ArrowRightIcon, dir: "right" },
  down: { Icon: ArrowDownIcon, dir: "down" },
  external: { Icon: ArrowUpRightIcon, dir: "diag" },
  mail: { Icon: MailIcon, dir: "right" },
  copy: { Icon: CopyIcon, dir: "down" },
} as const;

type Common = {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "ghost";
  size?: "md" | "sm";
  icon?: keyof typeof ICONS | "none";
  className?: string;
};

function Inner({ children, icon = "right" }: Pick<Common, "children" | "icon">) {
  const entry = icon === "none" ? null : ICONS[icon];
  return (
    <>
      <span className="btn-label">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
      {entry && (
        <span className="btn-icon" aria-hidden>
          <entry.Icon strokeWidth={2.2} />
          <entry.Icon strokeWidth={2.2} />
        </span>
      )}
    </>
  );
}

function classes({ variant = "primary", size = "md", className }: Common) {
  return cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className);
}

function dir(icon: Common["icon"]) {
  return icon && icon !== "none" ? ICONS[icon].dir : undefined;
}

/**
 * The site's one button: label rolls up on hover, the icon slides out and a copy
 * slides in, a sheen sweeps across, and it presses in on click.
 * Hash links scroll smoothly; routes use next/link; everything else is a plain <a>.
 */
export function ButtonLink({ href, ...props }: Common & { href: string; external?: boolean }) {
  const { external, icon = external ? "external" : "right", children } = props;
  const shared = { className: classes(props), "data-dir": dir(icon), "data-icon": icon };

  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        {...shared}
        onClick={(e) => {
          e.preventDefault();
          scrollToHash(href);
        }}
      >
        <Inner icon={icon}>{children}</Inner>
      </a>
    );
  }
  if (href.startsWith("/") && !external) {
    return (
      <Link href={href} {...shared}>
        <Inner icon={icon}>{children}</Inner>
      </Link>
    );
  }
  return (
    <a href={href} {...shared} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      <Inner icon={icon}>{children}</Inner>
    </a>
  );
}

export const Button = forwardRef<HTMLButtonElement, Common & Omit<ComponentProps<"button">, "children">>(function Button(
  { children, variant, size, icon = "right", className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      className={classes({ children, variant, size, className })}
      data-dir={dir(icon)}
      data-icon={icon}
    >
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
});
