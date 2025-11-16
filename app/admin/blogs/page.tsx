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
} from "lucide-react";
import { useBlog } from "@/hooks/useBlog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPagination } from "@/components/admin/AdminPagination";
import Image from "next/image";

export default function AdminBlogsPage() {
  const {
    blogs,
    categories,
    loading,
    categoriesLoading,
    currentPage,
    itemsPerPage,
    totalPages,
    currentBlogs,
    selectedCategory,
    searchQuery,
    sortBy,
    setCurrentPage,
    setItemsPerPage,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    handleDelete,
  } = useBlog();

  const router = useRouter();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Manage and track all club blogs</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter and Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
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
                  <SelectItem value="created_at_DESC">Newest</SelectItem>
                  <SelectItem value="created_at_ASC">Oldest</SelectItem>
                  <SelectItem value="views_DESC">Most Viewed</SelectItem>
                  <SelectItem value="likes_DESC">Most Liked</SelectItem>
                </SelectContent>
              </Select>

              {/* Create Button */}
              <Button
                className="bg-[#004987] hover:bg-[#003366]"
                onClick={() => {
                  router.push("blogs/create");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Blog
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blogs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Blog List ({blogs.length})</span>
              {blogs.length > 0 && (
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
            ) : currentBlogs.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || (selectedCategory && selectedCategory !== "all")
                    ? "No blogs match your filters."
                    : "No blogs have been created yet. Create the first blog!"}
                </p>
                <Button className="bg-[#004987] hover:bg-[#003366]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create the first blog
                </Button>
              </div>
            ) : (
              // Blogs list
              <div className="space-y-4">
                {currentBlogs.map((blog) => (
                  <div
                    key={blog.blog_uuid}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      {/* Blog Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Blog Thumbnail */}
                          {blog.thumbnail_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={blog.thumbnail_url}
                                alt={blog.title}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}

                          {/* Blog Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 truncate">
                              {blog.short_description}
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1 text-blue-600">
                                <Eye className="w-4 h-4" />
                                <span>{blog.views}</span>
                              </div>
                              <div className="text-gray-500">
                                Created: {new Date(blog.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-gray-500">
                                Updated: {new Date(blog.updated_at).toLocaleDateString()}
                              </div>
                              {blog.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {blog.category.name}
                                </Badge>
                              )}
                              {blog.tags && blog.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {blog.tags.map((tag) => (
                                    <Badge key={tag.id} variant="outline" className="text-xs">
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Publish Status */}
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Published:</span>
                          <span>{blog.is_published ? "Yes" : "No"}</span>
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
                          <Link href={`/blogs/${blog.blog_uuid}`} target="_blank">
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
                          <Link href={`/admin/blogs/${blog.blog_uuid}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(blog.blog_uuid)}
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
            {!loading && blogs.length > 0 && (
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={blogs.length}
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