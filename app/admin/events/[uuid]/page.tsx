"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  Save,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon
} from "lucide-react";
import { eventService, Event, EventCategory } from "@/lib/services/eventService";
import { useEvent } from "@/hooks/useEvent";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";

// Dynamically import TinyMCE to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }
);

interface Speaker {
  id?: number; // Optional: only exists for speakers loaded from DB
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

export default function AdminEventEditPage() {
  const params = useParams();
  const router = useRouter();
  const eventUuid = params.uuid as string;

  // Event data state
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Use Event Hook
  const {
    categories,
    categoriesLoading,
    updateEvent,
    getEventByUuid,
    handleInputChange: hookHandleInputChange,
    handleImageUpload: hookHandleImageUpload,
    handleAddSpeaker: hookHandleAddSpeaker,
    handleDeleteSpeaker: hookHandleDeleteSpeaker,
    handleSpeakerChange: hookHandleSpeakerChange,
    handleAddSchedule: hookHandleAddSchedule,
    handleDeleteSchedule: hookHandleDeleteSchedule,
    handleScheduleChange: hookHandleScheduleChange,
  } = useEvent();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    specific_location: "",
    image: "",
    notion_content: "",
    is_visible: true,
    category_id: undefined as number | undefined,
    speakers: [] as Speaker[],
    schedules: [] as Schedule[],
    slug: "",
  });

  // Original data to track changes
  const [originalData, setOriginalData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    specific_location: "",
    image: "",
    notion_content: "",
    is_visible: true,
    category_id: undefined as number | undefined,
    speakers: [] as Speaker[],
    schedules: [] as Schedule[],
    slug: "",
  });

  // Track if image was changed
  const [imageChanged, setImageChanged] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<string | null>(null);
  const [speakerAvatarFiles, setSpeakerAvatarFiles] = useState<(File | null)[]>([]);



  // Fetch event data
  useEffect(() => {
    if (!eventUuid) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventByUuid(eventUuid);

        if (eventData) {
          setEvent(eventData);
          const initialData = {
            title: eventData.title || "",
            date: eventData.date ? eventData.date.split('T')[0] : "", // Format for date input
            time: eventData.time || "",
            location: eventData.location || "",
            specific_location: eventData.specific_location || "",
            image: eventData.image || "",
            notion_content: eventData.notion_content || "",
            is_visible: eventData.is_visible ?? true,
            category_id: eventData.category_id || undefined,
            speakers: eventData.speakers || [],
            schedules: eventData.schedules || [],
            slug: eventData.slug || "",
          };
          setFormData(initialData);
          setOriginalData(initialData);
          // initialize placeholders for speaker avatar files (will store File objects when uploaded)
          setSpeakerAvatarFiles((eventData.speakers || []).map(() => null));
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Unable to load event information");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventUuid, getEventByUuid]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.image && formData.image.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image);
      }
    };
  }, [formData.image]);

  // Handle input change
  const handleInputChange = (field: string, value: any) => {
    hookHandleInputChange(field, value, formData, setFormData);
  };

  // Handle speakers
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

  // Handle schedules
  const handleAddSchedule = () => {
    hookHandleAddSchedule(formData, setFormData);
  };

  const handleDeleteSchedule = (index: number) => {
    hookHandleDeleteSchedule(index, formData, setFormData);
  };

  const handleScheduleChange = (index: number, field: keyof Schedule, value: any) => {
    hookHandleScheduleChange(index, field, value, formData, setFormData);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const mockImageUrl = URL.createObjectURL(file);
      handleInputChange('image', mockImageUrl);
      setSelectedImageFile(file); // Store the actual file
      setImageChanged(true); // Mark image as changed
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Unable to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Helper function to check if arrays are equal
  const arraysEqual = (a: any[], b: any[]) => {
    return JSON.stringify(a) === JSON.stringify(b);
  };

  // Get only changed fields
  const getChangedFields = () => {
    const changes: any = {};

    // Check each field for changes
    if (formData.title !== originalData.title) {
      changes.title = formData.title.trim();
    }

    if (formData.date !== originalData.date) {
      changes.date = formData.date;
    }

    if (formData.time !== originalData.time) {
      changes.time = formData.time || undefined;
    }

    if (formData.location !== originalData.location) {
      changes.location = formData.location || undefined;
    }

    if (formData.specific_location !== originalData.specific_location) {
      changes.specific_location = formData.specific_location || undefined;
    }

    // Handle image changes - check if image was changed OR if we have a new file
    if (imageChanged || selectedImageFile) {
      // If we have a file to upload, mark it for the API call
      if (selectedImageFile) {
        changes._hasImageFile = true; // Flag to indicate we have a file
      } else if (formData.image !== originalData.image) {
        changes.image = formData.image || undefined;
      }
    }

    if (formData.notion_content !== originalData.notion_content) {
      changes.notion_content = formData.notion_content || undefined;
    }

    if (formData.is_visible !== originalData.is_visible) {
      changes.is_visible = formData.is_visible;
    }

    if (formData.category_id !== originalData.category_id) {
      changes.category_id = formData.category_id || undefined;
    }

    if (!arraysEqual(formData.speakers, originalData.speakers)) {
      changes.speakers = formData.speakers.filter((speaker) => speaker.name.trim());
    }

    if (!arraysEqual(formData.schedules, originalData.schedules)) {
      changes.schedules = formData.schedules.filter((schedule) => schedule.title.trim());
    }

    if (formData.slug !== originalData.slug) {
      changes.slug = formData.slug.trim();
    }

    return changes;
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.title.trim()) {
        toast.error("Event name is required");
        return;
      }

      if (!formData.date) {
        toast.error("Event date is required");
        return;
      }

      // Get only changed fields
      const updateData = getChangedFields();

      // If no changes AND no image file AND no speaker avatar files, show message and return
      const hasSpeakerAvatarFiles = speakerAvatarFiles.some((f) => !!f);
      if (Object.keys(updateData).length === 0 && !selectedImageFile && !hasSpeakerAvatarFiles) {
        toast.info("No changes to save");
        return;
      }

      console.log("Update data (changed fields only):", updateData);
      console.log("Selected image file:", selectedImageFile);

      // Prepare data for API call
      const apiData = { ...updateData };


      // Remove internal flags from API data
      delete apiData._hasImageFile;

      // Handle image file upload
      if (imageChanged && selectedImageFile) {
        apiData.image_file = selectedImageFile;
        // Remove the blob URL from the data since we're sending the file
        delete apiData.image;
      }

      // Include speaker avatar files if any were uploaded
      // Convert array to mapping object: { speakerId or speakerIndex: File }
      const speakerAvatarMapping: { [key: number]: File } = {};
      speakerAvatarFiles.forEach((file, index) => {
        if (file) {
          // Use speaker ID if available (for updates), otherwise use index (for creates)
          const key = formData.speakers[index]?.id ?? index;
          speakerAvatarMapping[key] = file;
        }
      });
      if (Object.keys(speakerAvatarMapping).length > 0) {
        apiData.speaker_avatar_images = speakerAvatarMapping;
      }

      // Call API to update event
      await updateEvent(eventUuid, apiData);

      // Redirect back to events list after a delay
      setTimeout(() => {
        router.push('/admin/events');
      }, 1500);

    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Unable to save event information");
    } finally {
      setSaving(false);
    }
  };

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must not exceed 5MB");
        return;
      }

      handleImageUpload(file);
    }
  };

  // Handle speaker avatar upload
  const handleSpeakerAvatarUpload = (index: number, file: File) => {
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
      // store actual File so we can include it in the multipart upload later
      setSpeakerAvatarFiles((prev) => {
        const next = [...prev];
        next[index] = file;
        return next;
      });
    };
    reader.readAsDataURL(file);
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Event not found
            </h1>
            <Link href="/admin/events">
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
            <Link href="/admin/events">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to list
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Event
            </h1>
            <p className="text-gray-600">
              Update information for event: <span className="font-semibold">{event.title}</span>
            </p>
          </div>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event name..."
                  className="text-lg font-semibold"
                />
              </div>

              {/* Category and Slug */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Event Category</Label>
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
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Slug Input */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="Enter slug"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="E.g.: UTC University"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specific_location">Short Description</Label>
                  <Input
                    id="specific_location"
                    value={formData.specific_location}
                    onChange={(e) => handleInputChange('specific_location', e.target.value)}

                  />
                </div>
              </div>

              {/* Event Image */}
              <div className="space-y-4">
                <Label>Event Image</Label>

                {/* Current Image Display */}
                {formData.image && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={formData.image}
                      alt="Event image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {!formData.image && (
                  <div className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">No event image</p>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploading}
                    className="w-full md:w-auto"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Update Image"}
                  </Button>
                </div>
              </div>

              {/* Rich Text Editor for Content */}
              <div className="space-y-4">
                <Label htmlFor="content">Event Content</Label>

                {/* HTML File Upload */}
                <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Upload HTML file to quickly import content
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
                        {uploadedHtmlFile ? "Replace HTML" : "Import HTML"}
                      </Button>
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  value={formData.notion_content}
                  onChange={(value: string) => handleInputChange('notion_content', value)}
                  placeholder="Enter detailed event content or import from HTML file..."
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {formData.is_visible ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label htmlFor="visibility" className="font-medium">
                      {formData.is_visible ? "Event is visible" : "Event is hidden"}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {formData.is_visible
                        ? "Event will be publicly visible to users"
                        : "Event will not be visible to users"
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  id="visibility"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
                />
              </div>

              {/* Schedules */}
              <div className="space-y-4">
                <Label>Schedule</Label>
                {formData.schedules.map((schedule, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={schedule.title}
                        onChange={(e) => handleScheduleChange(index, "title", e.target.value)}
                        placeholder="Enter schedule title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={schedule.description}
                        onChange={(e) => handleScheduleChange(index, "description", e.target.value)}
                        placeholder="Enter schedule description"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={schedule.date}
                          onChange={(e) => handleScheduleChange(index, "date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
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
                      Delete Schedule
                    </Button>
                  </div>
                ))}
                <Button onClick={handleAddSchedule} variant="outline">
                  Add Schedule
                </Button>
              </div>

              {/* Speakers */}
              <div className="space-y-4">
                <Label>Speakers</Label>
                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Speaker Name</Label>
                      <Input
                        value={speaker.name}
                        onChange={(e) => handleSpeakerChange(index, "name", e.target.value)}
                        placeholder="Enter speaker name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={speaker.role}
                        onChange={(e) => handleSpeakerChange(index, "role", e.target.value)}
                        placeholder="Enter speaker role"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Biography</Label>
                      <Input
                        value={speaker.bio}
                        onChange={(e) => handleSpeakerChange(index, "bio", e.target.value)}
                        placeholder="Enter speaker biography"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avatar</Label>
                      {speaker.avatar_img && (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200">
                          <Image
                            src={speaker.avatar_img}
                            alt="Speaker avatar"
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
                              handleSpeakerAvatarUpload(index, file);
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
                          {uploading ? "Uploading..." : "Upload Avatar"}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteSpeaker(index)}
                    >
                      Delete Speaker
                    </Button>
                  </div>
                ))}
                <Button onClick={handleAddSpeaker} variant="outline">
                  Add Speaker
                </Button>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={saving || !formData.title.trim() || !formData.date}
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
