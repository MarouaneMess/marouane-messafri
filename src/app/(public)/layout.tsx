import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
export const dynamic = "force-dynamic";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
