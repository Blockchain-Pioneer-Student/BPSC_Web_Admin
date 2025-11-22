"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { Upload, ArrowLeft, Save, Eye, EyeOff, Image as ImageIcon, X } from "lucide-react";
import { useBlog } from "@/hooks/useBlog";
import { Blog } from "@/lib/services/blogService";

const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  ),
});

export default function AdminBlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const blogUuid = params.uuid as string;

  const { categories, categoriesLoading, getBlogByUuid, updateBlog } = useBlog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    short_description: "",
    slug: "",
    thumbnail_url: "",
    is_published: true,
    category_id: undefined as number | undefined,
    tags: [] as { name: string; slug: string }[], // Add tags field
  });

  const [originalData, setOriginalData] = useState(formData);
  const [tagInput, setTagInput] = useState(""); // Add state for tag input

  // Fetch blog
  useEffect(() => {
    if (!blogUuid) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const blogData = await getBlogByUuid(blogUuid);
        if (blogData) {
          setBlog(blogData);
          const initial = {
            title: blogData.title || "",
            content: blogData.content || "",
            short_description: blogData.short_description || "",
            slug: blogData.slug || "",
            thumbnail_url: blogData.thumbnail_url || "",
            is_published: blogData.is_published ?? true,
            category_id: blogData.category_id || undefined,
            tags: blogData.tags || [] // Map tags from API
          };
          setFormData(initial);
          setOriginalData(initial);
        }
      } catch (error) {
        toast.error("Unable to load blog information");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogUuid, getBlogByUuid]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (formData.thumbnail_url?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.thumbnail_url);
      }
    };
  }, [formData.thumbnail_url]);

  const handleInputChange = (field: string, value: any) => {
    if (field === "slug") {
      value = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must not exceed 5MB");
      return;
    }

    handleImageUpload(file);
  };

  const handleImageUpload = (file: File) => {
    setUploading(true);
    const url = URL.createObjectURL(file);
    handleInputChange("thumbnail_url", url);
    setSelectedImageFile(file);
    setImageChanged(true);
    toast.success("Thumbnail image selected successfully");
    setUploading(false);
  };

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("html") && !file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm")) {
      toast.error("Please select an HTML file (.html or .htm)");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("HTML file size must not exceed 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let htmlContent = event.target?.result as string;

        const sanitizedContent = htmlContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/on\w+="[^"]*"/gi, "")
          .replace(/javascript:/gi, "");

        handleInputChange("content", sanitizedContent);
        setUploadedHtmlFile(file.name);
        toast.success(`HTML content imported from "${file.name}"`);
        e.target.value = "";
      } catch (error) {
        toast.error("Failed to read HTML file");
      }
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const newTag = {
      name: tagInput.trim(),
      slug: tagInput.trim().toLowerCase().replace(/\s+/g, "-")
    };

    if (formData.tags.some(tag => tag.name.toLowerCase() === newTag.name.toLowerCase())) {
      toast.error("Tag already exists");
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Blog title is required");
      return;
    }

    try {
      setSaving(true);
      const changes = new FormData();

      Object.keys(formData).forEach((key) => {
        const typedKey = key as keyof typeof formData;

        if (typedKey === "tags") {
          changes.append("tags", JSON.stringify(formData.tags));
        } else if (formData[typedKey] !== originalData[typedKey]) {
          changes.append(key, formData[typedKey] as string);
        }
      });

      if (imageChanged && selectedImageFile) {
        changes.append("thumbnail_file", selectedImageFile);
      }

      await updateBlog(blogUuid, changes);
      toast.success("Blog updated successfully");
      router.push("/admin/blogs");
    } catch (error) {
      toast.error("Unable to save blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-96 mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-10 w-40" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto text-center py-24">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Blog not found
            </h1>
            <Link href="/admin/blogs">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to list
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/blogs">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to list
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Blog
            </h1>
            <p className="text-gray-600">
              Update information for blog post:{" "}
              <span className="font-semibold">{formData.title}</span>
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Blog Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Blog Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter blog title..."
                  className="text-lg font-semibold"
                />
              </div>

              {/* Category & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id?.toString() || ""}
                    onValueChange={(value) =>
                      handleInputChange("category_id", value ? parseInt(value, 10) : undefined)
                    }
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="my-blog-post-title"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  value={formData.short_description}
                  onChange={(e) => handleInputChange("short_description", e.target.value)}
                  placeholder="A brief summary that appears in blog listings and meta descriptions..."
                  rows={3}
                />
              </div>

              {/* Thumbnail */}
              <div className="space-y-4">
                <Label>Blog Thumbnail</Label>

                {formData.thumbnail_url ? (
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={formData.thumbnail_url}
                      alt="Blog thumbnail"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">No thumbnail image</p>
                    </div>
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    id="thumbnail-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("thumbnail-upload")?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Processing..." : formData.thumbnail_url ? "Change Thumbnail" : "Upload Thumbnail"}
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <Label>Blog Content</Label>

                <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Upload an HTML file to quickly import content (e.g. from Notion, Word, etc.)
                      </p>
                      {uploadedHtmlFile && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-medium">{uploadedHtmlFile}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedHtmlFile(null);
                              handleInputChange("content", "");
                            }}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        id="html-upload"
                        accept=".html,.htm"
                        onChange={handleHtmlFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("html-upload")?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedHtmlFile ? "Replace HTML" : "Import HTML"}
                      </Button>
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  value={formData.content}
                  onChange={(value: string) => handleInputChange("content", value)}
                  placeholder="Write your blog content here or import from an HTML file..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <Label>Tags</Label>
                <div className="space-y-3">
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Enter tag name and press Enter"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add Tag
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Press Enter or click &quot;Add Tag&quot; to add a new tag
                  </p>
                </div>
              </div>

              {/* Published / Draft */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {formData.is_published ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="font-medium">
                      {formData.is_published ? "Blog is published" : "Blog is a draft"}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {formData.is_published
                        ? "The blog post is visible on the website"
                        : "The blog post is hidden (draft mode)"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                />
              </div>

              {/* Save */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={saving || uploading || !formData.title.trim()}
                  className="bg-[#004987] hover:bg-[#003366] px-8"
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}