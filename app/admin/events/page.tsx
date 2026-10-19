"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Heart, 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Router
} from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AdminPagination } from "@/components/admin/AdminPagination";

export default function AdminEventsPage() {
  // Use custom hook for event logic
  const {
    // Data
    events,
    categories,
    
    // Loading states
    loading,
    categoriesLoading,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentEvents,
    
    // Filters
    selectedCategory,
    searchQuery,
    sortBy,
    
    // Actions
    setCurrentPage,
    setItemsPerPage,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    handleDelete,
  } = useEvent();

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  // Format updated_at
  const formatUpdatedAt = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };
  const router = useRouter();
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý sự kiện
          </h1>
          <p className="text-gray-600">
            Theo dõi và cập nhật toàn bộ sự kiện của câu lạc bộ
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Lọc và tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm theo tên sự kiện..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại sự kiện" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả loại sự kiện</SelectItem>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Đang tải...
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at_DESC">Mới nhất</SelectItem>
                  <SelectItem value="created_at_ASC">Cũ nhất</SelectItem>
                  <SelectItem value="date_DESC">Ngày diễn ra (mới → cũ)</SelectItem>
                  <SelectItem value="date_ASC">Ngày diễn ra (cũ → mới)</SelectItem>
                  <SelectItem value="views_DESC">Xem nhiều nhất</SelectItem>
                  <SelectItem value="likes_DESC">Thích nhiều nhất</SelectItem>
                </SelectContent>
              </Select>

              {/* Create Button */}
              <Button className="bg-[#004987] hover:bg-[#003366]"
              onClick={()=> {router.push("events/create")}}
              >

                <Plus className="w-4 h-4 mr-2" />
                Tạo sự kiện
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách sự kiện ({events.length})</span>
              {events.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  Page {currentPage} / {totalPages}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              // Loading state
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentEvents.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sự kiện
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || (selectedCategory && selectedCategory !== "all")
                    ? "Không có sự kiện phù hợp với bộ lọc."
                    : "Chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên."}
                </p>
                <Button className="bg-[#004987] hover:bg-[#003366]">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo sự kiện đầu tiên
                </Button>
              </div>
            ) : (
              // Events list
              <div className="space-y-4">
                {currentEvents.map((event) => (
                  <div
                    key={event.event_uuid}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Event Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {event.image ? (
                              <Image
                                src={event.image}
                                alt={event.title}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          
                          {/* Event Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                              {event.title}
                            </h3>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate max-w-32">{event.location}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1 text-blue-600">
                                <Eye className="w-4 h-4" />
                                <span>{event.views} lượt xem</span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-red-600">
                                <Heart className="w-4 h-4" />
                                <span>{event.likes} lượt thích</span>
                              </div>
                              
                              <div className="text-gray-500">
                                Cập nhật: {formatUpdatedAt(event.updated_at)}
                              </div>
                              
                              {event.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {event.category.name}
                                </Badge>
                              )}
                            </div>

                            {/* Visibility Status */}
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Hiển thị:</span>
                              <span>{event.is_visible ? "Có" : "Không"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          asChild
                        >
                          <Link href={`/events/${event.event_uuid}`} target="_blank">
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 hover:text-yellow-700"
                          asChild
                        >
                          <Link href={`/admin/events/${event.event_uuid}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(event.event_uuid)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && events.length > 0 && (
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={events.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
