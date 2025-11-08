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
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "👥 MEMBERS",
    items: [
      {
        title: "All Members",
        href: "/admin/members",
        icon: Users,
      },
      {
        title: "Registrations",
        href: "/admin/registrations",
        icon: UserPlus,
      },
      {
        title: "Roles & Permissions",
        href: "/admin/roles",
        icon: Shield,
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
        title: "Create Event",
        href: "/admin/events/create",
        icon: Calendar,
      },
      {
        title: "Categories",
        href: "/admin/events/categories",
        icon: Calendar,
      },
    ],
  },
  {
    title: "📰 CONTENT",
    items: [
      {
        title: "News Articles",
        href: "/admin/news",
        icon: Newspaper,
      },
      {
        title: "Media Gallery",
        href: "/admin/media",
        icon: Image,
      },
      {
        title: "Pages",
        href: "/admin/pages",
        icon: FileText,
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
      {
        title: "Collaborations",
        href: "/admin/collaborations",
        icon: Building2,
      },
    ],
  },
  {
    title: "👨‍💼 TEAM",
    items: [
      {
        title: "Team Members",
        href: "/admin/team",
        icon: Users,
      },
      {
        title: "Achievements",
        href: "/admin/achievements",
        icon: Shield,
      },
    ],
  },
  {
    title: "📞 COMMUNICATIONS",
    items: [
      {
        title: "Contact Messages",
        href: "/admin/contacts",
        icon: MessageSquare,
      },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "⚙️ SETTINGS",
    items: [
      {
        title: "Site Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "System",
        href: "/admin/system",
        icon: Database,
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
    "🎪 EVENTS"
  ]); // Default expanded groups

  const toggleGroup = (groupTitle: string) => {
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
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {menuItems.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            
            return (
              <div key={group.title}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-[#004987] transition-colors duration-200"
                >
                  <span>{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <ul className="space-y-1 ml-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                              isActive
                                ? "bg-[#004987] text-white shadow-lg"
                                : "text-gray-700 hover:bg-gray-100 hover:text-[#004987]"
                            )}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
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
