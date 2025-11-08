import { API_BASE_URL } from '@/config/enpoints';
import { CreateEventData } from '@/common/interfaces/createEvent';
import { store } from '@/lib/store';
interface EventCategory {
  id: number;
  name: string;
}

interface EventSchedule {
  id: number;
  event_id: number;
  time: string;
  title: string;
  description?: string;
  date?: string;
}

interface EventSpeaker {
  id: number;
  event_id: number;
  name: string;
  role?: string;
  avatar_img?: string;
  bio?: string;
}

interface Event {
  id: number;
  event_uuid: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  specific_location?: string;
  excerpt?: string;
  image?: string;
  views: number;
  likes: number;
  comments: number;
  status?: string;
  registration_link?: string;
  notion_content?: string;
  is_visible?: boolean;
  created_at: string;
  updated_at: string;
  category_id?: number;
  category?: EventCategory;
  schedules?: EventSchedule[];
  speakers?: EventSpeaker[];
}


interface GetAllEventsParams {
  sort?: string;
  limit?: number;
  category?: string;
  search?: string;
}

class EventService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): Record<string, string> {
    const state = store.getState();
    const token = state.auth.user?.access_token;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private getAuthHeadersForFormData(): Record<string, string> {
    const state = store.getState();
    const token = state.auth.user?.access_token;
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getAllEvents(params?: GetAllEventsParams): Promise<Event[]> {
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

      const url = `${this.baseURL}/events/get-all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Event[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async getEventByUuid(uuid: string): Promise<Event> {
    try {
      const url = `${this.baseURL}/events/uuid/${uuid}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Event = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching event by UUID:', error);
      throw error;
    }
  }

  async getEventById(id: number): Promise<Event> {
    try {
      const url = `${this.baseURL}/events/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Event = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  async getAllCategories(): Promise<EventCategory[]> {
    try {
      const url = `${this.baseURL}/events/categories`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EventCategory[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      const url = `${this.baseURL}/events/create`;

      const formData = new FormData();

      // Append all fields to the form data
      formData.append('title', eventData.title);
      formData.append('date', eventData.date);
      if (eventData.time) formData.append('time', eventData.time);
      if (eventData.location) formData.append('location', eventData.location);
      if (eventData.excerpt) formData.append('excerpt', eventData.excerpt);
      if (eventData.registration_link) formData.append('registration_link', eventData.registration_link);
      if (eventData.notion_content) formData.append('notion_content', eventData.notion_content);
      if (eventData.is_visible !== undefined) formData.append('is_visible', String(eventData.is_visible));
      if (eventData.category_id) formData.append('category_id', String(eventData.category_id));

      // Append schedules
      if (eventData.schedules) {
        formData.append('schedules', JSON.stringify(eventData.schedules));
      }

      // Append speakers
      if (eventData.speakers) {
        formData.append('speakers', JSON.stringify(eventData.speakers));
      }

      // Append image file if provided
      if (eventData.image_file) {
        formData.append('image_file', eventData.image_file);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeadersForFormData(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Event = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(uuid: string, updateData: Partial<Event & { image_file?: File }>): Promise<Event> {
    try {
      const url = `${this.baseURL}/events/update/${uuid}`;

      const formData = new FormData();

      // Only append fields that are provided (changed fields)
      if (updateData.title !== undefined) {
        formData.append('title', updateData.title);
      }
      if (updateData.date !== undefined) {
        formData.append('date', updateData.date);
      }
      if (updateData.time !== undefined) {
        formData.append('time', updateData.time || '');
      }
      if (updateData.location !== undefined) {
        formData.append('location', updateData.location || '');
      }
      if (updateData.specific_location !== undefined) {
        formData.append('specific_location', updateData.specific_location || '');
      }
      if (updateData.excerpt !== undefined) {
        formData.append('excerpt', updateData.excerpt || '');
      }
      if (updateData.notion_content !== undefined) {
        formData.append('notion_content', updateData.notion_content || '');
      }
      if (updateData.is_visible !== undefined) {
        formData.append('is_visible', String(updateData.is_visible));
      }
      if (updateData.category_id !== undefined) {
        formData.append('category_id', String(updateData.category_id));
      }

      // Append schedules if provided
      if (updateData.schedules !== undefined) {
        formData.append('schedules', JSON.stringify(updateData.schedules));
      }

      // Append speakers if provided
      if (updateData.speakers !== undefined) {
        formData.append('speakers', JSON.stringify(updateData.speakers));
      }

      // Append image file if provided
      if (updateData.image_file) {
        formData.append('image_file', updateData.image_file);
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeadersForFormData(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(uuid: string): Promise<any> {
    try {
      const url = `${API_BASE_URL}/events/uuid/${uuid}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
export type { Event, GetAllEventsParams, EventCategory, EventSchedule, EventSpeaker, CreateEventData };
