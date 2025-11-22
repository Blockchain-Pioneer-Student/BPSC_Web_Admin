/* eslint-disable @next/next/no-img-element */
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { Upload, ArrowLeft, Save, Eye, EyeOff, Image as ImageIcon, X } from "lucide-react";
import { useBlog } from "@/hooks/useBlog";
import { Blog } from "@/lib/services/blogService";
import { Textarea } from "@/components/ui/textarea";

const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor"), {
    ssr: false,
    loading: () => (
        <div className="min-h-[400px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading editor...</div>
        </div>
    ),
});

export default function AdminBlogCreatePage() {
    const router = useRouter();
    const {
        createBlog,
        categories,
        categoriesLoading,
        handleInputChange: hookHandleInputChange,
        handleImageUpload: hookHandleImageUpload,
        normalizeBlogData: hookNormalizeBlogData,
    } = useBlog();

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        short_description: "",
        slug: "",
        is_published: true,
        category_id: undefined as number | undefined,
        thumbnail_image: undefined as File | undefined,
        author: "", // New field for author
        tags: [] as { name: string; slug: string }[], // Add tags field
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedHtmlFile, setUploadedHtmlFile] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState(""); // Add state for tag input


    const handleInputChange = (field: string, value: any) => {
        hookHandleInputChange(field, value, formData, setFormData);
        if (field === "slug") {
            setFormData((prev) => ({ ...prev, slug: value }));
        }
        if (field === "author") {
            setFormData((prev) => ({ ...prev, author: value }));
        }
    };

    const handleImageUpload = async (file: File) => {
        await hookHandleImageUpload(file, "thumbnail_image", setUploading, setFormData);
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);

            if (!formData.title.trim()) {
                toast.error("Blog title is required");
                setSaving(false);
                return;
            }

            let categoryId = formData.category_id;


            const normalizedData = {
                ...formData,
                category_id: categoryId, // Use the resolved category ID
            };

            console.log("Creating blog:", normalizedData.title);
            await createBlog(hookNormalizeBlogData(normalizedData));

            toast.success("Blog created successfully");

            setTimeout(() => {
                router.push("/admin/blogs");
            }, 1500);
        } catch (error) {
            console.error("Error creating blog:", error);
            toast.error("Failed to create blog");
        } finally {
            setSaving(false);
        }
    };

    // Simulated function to create a new category
    const createCategory = async (categoryName: string): Promise<number> => {
        try {
            // Replace this with actual API call to create a category
            console.log("Creating new category:", categoryName);
            return Math.floor(Math.random() * 1000); // Simulated category ID
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error("Failed to create category");
            throw error;
        }
    };

    // Update HTML file upload handling to display file name and restrict to .html extension
    const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Restrict to .html extension
        if (!file.name.toLowerCase().endsWith(".html")) {
            toast.error("Only .html files are allowed");
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
                setUploadedHtmlFile(file.name); // Display file name
                toast.success(`HTML content imported from "${file.name}"`);
                e.target.value = "";
            } catch (error) {
                toast.error("Failed to read HTML file");
            }
        };

        reader.onerror = () => {
            toast.error("Failed to read HTML file");
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link href="/admin/blogs">
                            <Button variant="outline" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to list
                            </Button>
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Blog</h1>
                        <p className="text-gray-600">Fill out the form below to create a new blog post.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Blog Information</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-8">
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
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
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

                            <div className="space-y-2">
                                <Label>Short Description</Label>
                                <Textarea
                                    value={formData.short_description}
                                    onChange={(e) => handleInputChange("short_description", e.target.value)}
                                    placeholder="A brief summary that appears in blog listings and meta descriptions..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Thumbnail Image</Label>
                                {formData.thumbnail_image && (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={URL.createObjectURL(formData.thumbnail_image)}
                                            alt="Thumbnail image"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}
                                <div>
                                    <input
                                        type="file"
                                        id="thumbnail-upload"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(file);
                                        }}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("thumbnail-upload")?.click()}
                                        disabled={uploading}
                                    >
                                        Upload Image
                                    </Button>
                                </div>
                            </div>

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

                            <div className="space-y-2">
                                <Label htmlFor="author">Author *</Label>
                                <Input
                                    id="author"
                                    value={formData.author}
                                    onChange={(e) => handleInputChange("author", e.target.value)}
                                    placeholder="Enter author name..."
                                    className="text-lg font-semibold"
                                />
                            </div>

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

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {formData.is_published ? (
                                        <span className="text-green-600">Published</span>
                                    ) : (
                                        <span className="text-gray-400">Draft</span>
                                    )}
                                </div>
                                <Switch
                                    checked={formData.is_published}
                                    onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                                />
                            </div>
                            <div className="flex justify-end pt-6 border-t">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={saving || uploading || !formData.title.trim()}
                                    className="bg-[#004987] hover:bg-[#003366] px-8"
                                    size="lg"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
