"use client";

import { useState } from "react";
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
  BarChart3,
  Users,
  UserPlus,
  Shield,
  Newspaper,
  FileText,
  Image,
  Handshake,
  Building2,
  MessageSquare,
  Bell,
  Settings,
  Database,
  ChevronDown,
  ChevronRight,
  Menu,
  Folders,
  Hash,
  MapPin,
} from "lucide-react";

const menuItems = [
  {
    title: "📊 DASHBOARD",
    items: [
      {
        title: "Overview",
        href: "/admin",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "�️ ORGANIZATION",
    items: [
      {
        title: "Members",
        href: "/admin/members",
        icon: User,
      },
      {
        title: "Boards",
        href: "/admin/boards",
        icon: Folders,
      },
      {
        title: "Blockchain Areas",
        href: "/admin/blockchain-areas",
        icon: Hash,
      },
    ],
  },
  {
    title: "🎪 EVENTS",
    items: [
      {
        title: "All Events",
        href: "/admin/events",
        icon: Calendar,
      },
      {
        title: "Registrations",
        href: "/admin/registrations",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "🤝 PARTNERS",
    items: [
      {
        title: "All Partners",
        href: "/admin/partners",
        icon: Handshake,
      },
    ],
  },
  {
    title: "� CONTACT",
    items: [
      {
        title: "Contact Messages",
        href: "/admin/contacts",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "📝 BLOGS",
    items: [
      {
        title: "All Blogs",
        href: "/admin/blogs",
        icon: Newspaper,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "📊 DASHBOARD", 
    "👥 USER MANAGEMENT",
    "�️ ORGANIZATION",
    "🎪 EVENTS",
    "🤝 PARTNERS",
    "� CONTACT",
    "� FILE MANAGEMENT",
    "⚙️ SETTINGS"
  ]); // All groups expanded by default for collapsed state
  const [isHovered, setIsHovered] = useState(false);

  const toggleGroup = (groupTitle: string) => {
    if (!isHovered) return; // Only allow toggle when expanded (hovered)
    setExpandedGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(title => title !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const isExpanded = isHovered;

  return (
    <div 
      className={cn(
        "bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Avatar - always show small version */}
      <div className="p-4 border-b border-gray-200 flex justify-center">
        <Avatar className={cn("transition-all duration-300", isExpanded ? "w-12 h-12" : "w-8 h-8")}>
          <AvatarImage 
            src="https://thumbs.dreamstime.com/b/customer-support-service-agent-headset-flat-vector-icon-design-designs-153069456.jpg" 
            alt="Admin Avatar" 
          />
          <AvatarFallback className="bg-[#004987] text-white text-xs font-semibold">
            AD
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Expanded User Info */}
      {isExpanded && (
        <div className="px-4 pb-4 border-b border-gray-200">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-900">
              {user?.username || 'Admin User'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {user?.role === 'root' ? 'Super Admin' : 'Administrator'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {menuItems.map((group) => {
            const isGroupExpanded = expandedGroups.includes(group.title) && isExpanded;
            
            return (
              <div key={group.title}>
                {/* Group Header */}
                {isExpanded && (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-[#004987] transition-colors duration-200"
                  >
                    <span>{group.title}</span>
                    {isGroupExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Group Items */}
                <ul className={cn("space-y-1", isExpanded ? "ml-2" : "ml-0")}>
                  {(!isExpanded || (isGroupExpanded && isExpanded)) && group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center rounded-lg transition-all duration-200",
                            isExpanded ? "px-3 py-2 text-sm font-medium" : "px-2 py-2 justify-center mx-auto w-10 h-10",
                            isActive
                              ? "bg-[#004987] text-white shadow-lg"
                              : "text-gray-700 hover:bg-gray-100 hover:text-[#004987]"
                          )}
                          title={!isExpanded ? item.title : undefined}
                        >
                          <Icon className={cn("w-4 h-4", isExpanded ? "mr-3" : "")} />
                          {isExpanded && <span>{item.title}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 space-y-1">
        <Link
          href="/"
          className={cn(
            "flex items-center rounded-lg hover:bg-gray-100 hover:text-[#004987] transition-colors duration-200",
            isExpanded ? "px-3 py-2 text-sm font-medium text-gray-700" : "px-2 py-2 justify-center mx-auto w-10 h-10 text-gray-700"
          )}
          title={!isExpanded ? "Back to Home" : undefined}
        >
          <Home className={cn("w-4 h-4", isExpanded ? "mr-3" : "")} />
          {isExpanded && <span>Back to Home</span>}
        </Link>
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200",
            isExpanded ? "justify-start px-3 py-2 text-sm font-medium" : "justify-center px-2 py-2 w-10 h-10 mx-auto"
          )}
          title={!isExpanded ? "Logout" : undefined}
        >
          <LogOut className={cn("w-4 h-4", isExpanded ? "mr-3" : "")} />
          {isExpanded && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
