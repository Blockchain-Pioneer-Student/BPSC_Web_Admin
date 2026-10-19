import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PublicPreview } from "@/components/admin/PublicPreview";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <SiteHeader />
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          {children}
        </main>
        <PublicPreview />
      </div>
      <SiteFooter />
    </AdminRouteGuard>
  );
}
