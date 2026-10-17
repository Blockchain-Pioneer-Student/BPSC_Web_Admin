"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import { registrationService, Registration } from "@/lib/services/registrationService";
import { toast } from "sonner";
import { RegistrationFilters } from "@/components/admin/RegistrationFilters";
import { RegistrationStats } from "@/components/admin/RegistrationStats";
import { RegistrationTable } from "@/components/admin/RegistrationTable";
import { RegistrationStatsLoader } from "@/components/admin/RegistrationStatsLoader";
import { QuickActions } from "@/components/admin/QuickActions";
import { AdminPagination } from "@/components/admin/AdminPagination";

const ITEMS_PER_PAGE = 10;

export default function RegistrationsPage() {
  const router = useRouter();
  
  // State management
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByUniversity, setFilterByUniversity] = useState("all");
  const [filterByDivision, setFilterByDivision] = useState("all");
  const [filterByYear, setFilterByYear] = useState("all");
  const [filterByCampaign, setFilterByCampaign] = useState("all");
  const [filterByStatus, setFilterByStatus] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    byUniversity: {} as Record<string, number>,
    byDivision: {} as Record<string, number>,
    byYearOfStudy: {} as Record<number, number>,
    byBlockchainArea: {} as Record<string, number>,
  });

  // Fetch registrations
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const registrationsResponse = await registrationService.getAllRegistrations();
      const statsData = registrationService.calculateRegistrationsStats(
        registrationsResponse.data,
      );

      setRegistrations(registrationsResponse.data);
      setFilteredRegistrations(registrationsResponse.data);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Unable to load registrations");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search effect
  useEffect(() => {
    let filtered = registrations;

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(registration => 
        registration.full_name.toLowerCase().includes(term) ||
        registration.student_id.toLowerCase().includes(term) ||
        registration.email.toLowerCase().includes(term) ||
        registration.university.toLowerCase().includes(term) ||
        registration.major.toLowerCase().includes(term) ||
        registration.division.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filterByUniversity && filterByUniversity !== "all") {
      filtered = filtered.filter(reg => reg.university === filterByUniversity);
    }

    if (filterByDivision && filterByDivision !== "all") {
      filtered = filtered.filter(reg => reg.division === filterByDivision);
    }

    if (filterByYear && filterByYear !== "all") {
      filtered = filtered.filter(reg => reg.year_of_study.toString() === filterByYear);
    }

    if (filterByCampaign === "legacy") {
      filtered = filtered.filter(reg => !reg.campaign_id);
    } else if (filterByCampaign !== "all") {
      filtered = filtered.filter(
        reg => reg.campaign_id?.toString() === filterByCampaign,
      );
    }

    if (filterByStatus !== "all") {
      filtered = filtered.filter(reg => reg.status === filterByStatus);
    }

    setFilteredRegistrations(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    registrations,
    searchTerm,
    filterByUniversity,
    filterByDivision,
    filterByYear,
    filterByCampaign,
    filterByStatus,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  // Get unique values for filters
  const universities = Array.from(new Set(registrations.map(reg => reg.university))).sort();
  const divisions = Array.from(new Set(registrations.map(reg => reg.division))).sort();
  const years = Array.from(new Set(registrations.map(reg => reg.year_of_study))).sort();
  const campaigns = Array.from(
    new Map(
      registrations
        .filter((reg) => reg.campaign)
        .map((reg) => [reg.campaign!.id, reg.campaign!]),
    ).values(),
  ).sort((a, b) => a.title.localeCompare(b.title));

  // Handle view details
  const handleViewDetails = (registration: Registration) => {
    router.push(`/admin/registrations/${registration.id}`);
  };

  // Handle delete
  const handleDelete = async (registration: Registration) => {
    try {
      await registrationService.deleteRegistration(registration.id);
      toast.success(`Registration from ${registration.full_name} deleted successfully`);
      
      // Refresh data
      fetchRegistrations();
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast.error("Failed to delete registration");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterByUniversity("all");
    setFilterByDivision("all");
    setFilterByYear("all");
    setFilterByCampaign("all");
    setFilterByStatus("all");
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle export (placeholder)
  const handleExport = () => {
    toast.success("Export feature will be implemented soon");
  };

  // Handle generate report
  const handleGenerateReport = () => {
    toast.success("Report generation will be implemented soon");
  };

  // Handle bulk actions
  const handleBulkAction = () => {
    toast.success("Bulk actions will be implemented soon");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            
            {/* Stats skeletons */}
            <RegistrationStatsLoader />

            {/* Table skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Member Registrations
            </h1>
            <p className="text-gray-600">
              Manage and view all member registration applications
            </p>
          </div>

          {/* Statistics Cards */}
          <RegistrationStats stats={stats} registrations={registrations} />

          {/* Quick Actions */}
          <QuickActions 
            onExport={handleExport}
            onGenerateReport={handleGenerateReport}
            onBulkAction={handleBulkAction}
          />

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterByUniversity={filterByUniversity}
                setFilterByUniversity={setFilterByUniversity}
                filterByDivision={filterByDivision}
                setFilterByDivision={setFilterByDivision}
                filterByYear={filterByYear}
                setFilterByYear={setFilterByYear}
                filterByCampaign={filterByCampaign}
                setFilterByCampaign={setFilterByCampaign}
                filterByStatus={filterByStatus}
                setFilterByStatus={setFilterByStatus}
                campaigns={campaigns}
                universities={universities}
                divisions={divisions}
                years={years}
                onClearFilters={clearFilters}
                onExport={handleExport}
              />
            </CardContent>
          </Card>

          {/* Registrations Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Registrations ({filteredRegistrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationTable
                registrations={currentRegistrations}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
                searchTerm={searchTerm}
                filterByUniversity={filterByUniversity}
                filterByDivision={filterByDivision}
                filterByYear={filterByYear}
                filterByCampaign={filterByCampaign}
                filterByStatus={filterByStatus}
              />
              
              {/* Pagination */}
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredRegistrations.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}