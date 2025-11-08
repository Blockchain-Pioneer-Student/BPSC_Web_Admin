"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Hash,
  Calendar,
  Filter
} from "lucide-react";
import { memberService, Member } from "@/lib/services/memberService";
import { toast } from "sonner";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

export default function AdminMembersPage() {
  // Data state
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("display_order_ASC");

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(members.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMembers = members.slice(startIndex, endIndex);

  // Fetch members function
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        search: searchQuery || undefined,
      };
      
      const data = await memberService.getAllMembers(params);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Không thể tải danh sách thành viên. Vui lòng kiểm tra kết nối mạng và thử lại.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete member function
  const handleDelete = async (memberId: number, memberName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete member "${memberName}"? This action cannot be undone.`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await memberService.deleteMember(memberId);
      toast.success("Member deleted successfully");
      await fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Unable to delete member. Please try again.");
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMembers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchMembers();
  }, [selectedStatus, searchQuery, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-1">Manage all club members</p>
        </div>
        <Link href="/admin/members/create">
          <Button className="bg-[#004987] hover:bg-[#003b6d]">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search members by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="display_order_ASC">Display Order</SelectItem>
                  <SelectItem value="full_name_ASC">Name A-Z</SelectItem>
                  <SelectItem value="full_name_DESC">Name Z-A</SelectItem>
                  <SelectItem value="id_DESC">Newest First</SelectItem>
                  <SelectItem value="id_ASC">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-xl font-bold text-gray-900">{members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl font-bold text-green-600">
                  {members.filter(m => m.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-xl font-bold text-red-600">
                  {members.filter(m => !m.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedStatus !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first member."
                }
              </p>
              <div className="mt-6">
                <Link href="/admin/members/create">
                  <Button className="bg-[#004987] hover:bg-[#003b6d]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Members list
            <div className="space-y-4">
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    {/* Member Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={member.avatar_url} alt={member.full_name} />
                          <AvatarFallback className="bg-[#004987] text-white text-lg font-semibold">
                            {member.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {member.full_name}
                            </h3>
                            <Badge className={member.is_active 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-red-100 text-red-800 border-red-200"
                            }>
                              {member.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {member.role && (
                              <Badge variant="outline" className="text-xs">
                                {member.role.name}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4" />
                              <span>ID: #{member.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Display Order: #{member.display_order}</span>
                            </div>
                          </div>

                          {member.bio && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {member.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        asChild
                      >
                        <Link href={`/admin/members/${member.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700"
                        asChild
                      >
                        <Link href={`/admin/members/${member.id}/edit`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(member.id, member.full_name)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && members.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(endIndex, members.length)}</span> of{" "}
                    <span className="font-medium">{members.length}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      const isCurrentPage = page === currentPage;
                      
                      // Show first, last, current, and pages around current
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={isCurrentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={isCurrentPage ? "bg-[#004987] hover:bg-[#003b6d]" : ""}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 || 
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}