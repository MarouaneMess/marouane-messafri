"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderGit2,
  Fingerprint,
  Image,
  Settings2,
  ExternalLink,
  Trash2,
  Tags,
} from "lucide-react";
import { LogoutButton } from "./auth-buttons";
const links = [
  { href: "/admin", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Articles & write-ups", icon: FileText },
  { href: "/admin/projects", label: "Projets", icon: FolderGit2 },
  { href: "/admin/security", label: "Security Research", icon: Fingerprint },
  { href: "/admin/media", label: "Médiathèque", icon: Image },
  { href: "/admin/taxonomy", label: "Catégories & tags", icon: Tags },
  { href: "/admin/trash", label: "Corbeille", icon: Trash2 },
  { href: "/admin/settings", label: "Paramètres", icon: Settings2 },
];
export function AdminSidebar() {
  const path = usePathname();
  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand">
        marouane<span>.</span>
        <small>CONTENT STUDIO</small>
      </Link>
      <div className="admin-sidebar-label mono">ESPACE DE TRAVAIL</div>
      <nav aria-label="Administration">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            className={
              path === href ||
              (href !== "/admin" && path.startsWith(`${href}/`))
                ? "active"
                : ""
            }
            href={href}
          >
            <Icon size={17} strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="admin-sidebar-bottom">
        <Link href="/" target="_blank">
          <ExternalLink size={16} /> Voir le portfolio
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
