import { BaseApiService } from './baseApiService';

interface Role {
  id: number;
  name: string;
}

class RoleService extends BaseApiService {
  constructor() {
    super();
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      return this.makeRequest('/members/roles');
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw error;
    }
  }

  async createRole(name: string): Promise<Role> {
    try {
      return this.makeRequest('/members/roles', {
        method: 'POST',
        body: JSON.stringify({ name }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async findRoleByName(name: string): Promise<Role | null> {
    try {
      return this.makeRequest(`/members/roles/search?name=${encodeURIComponent(name)}`);
    } catch (error) {
      console.error('Error finding role by name:', error);
      return null;
    }
  }
}

export const roleService = new RoleService();
export default roleService;
export type { Role };