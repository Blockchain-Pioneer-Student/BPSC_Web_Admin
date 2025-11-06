import { API_BASE_URL, buildEndpoint } from '@/config/enpoints';

interface Partner {
  id: number;
  name: string;
  logo: string;
  type: 'academic' | 'business' | 'community' | 'government' | 'technology';
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

class PartnerService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getAllPartners(): Promise<Partner[]> {
    try {
      const endpoint = buildEndpoint.events.partners.getAll();
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Partner[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  }
}

export const partnerService = new PartnerService();
export type { Partner };
