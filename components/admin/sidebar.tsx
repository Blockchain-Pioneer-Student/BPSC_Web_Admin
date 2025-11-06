"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { logout } from "@/lib/store/authSlice";
import {
  Calendar,
  User,
  Home,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Event Management",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Account Information",
    href: "#", // Not implemented yet
    icon: User,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      {/* Header with Avatar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center">
          <Avatar className="w-16 h-16 mb-3">
            <AvatarImage 
              src="https://thumbs.dreamstime.com/b/customer-support-service-agent-headset-flat-vector-icon-design-designs-153069456.jpg" 
              alt="Admin Avatar" 
            />
            <AvatarFallback className="bg-[#004987] text-white text-lg font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-900">
              {user?.username || 'Admin User'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {user?.role === 'root' ? 'Super Admin' : 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                {item.href === "#" ? (
                  <div className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-400 cursor-not-allowed">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.title}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-[#004987] text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-[#004987]"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.title}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          href="/"
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-[#004987] transition-colors duration-200"
        >
          <Home className="w-5 h-5 mr-3" />
          Back to Home
        </Link>
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
