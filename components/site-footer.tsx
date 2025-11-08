"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Shield,
  FileText,
  Mail,
  Activity,
  Users,
  Clock,
} from "lucide-react";

export function SiteFooter() {
  const [systemStats, setSystemStats] = useState({
    activeUsers: 12,
    serverStatus: 'online',
    lastUpdate: new Date().toLocaleString(),
    uptime: '99.9%'
  });

  // Simulate real-time stats update
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 20) + 5,
        lastUpdate: new Date().toLocaleString()
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-[#004987] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">BPS</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">BPS Club</h3>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Blockchain Pioneer Student Club Management System
            </p>
            <p className="text-xs text-gray-400">
              © 2025 BPS Club. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/docs" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/api" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>API Reference</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/status" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <Activity className="h-3 w-3" />
                  <span>System Status</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/support" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <Mail className="h-3 w-3" />
                  <span>Support Center</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* System Information */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">System Info</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Version:</span>
                <Badge variant="secondary" className="text-xs">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Status:</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    systemStats.serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-600 capitalize">{systemStats.serverStatus}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Uptime:</span>
                <span className="text-xs text-gray-600">{systemStats.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Active:</span>
                </span>
                <Badge variant="outline" className="text-xs">
                  {systemStats.activeUsers} users
                </Badge>
              </div>
            </div>
          </div>

          {/* Legal & Contact */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal & Contact</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <Shield className="h-3 w-3" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <Mail className="h-3 w-3" />
                  <span>Contact Admin</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/report" 
                  className="text-xs text-gray-600 hover:text-[#004987] flex items-center space-x-1"
                >
                  <Shield className="h-3 w-3" />
                  <span>Report Issues</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Last updated: {systemStats.lastUpdate}</span>
          </div>
          <div className="mt-2 sm:mt-0">
            <p className="text-xs text-gray-400">
              Built with ❤️ by BPS Club Development Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
