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
      { label: 'Tổng quan', href: '/admin' }
    ];

    if (segments.length > 1) {
      let currentPath = '';
      segments.slice(1).forEach((segment, index) => {
        currentPath += `/${segment}`;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbItems.push({
          label:
            label === 'Events'
              ? 'Sự kiện'
              : label === 'Members'
                ? 'Thành viên'
                : label === 'Partners'
                  ? 'Đối tác'
                  : label === 'Blogs'
                    ? 'Bài viết'
                    : label === 'Site-content'
                      ? 'Nội dung website'
                      : label,
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
      if (segments[segments.length - 1] === 'create') return 'Tạo sự kiện mới';
      if (segments[segments.length - 1] !== 'events') return 'Chi tiết sự kiện';
      return 'Quản lý sự kiện';
    }
    return 'Tổng quan';
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
                placeholder="Tìm sự kiện, đơn đăng ký, thành viên..."
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
                  <h4 className="font-semibold">Thông báo</h4>
                </div>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="font-medium">Đơn đăng ký mới</p>
                    <p className="text-sm text-gray-500">Nguyễn Minh Anh vừa gửi đơn tham gia câu lạc bộ</p>
                    <p className="text-xs text-gray-400">2 phút trước</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="font-medium">Nhắc lịch sự kiện</p>
                    <p className="text-sm text-gray-500">Workshop blockchain bắt đầu sau 2 giờ</p>
                    <p className="text-xs text-gray-400">1 giờ trước</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3">
                  <div>
                    <p className="font-medium">Cập nhật hệ thống</p>
                    <p className="text-sm text-gray-500">Bảng quản trị đã được cập nhật</p>
                    <p className="text-xs text-gray-400">3 giờ trước</p>
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
                  {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Tùy chọn
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất cấu hình
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
                  Tài liệu
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Tham chiếu API
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Liên hệ hỗ trợ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
