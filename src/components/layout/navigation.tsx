"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { dictionaries } from "@/config/i18n";
import { site } from "@/config/site";
import { CommandMenu } from "./command-menu";
const links = Object.entries(dictionaries.fr)
  .filter(([key]) => key !== "contact")
  .map(([key, label]) => ({ href: key === "home" ? "/" : `/${key}`, label }));
export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label={`${site.name}, accueil`}>
          <span className="brand-mark">
            m<span>.</span>
          </span>
          <span>
            marouane<span className="brand-dot">.</span>
            <small>DEVELOPER & RESEARCHER</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "active" : ""}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <CommandMenu />
          <Link href="/contact" className="nav-contact">
            Discutons <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Navigation mobile"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {[...links, { href: "/contact", label: "Contact" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
