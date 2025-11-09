"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Users,
  GraduationCap,
  Building,
  Calendar
} from "lucide-react";

interface RegistrationStatsProps {
  stats: {
    total: number;
    byUniversity: Record<string, number>;
    byDivision: Record<string, number>;
    byYearOfStudy: Record<number, number>;
    byBlockchainArea: Record<string, number>;
  };
  registrations: any[];
}

export function RegistrationStats({ stats, registrations }: RegistrationStatsProps) {
  const todayRegistrations = registrations.filter(reg => 
    new Date(reg.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Universities</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats.byUniversity).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Divisions</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats.byDivision).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayRegistrations}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}