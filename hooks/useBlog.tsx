import { useState, useEffect, useCallback } from 'react';
import { blogService, Blog, BlogCategory, BlogTag } from '@/lib/services/blogService';
import { toast } from 'sonner';
import { CreateBlog } from '@/common/interfaces/createBlog';

interface UseBlogParams {
  sort?: string;
  category?: string;
  search?: string;
}

interface UseBlogReturn {
  blogs: Blog[];
  categories: BlogCategory[];
  tags: BlogTag[];
  loading: boolean;
  categoriesLoading: boolean;
  tagsLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  currentBlogs: Blog[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  fetchBlogs: () => Promise<void>;
  refreshBlogs: () => Promise<void>;
  handleDelete: (blogUuid: string) => Promise<void>;
  createBlog: (blogData: FormData | CreateBlog) => Promise<void>;
  updateBlog: (uuid: string, updateData: FormData) => Promise<Blog>;
  getBlogByUuid: (uuid: string) => Promise<Blog>;
  handleInputChange: (field: string, value: any, formData: any, setFormData: any) => void;
  handleImageUpload: (file: File, field: string, setUploading: (uploading: boolean) => void, setFormData: any) => Promise<void>;
  normalizeBlogData: (formData: any) => FormData;
}

const ITEMS_PER_PAGE = 10;

export const useBlog = (): UseBlogReturn => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at_DESC');

  const totalPages = Math.max(1, Math.ceil(blogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = blogs.slice(startIndex, endIndex);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      };

      const data = await blogService.getAllBlogs(params);
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Unable to load blogs. Please check your network connection and try again.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, selectedCategory, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await blogService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      toast.error('Unable to load blog categories.');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      setTagsLoading(true);
      const tagsData = await blogService.getAllTags();
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching blog tags:', error);
      // Don't show toast error for tags to avoid clutter if it fails silently
      setTags([]);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  const refreshBlogs = useCallback(async () => {
    await fetchBlogs();
  }, [fetchBlogs]);

  const createBlog = useCallback(async (blogData: CreateBlog | FormData) => {
    try {
      let formDataToSend: FormData;

      if (blogData instanceof FormData) {
        formDataToSend = blogData;
      } else {
        formDataToSend = new FormData();
        Object.entries(blogData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, value.toString());
          }
        });
      }

      await blogService.createBlog(formDataToSend);
      toast.success('Blog created successfully!');
      await refreshBlogs();
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog.');
    }
  }, [refreshBlogs]);

  const updateBlog = useCallback(async (uuid: string, updateData: FormData): Promise<Blog> => {
    try {
      const updatedBlog = await blogService.updateBlog(uuid, updateData);
      toast.success('Blog updated successfully!');
      await refreshBlogs();
      return updatedBlog;
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog.');
      throw error;
    }
  }, [refreshBlogs]);

  const handleDelete = useCallback(async (blogUuid: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this blog? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await blogService.deleteBlog(blogUuid);
      toast.success('Blog deleted successfully!');
      await refreshBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog.');
    }
  }, [refreshBlogs]);

  const getBlogByUuid = useCallback(async (uuid: string): Promise<Blog> => {
    try {
      return await blogService.getBlogByUuid(uuid);
    } catch (error) {
      console.error('Error fetching blog by UUID:', error);
      toast.error('Failed to fetch blog details.');
      throw error;
    }
  }, []);

  const handleInputChange = (field: string, value: any, formData: any, setFormData: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (
    file: File,
    field: string,
    setUploading: (uploading: boolean) => void,
    setFormData: any
  ) => {
    try {
      setUploading(true);
      setFormData((prev: any) => ({ ...prev, [field]: file }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const normalizeBlogData = (formData: any): FormData => {
    const normalizedData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          normalizedData.append(key, value);
        } else if (typeof value === 'object' && key === 'tags') {
          // Serialize tags to JSON string
          normalizedData.append(key, JSON.stringify(value));
        } else {
          normalizedData.append(key, value.toString());
        }
      }
    });
    return normalizedData;
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    // fetchTags();
  }, [fetchBlogs, fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
    fetchBlogs();
  }, [selectedCategory, searchQuery, sortBy, fetchBlogs]);

  return {
    blogs,
    categories,
    tags,
    loading,
    categoriesLoading,
    tagsLoading,
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentBlogs,
    selectedCategory,
    searchQuery,
    sortBy,
    setCurrentPage,
    setItemsPerPage,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    fetchBlogs,
    refreshBlogs,
    handleDelete,
    createBlog,
    updateBlog,
    getBlogByUuid,
    handleInputChange,
    handleImageUpload,
    normalizeBlogData,
  };
};