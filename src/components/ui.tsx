import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
export function ButtonLink({
  href,
  children,
  secondary = false,
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  external?: boolean;
  className?: string;
}) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {external ? <ArrowUpRight size={16} /> : <ArrowRight size={16} />}
    </Link>
  );
}
export function SectionHeading({
  number,
  label,
  title,
  description,
  href,
  linkText,
}: {
  number?: string;
  label: string;
  title: string;
  description?: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">
          {number && <span>{number} /</span>} {label}
        </div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {linkText || "Tout découvrir"} <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function PageHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div className="eyebrow">
        <span>↳</span> {label}
      </div>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="mono">[ Aucun résultat ]</span>
      <p>{children}</p>
    </div>
  );
}
export function Tags({ values }: { values: string[] }) {
  return (
    <div className="tags">
      {values.map((value) => (
        <span key={value}>{value}</span>
      ))}
    </div>
  );
}
