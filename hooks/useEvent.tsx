import { useState, useEffect, useCallback } from "react";
import { eventService, Event, EventCategory } from "@/lib/services/eventService";
import { toast } from "sonner";
import type { CreateEventData } from '@/common/interfaces/createEvent'

interface UseEventParams {
  sort?: string;
  category?: string;
  search?: string;
}

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

interface UseEventReturn {
  // Data
  events: Event[];
  categories: EventCategory[];
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  currentEvents: Event[];
  
  // Filters
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  
  // Actions
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  fetchEvents: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  handleDelete: (eventUuid: string) => Promise<void>;
  createEvent: (eventData: CreateEventData) => Promise<void>;
  updateEvent: (uuid: string, updateData: any) => Promise<Event>;
  getEventByUuid: (uuid: string) => Promise<Event>;
  
  // Form management functions
  handleInputChange: (field: string, value: any, formData: any, setFormData: any) => void;
  handleImageUpload: (file: File, field?: string, setUploading?: any, setFormData?: any) => Promise<void>;
  handleAddSpeaker: (formData: any, setFormData: any) => void;
  handleDeleteSpeaker: (index: number, formData: any, setFormData: any) => void;
  handleSpeakerChange: (index: number, field: keyof Speaker, value: any, formData: any, setFormData: any) => void;
  handleAddSchedule: (formData: any, setFormData: any) => void;
  handleDeleteSchedule: (index: number, formData: any, setFormData: any) => void;
  handleScheduleChange: (index: number, field: keyof Schedule, value: any, formData: any, setFormData: any) => void;
  normalizeEventData: (data: any) => any;
}

const ITEMS_PER_PAGE = 10;

export const useEvent = (): UseEventReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at_DESC");
  
  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(events.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, endIndex);

  // Fetch events function
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: searchQuery || undefined,
      };
      
      const data = await eventService.getAllEvents(params);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Không thể tải danh sách sự kiện. Vui lòng kiểm tra kết nối mạng và thử lại.");
      setEvents([]); // Reset events on error
    } finally {
      setLoading(false);
    }
  }, [sortBy, selectedCategory, searchQuery]);

  // Fetch categories function
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await eventService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
      setCategories([]); // Reset categories on error
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Refresh events (for manual refresh)
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Create event function
  const createEvent = useCallback(async (eventData: CreateEventData) => {
    try {
      console.log(eventData);
      const response = await eventService.createEvent(eventData);

      if (!response || response.status !== "success") {
        throw new Error("Failed to create event");
      }

      toast.success("Sự kiện đã được tạo thành công");
      await refreshEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Không thể tạo sự kiện. Vui lòng thử lại.");
    }
  }, [refreshEvents]);

  // Update event function
  const updateEvent = useCallback(async (uuid: string, updateData: any) => {
    try {
      console.log('Updating event:', uuid, 'with data:', updateData);
      const response = await eventService.updateEvent(uuid, updateData);
      
      toast.success("Event updated successfully");
      await refreshEvents();
      return response;
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Unable to update event. Please try again.");
      throw error;
    }
  }, [refreshEvents]);

  // Delete event function
  const handleDelete = useCallback(async (eventUuid: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );
    
    if (!confirmed) {
      return; // User cancelled deletion
    }

    try {
      console.log('Deleting event:', eventUuid);
      await eventService.deleteEvent(eventUuid);
      
      toast.success("Event deleted successfully");
      await refreshEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Unable to delete event. Please try again.");
      throw error;
    }
  }, [refreshEvents]);

  // Get event by UUID function
  const getEventByUuid = useCallback(async (uuid: string): Promise<Event> => {
    try {
      const response = await eventService.getEventByUuid(uuid);
      return response;
    } catch (error) {
      console.error("Error fetching event by UUID:", error);
      toast.error("Unable to fetch event. Please try again.");
      throw error;
    }
  }, []);

  // Form management functions
  const handleInputChange = useCallback((field: string, value: any, formData: any, setFormData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleImageUpload = useCallback(async (file: File, field?: string, setUploading?: any, setFormData?: any) => {
    try {
      if (setUploading) setUploading(true);
      if (field && setFormData) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev: any) => ({
            ...prev,
            [field]: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      } else if (setFormData) {
        setFormData((prev: any) => ({
          ...prev,
          image_file: file,
        }));
      }
      toast.success("Ảnh đã được tải lên thành công");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Không thể tải lên ảnh");
    } finally {
      if (setUploading) setUploading(false);
    }
  }, []);

  const handleAddSpeaker = useCallback((formData: any, setFormData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      speakers: [
        ...prev.speakers,
        { name: "", role: "", avatar_img: "", bio: "" },
      ],
    }));
  }, []);

  const handleDeleteSpeaker = useCallback((index: number, formData: any, setFormData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      speakers: prev.speakers.filter((_: any, i: number) => i !== index),
    }));
  }, []);

  const handleSpeakerChange = useCallback((index: number, field: keyof Speaker, value: any, formData: any, setFormData: any) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index][field] = value;
    setFormData((prev: any) => ({
      ...prev,
      speakers: updatedSpeakers,
    }));
  }, []);

  const handleAddSchedule = useCallback((formData: any, setFormData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { title: "", description: "", date: "", time: "" },
      ],
    }));
  }, []);

  const handleDeleteSchedule = useCallback((index: number, formData: any, setFormData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      schedules: prev.schedules.filter((_: any, i: number) => i !== index),
    }));
  }, []);

  const handleScheduleChange = useCallback((index: number, field: keyof Schedule, value: any, formData: any, setFormData: any) => {
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index][field] = value;
    setFormData((prev: any) => ({
      ...prev,
      schedules: updatedSchedules,
    }));
  }, []);

  const normalizeEventData = useCallback((data: any) => {
    const normalizedData = {
      title: data.title.trim(),
      date: data.date,
      time: data.time || undefined,
      location: data.location || undefined,
      excerpt: data.excerpt || undefined,
      image_file: data.image_file,
      notion_content: data.notion_content || undefined,
      is_visible: data.is_visible,
      category_id: data.category_id || undefined,
      speakers: data.speakers?.filter((speaker: any) => speaker.name.trim()) || [],
      schedules: data.schedules?.filter((schedule: any) => schedule.title.trim()) || [],
    };
    return normalizedData;
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchEvents();
  }, [selectedCategory, searchQuery, sortBy, fetchEvents]);

  return {
    // Data
    events,
    categories,
    
    // Loading states
    loading,
    categoriesLoading,
    
    // Pagination
    currentPage,
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
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    fetchEvents,
    refreshEvents,
    handleDelete,
    createEvent,
    updateEvent,
    getEventByUuid,
    
    // Form management functions
    handleInputChange,
    handleImageUpload,
    handleAddSpeaker,
    handleDeleteSpeaker,
    handleSpeakerChange,
    handleAddSchedule,
    handleDeleteSchedule,
    handleScheduleChange,
    normalizeEventData,
  };
};
