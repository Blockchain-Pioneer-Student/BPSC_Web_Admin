import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AdminRouteGuard>
  );
}