import { BaseApiService } from './baseApiService';

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

class MemberService extends BaseApiService {
  constructor() {
    super();
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

      if (params?.status) {
        queryParams.append('status', params.status);
      }

      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const endpoint = `/members/get-all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error getting all members:', error);
      throw error;
    }
  }

  async getAllActiveMembers(): Promise<Member[]> {
    try {
      return this.makeRequest('/members/get-all-active');
    } catch (error) {
      console.error('Error getting active members:', error);
      throw error;
    }
  }

  async getMemberById(id: number): Promise<Member> {
    try {
      return this.makeRequest(`/members/${id}`);
    } catch (error) {
      console.error('Error getting member by ID:', error);
      throw error;
    }
  }

  async createMember(memberData: any): Promise<Member> {
    try {
      // If there's an image file, use FormData
      if (memberData.image_file) {
        const formData = new FormData();
        
        // Append the image file
        formData.append('image_file', memberData.image_file);
        
        // Append other fields
        Object.keys(memberData).forEach(key => {
          if (key !== 'image_file' && memberData[key] !== undefined) {
            if (key === 'socials' && Array.isArray(memberData[key])) {
              formData.append(key, JSON.stringify(memberData[key]));
            } else {
              formData.append(key, memberData[key].toString());
            }
          }
        });

        return this.makeRequest('/members/create', {
          method: 'POST',
          body: formData,
          headers: {}, // Let browser set content-type for FormData
        });
      } else {
        // Use regular JSON if no image
        return this.makeRequest('/members/create', {
          method: 'POST',
          body: memberData,
        });
      }
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  async updateMember(id: number, memberData: any): Promise<Member> {
    try {
      // If there's an image file, use FormData
      if (memberData.image_file) {
        const formData = new FormData();
        
        // Append the image file
        formData.append('image_file', memberData.image_file);
        
        // Append other fields
        Object.keys(memberData).forEach(key => {
          if (key !== 'image_file' && memberData[key] !== undefined) {
            if (key === 'socials' && Array.isArray(memberData[key])) {
              formData.append(key, JSON.stringify(memberData[key]));
            } else {
              formData.append(key, memberData[key].toString());
            }
          }
        });

        return this.makeRequest(`/members/update/${id}`, {
          method: 'PATCH',
          body: formData,
          headers: {}, // Let browser set content-type for FormData
        });
      } else {
        // Use regular JSON if no image
        return this.makeRequest(`/members/update/${id}`, {
          method: 'PATCH',
          body: memberData,
        });
      }
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  async deleteMember(id: number): Promise<void> {
    try {
      await this.makeRequest(`/members/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

  async getMemberRoles(): Promise<MemberRole[]> {
    try {
      return this.makeRequest('/members/roles');
    } catch (error) {
      console.error('Error getting member roles:', error);
      throw error;
    }
  }
}

export const memberService = new MemberService();
export default memberService;
export type { Member, MemberRole, MemberSocial, GetAllMembersParams };