"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Download,
  Menu,
  ChevronRight,
} from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function SiteHeader({ onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Generate breadcrumb from pathname
  const generateBreadcrumb = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
      { label: 'Dashboard', href: '/admin' }
    ];

    if (segments.length > 1) {
      let currentPath = '';
      segments.slice(1).forEach((segment, index) => {
        currentPath += `/${segment}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbItems.push({
          label: label === 'Events' ? 'Event Management' : label,
          href: `/admin${currentPath}`
        });
      });
    }

    return breadcrumbItems;
  };

  // Get current page title
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.includes('events')) {
      if (segments[segments.length - 1] === 'create') return 'Create New Event';
      if (segments[segments.length - 1] !== 'events') return 'Event Details';
      return 'Event Management';
    }
    return 'Dashboard Overview';
  };

  const breadcrumb = generateBreadcrumb();
  const pageTitle = getPageTitle();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo + Breadcrumb */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo - Giống như web public */}
            <div className="flex items-center">
              <Image
                src="/logo3.png"
                alt="Blockchain Pioneer Student Logo"
                width={120}
                height={0}
                style={{ height: "auto" }}
                className="h-8"
              />
            </div>

            {/* Breadcrumb - Nhỏ hơn */}
            <nav className="hidden md:flex items-center space-x-1 text-xs text-gray-500">
              {breadcrumb.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                  <span className={index === breadcrumb.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-700'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Right Section: Search + Utilities - Mở rộng để chiếm phần thiếu */}
          <div className="flex items-center space-x-4 flex-1 justify-end max-w-2xl">
            {/* Search Bar - Mở rộng hơn */}
            <div className="hidden sm:block relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events, registrations, members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full text-sm"
              />
            </div>

            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                </div>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="font-medium">New Registration</p>
                    <p className="text-sm text-gray-500">John Doe registered for Blockchain Workshop</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="font-medium">Event Reminder</p>
                    <p className="text-sm text-gray-500">AI Conference starts in 2 hours</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="font-medium">System Update</p>
                    <p className="text-sm text-gray-500">Dashboard updated to v2.1.0</p>
                    <p className="text-xs text-gray-400">3 hours ago</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Documentation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  API Reference
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Contact Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
