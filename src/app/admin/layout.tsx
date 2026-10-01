import { requirePageAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageAdmin();
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main" id="main">
        <div className="admin-topbar">
          <span className="mono">
            <i className="status-dot" /> SESSION PRIVÉE
          </span>
          <span>Marouane / Content Studio</span>
        </div>
        {children}
      </main>
    </div>
  );
}
