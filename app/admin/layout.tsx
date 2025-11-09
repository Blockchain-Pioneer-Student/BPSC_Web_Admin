import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
        <main className="flex-1">
          {children}
        </main>
      </div>
      <SiteFooter />
    </AdminRouteGuard>
  );
}