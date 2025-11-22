import { API_BASE_URL } from '@/config/enpoints';
import { BaseApiService } from './baseApiService';
import { CreateBlog } from '@/common/interfaces/createBlog';

interface BlogCategory {
  id: number;
  name: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

interface Blog {
  id: number;
  blog_uuid: string;
  title: string;
  slug: string;
  content: string;
  short_description: string;
  thumbnail_url?: string;
  views: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  category_id?: number;
  category?: BlogCategory;
  author?: string;
  tags?: BlogTag[]; // Added tags property
}

interface GetAllBlogsParams {
  sort?: string;
  limit?: number;
  category?: string;
  search?: string;
}

class BlogService extends BaseApiService {
  constructor() {
    super();
  }

  async getAllBlogs(params?: GetAllBlogsParams): Promise<Blog[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.sort) {
        queryParams.append('sort', params.sort);
      }

      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      if (params?.category && params.category.trim() !== '') {
        queryParams.append('category', params.category);
      }

      if (params?.search && params.search.trim() !== '') {
        queryParams.append('search', params.search);
      }

      const endpoint = `/blogs/get-all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await this.get<Blog[]>(endpoint, true);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  }

  async getBlogByUuid(uuid: string): Promise<Blog> {
    try {
      return await this.get<Blog>(`/blogs/uuid/${uuid}`, true);
    } catch (error) {
      console.error('Error fetching blog by UUID:', error);
      throw error;
    }
  }

  async getBlogBySlug(slug: string): Promise<Blog> {
    try {
      return await this.get<Blog>(`/blogs/slug/${slug}`, true);
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      throw error;
    }
  }

  async getAllCategories(): Promise<BlogCategory[]> {
    try {
      return await this.get<BlogCategory[]>('/blogs/categories', true);
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      throw error;
    }
  }

  async getAllTags(): Promise<BlogTag[]> {
    try {
      return await this.get<BlogTag[]>('/blogs/tags', true);
    } catch (error) {
      console.error('Error fetching blog tags:', error);
      throw error;
    }
  }

  async createBlog(blogData: FormData): Promise<Blog> {
    try {
      return await this.post<Blog>('/blogs/create', blogData, true);
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  async updateBlog(uuid: string, updateData: FormData): Promise<Blog> {
    try {
      return await this.patch<Blog>(`/blogs/update/${uuid}`, updateData, true);
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  async deleteBlog(uuid: string): Promise<any> {
    try {
      return await this.delete<any>(`/blogs/uuid/${uuid}`, true);
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }
}

export const blogService = new BlogService();
export type { Blog, GetAllBlogsParams, BlogCategory, BlogTag };