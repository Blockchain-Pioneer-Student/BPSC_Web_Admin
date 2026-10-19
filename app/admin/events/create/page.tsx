"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useEvent } from "@/hooks/useEvent";
import { eventService, EventCategory } from "@/lib/services/eventService";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    ),
  }
);

interface Speaker {
  name: string;
  role?: string;
  avatar_img?: string;
  bio?: string;
}

interface Schedule {
  time: string;
  title: string;
  description?: string;
  date?: string;
}

export default function AdminEventCreatePage() {
  const router = useRouter();
  const { 
    createEvent,
    categories,
    categoriesLoading,
    handleInputChange: hookHandleInputChange,
    handleImageUpload: hookHandleImageUpload,
    handleAddSpeaker: hookHandleAddSpeaker,
    handleDeleteSpeaker: hookHandleDeleteSpeaker,
    handleSpeakerChange: hookHandleSpeakerChange,
    handleAddSchedule: hookHandleAddSchedule,
    handleDeleteSchedule: hookHandleDeleteSchedule,
    handleScheduleChange: hookHandleScheduleChange,
    normalizeEventData: hookNormalizeEventData,
  } = useEvent();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    excerpt: "",
    image_file: undefined as File | undefined,
    notion_content: "",
    is_visible: true,
    category_id: undefined as number | undefined,
    speakers: [] as Speaker[],
    schedules: [] as Schedule[],
    slug: "",
  });
  // console.log(formData.schedules);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<string | null>(null);

  // Add state to track speaker avatar files
  const [speakerAvatarFiles, setSpeakerAvatarFiles] = useState<(File | null)[]>([]);

  const handleInputChange = (field: string, value: any) => {
    hookHandleInputChange(field, value, formData, setFormData);

    if (field === "slug") {
      setFormData((prev) => ({ ...prev, slug: value }));
    }
  };

  const handleImageUpload = async (file: File, field?: string) => {
    await hookHandleImageUpload(file, field, setUploading, setFormData);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!formData.title.trim()) {
        toast.error("Vui lòng nhập tên sự kiện");
        setSaving(false);
        return;
      }

      if (!formData.date) {
        toast.error("Vui lòng chọn ngày diễn ra");
        setSaving(false);
        return;
      }
      
      console.log("Creating event:", formData.title);

      // Prepare event data
      const eventData = hookNormalizeEventData(formData);

      // Add speaker avatar files mapping (for create, use index since no IDs yet)
      const speakerAvatarMapping: { [key: number]: File } = {};
      speakerAvatarFiles.forEach((file, index) => {
        if (file) {
          speakerAvatarMapping[index] = file;
        }
      });

      if (Object.keys(speakerAvatarMapping).length > 0) {
        eventData.speaker_avatar_images = speakerAvatarMapping;
      }

      await createEvent(eventData);

      toast.success("Đã tạo sự kiện");
      
      setTimeout(() => {
        router.push("/admin/events");
      }, 1500);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Không thể tạo sự kiện");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpeaker = () => {
    hookHandleAddSpeaker(formData, setFormData);
    setSpeakerAvatarFiles((prev) => [...prev, null]);
  };

  const handleDeleteSpeaker = (index: number) => {
    hookHandleDeleteSpeaker(index, formData, setFormData);
    setSpeakerAvatarFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpeakerChange = (index: number, field: keyof Speaker, value: any) => {
    hookHandleSpeakerChange(index, field, value, formData, setFormData);
  };

  const handleAddSchedule = () => {
    hookHandleAddSchedule(formData, setFormData);
  };

  const handleDeleteSchedule = (index: number) => {
    hookHandleDeleteSchedule(index, formData, setFormData);
  };

  const handleScheduleChange = (index: number, field: keyof Schedule, value: any) => {
    hookHandleScheduleChange(index, field, value, formData, setFormData);
  };


  // Handle HTML file upload
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('html') && !file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      toast.error("Please select an HTML file (.html or .htm)");
      return;
    }

    // Validate file size (max 1MB for HTML files)
    if (file.size > 1024 * 1024) {
      toast.error("HTML file size must not exceed 1MB");
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const htmlContent = event.target?.result as string;
        
        // Basic HTML sanitization - remove script tags and dangerous attributes
        const sanitizedContent = htmlContent
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
          .replace(/javascript:/gi, ''); // Remove javascript: protocols

        // Set the content to the rich text editor
        handleInputChange('notion_content', sanitizedContent);
        
        // Store the uploaded file name
        setUploadedHtmlFile(file.name);
        
        toast.success(`HTML content imported from "${file.name}" successfully!`);
        
        // Clear the file input
        e.target.value = '';
      } catch (error) {
        console.error("Error reading HTML file:", error);
        toast.error("Failed to read HTML file");
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read HTML file");
    };

    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/admin/events">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </Button>
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo sự kiện mới
            </h1>
            <p className="text-gray-600">Nhập thông tin để đăng sự kiện lên website.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tên sự kiện *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ví dụ: Workshop ví và smart contract"
                  className="text-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Loại sự kiện</Label>
                  <Select
                    value={formData.category_id?.toString() || ""}
                    onValueChange={(value) => 
                      handleInputChange("category_id", value ? parseInt(value, 10) : undefined)
                    }
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Đang tải..." : "Chọn loại sự kiện"} />
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
                  <Label htmlFor="slug">Đường dẫn</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="vi-du-workshop-smart-contract"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Ngày diễn ra *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Thời gian</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Ví dụ: Đại học Giao thông vận tải"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Mô tả ngắn</Label>
                  <Input
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Ảnh sự kiện</Label>
                {formData.image_file && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={URL.createObjectURL(formData.image_file)}
                      alt="Ảnh sự kiện"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="event-image-upload"
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
                    onClick={() =>
                      document.getElementById("event-image-upload")?.click()
                    }
                    disabled={uploading}
                  >
                    {uploading ? "Đang tải ảnh..." : "Tải ảnh sự kiện"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="content">Nội dung sự kiện</Label>
                
                {/* HTML File Upload */}
                <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Tải tệp HTML để nhập nhanh nội dung
                      </p>
                      {uploadedHtmlFile && (
                        <div className="mt-2 flex items-center gap-2">
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
                              handleInputChange('notion_content', '');
                            }}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
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
                        onClick={() => document.getElementById('html-upload')?.click()}
                        className="whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedHtmlFile ? "Thay tệp HTML" : "Nhập tệp HTML"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <RichTextEditor
                  value={formData.notion_content}
                  onChange={(value: string) =>
                    handleInputChange("notion_content", value)
                  }
                  placeholder="Nhập nội dung chi tiết hoặc chọn tệp HTML..."
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {formData.is_visible ? (
                    <span className="text-green-600">Đang hiện</span>
                  ) : (
                    <span className="text-gray-400">Đang ẩn</span>
                  )}
                  <Label htmlFor="visibility" className="font-medium">
                    {formData.is_visible
                      ? "Sự kiện đang hiển thị"
                      : "Sự kiện đang ẩn"}
                  </Label>
                </div>
                <Switch
                  id="visibility"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_visible", checked)
                  }
                />
              </div>

              <div className="space-y-4">
                <Label>Lịch chương trình</Label>
                {formData.schedules.map((schedule, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Tiêu đề</Label>
                      <Input
                        value={schedule.title}
                        onChange={(e) => handleScheduleChange(index, "title", e.target.value)}
                        placeholder="Ví dụ: Khai mạc"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả</Label>
                      <Input
                        value={schedule.description}
                        onChange={(e) => handleScheduleChange(index, "description", e.target.value)}
                        placeholder="Mô tả ngắn cho nội dung"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ngày</Label>
                        <Input
                          type="date"
                          value={schedule.date}
                          onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Giờ</Label>
                        <Input
                          type="time"
                          value={schedule.time}
                          onChange={(e) => handleScheduleChange(index, "time", e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteSchedule(index)}
                    >
                      Xóa mục lịch
                    </Button>
                  </div>
                ))}
                <Button onClick={handleAddSchedule} variant="outline">
                  Thêm mục lịch
                </Button>
              </div>

              <div className="space-y-4">
                <Label>Diễn giả</Label>
                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Tên diễn giả</Label>
                      <Input
                        value={speaker.name}
                        onChange={(e) => handleSpeakerChange(index, "name", e.target.value)}
                        placeholder="Nguyễn Văn An"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vai trò</Label>
                      <Input
                        value={speaker.role}
                        onChange={(e) => handleSpeakerChange(index, "role", e.target.value)}
                        placeholder="Founder, Developer..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Giới thiệu</Label>
                      <Input
                        value={speaker.bio}
                        onChange={(e) => handleSpeakerChange(index, "bio", e.target.value)}
                        placeholder="Một vài dòng giới thiệu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ảnh đại diện</Label>
                      {speaker.avatar_img && (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200">
                          <Image
                            src={speaker.avatar_img}
                            alt="Ảnh đại diện diễn giả"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          id={`speaker-avatar-upload-${index}`}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Handle speaker avatar upload directly
                              if (!file.type.startsWith('image/')) {
                                toast.error("Please select an image file");
                                return;
                              }
                              
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error("Image size must not exceed 5MB");
                                return;
                              }

                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleSpeakerChange(index, "avatar_img", reader.result as string);
                                // Store actual File object for upload
                                setSpeakerAvatarFiles((prev) => {
                                  const next = [...prev];
                                  next[index] = file;
                                  return next;
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById(`speaker-avatar-upload-${index}`)?.click()}
                          disabled={uploading}
                        >
                          {uploading ? "Đang tải ảnh..." : "Tải ảnh đại diện"}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteSpeaker(index)}
                    >
                      Xóa diễn giả
                    </Button>
                  </div>
                ))}
                <Button onClick={handleAddSpeaker} variant="outline">
                  Thêm diễn giả
                </Button>
              </div>

              

              <div className="flex justify-end pt-6 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={saving || !formData.title.trim() || !formData.date}
                  className="bg-[#004987] hover:bg-[#003366] px-8"
                  size="lg"
                >
                  {saving ? "Đang lưu..." : "Tạo sự kiện"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
