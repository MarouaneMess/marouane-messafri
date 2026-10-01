import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
export default async function Dashboard() {
  await requirePageAdmin();
  const [projects, published, drafts, writeups, research, posts, logs] =
    await Promise.all([
      db.project.count({ where: { deletedAt: null } }),
      db.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      db.post.count({ where: { status: "DRAFT", deletedAt: null } }),
      db.post.count({ where: { type: "WRITEUP", deletedAt: null } }),
      db.securityResearch.count({ where: { deletedAt: null } }),
      db.post.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
  return (
    <>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">LE TABLEAU DE BORD</div>
          <h1>
            Bonjour, Marouane<span>.</span>
          </h1>
          <p>Les idées prennent forme ici.</p>
        </div>
        <Link href="/admin/posts/new" className="button">
          <Plus size={16} /> Nouvel article
        </Link>
      </div>
      <div className="admin-stats">
        {[
          ["Projets", projects],
          ["Articles publiés", published],
          ["Brouillons", drafts],
          ["Write-ups", writeups],
          ["Recherches", research],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="admin-quick">
        {[
          ["Un article à écrire", "/admin/posts/new"],
          ["Un write-up à partager", "/admin/posts/new?type=WRITEUP"],
          ["Un projet à présenter", "/admin/projects/new"],
          ["Une recherche à documenter", "/admin/security/new"],
        ].map(([label, href]) => (
          <Link href={href} key={href}>
            <Plus size={17} />
            {label}
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
      <section className="admin-panel">
        <div className="admin-panel-title">
          <h2>Derniers articles</h2>
          <Link href="/admin/posts">Tout voir ↗</Link>
        </div>
        {posts.length ? (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>État</th>
                  <th>Mis à jour</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
                      <small>{post.type}</small>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${post.status.toLowerCase()}`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td>{formatDate(post.updatedAt)}</td>
                    <td>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        aria-label={`Modifier ${post.title}`}
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="notice">Votre premier article commence par une idée.</p>
        )}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-title">
          <h2>Journal d’activité</h2>
          <a href="/api/admin/export" download>
            Exporter le contenu ↓
          </a>
        </div>
        {logs.length ? (
          <ul className="audit-list">
            {logs.map((log) => (
              <li key={log.id}>
                <span className="mono">{log.action}</span>
                <span>{log.entityType}</span>
                <time>{formatDate(log.createdAt)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            Les prochaines modifications apparaîtront ici.
          </p>
        )}
      </section>
    </>
  );
}
