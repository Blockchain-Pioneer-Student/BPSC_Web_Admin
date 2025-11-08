import { API_BASE_URL } from '@/config/enpoints';
import { store } from '@/lib/store';
import { updateTokens, logout } from '@/lib/store/authSlice';

interface MemberRole {
  id: number;
  name: string;
}

interface MemberSocial {
  id: number;
  member_id: number;
  platform: string;
  url: string;
}

interface Member {
  id: number;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  board_id?: number;
  role_id?: number;
  display_order: number;
  is_active: boolean;
  role?: MemberRole;
  socials?: MemberSocial[];
}

interface GetAllMembersParams {
  sort?: string;
  limit?: number;
  status?: string;
  search?: string;
}

class MemberService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      // Check for new access token in response headers
      const newAccessToken = response.headers.get('X-New-Access-Token');
      if (newAccessToken) {
        // Update only access token in Redux store
        store.dispatch(updateTokens({ access_token: newAccessToken }));
      }

      if (response.status === 401) {
        // If we get 401, it means refresh also failed (session truly expired)
        // JWT Guard would have handled refresh automatically if possible
        store.dispatch(logout());
        throw new Error('Phiên đăng nhập đã hết hạn');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
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

  async getAllMembers(params?: GetAllMembersParams): Promise<Member[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.sort) {
        queryParams.append('sort', params.sort);
      }

      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      if (params?.status && params.status.trim() !== '') {
        queryParams.append('status', params.status);
      }

      if (params?.search && params.search.trim() !== '') {
        queryParams.append('search', params.search);
      }

      const url = `${this.baseURL}/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  }

  async getAllActiveMembers(): Promise<Member[]> {
    try {
      const url = `${this.baseURL}/members/get-all-active`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching active members:', error);
      throw error;
    }
  }

  async getMemberById(id: number): Promise<Member> {
    try {
      const url = `${this.baseURL}/members/${id}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching member by ID:', error);
      throw error;
    }
  }

  async updateMember(id: number, updateData: Partial<Member>): Promise<Member> {
    try {
      const url = `${this.baseURL}/members/${id}`;
      return await this.makeRequest(url, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  async deleteMember(id: number): Promise<any> {
    try {
      const url = `${this.baseURL}/members/${id}`;
      return await this.makeRequest(url, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

  async getAllRoles(): Promise<MemberRole[]> {
    try {
      const url = `${this.baseURL}/members/roles`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }
}

export const memberService = new MemberService();
export type { Member, GetAllMembersParams, MemberRole };
