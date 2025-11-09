import { store } from '../store';
import { updateTokens } from '../store/authSlice';
import { API_BASE_URL } from '../../config/enpoints';

export interface BlockchainArea {
  id: number;
  name: string;
  description?: string;
}

export interface RegistrationBlockchainArea {
  id: number;
  registration_id: number;
  area_id: number;
  registration: Registration;
  blockchainArea: BlockchainArea;
}

export interface Registration {
  id: number;
  full_name: string;
  student_id: string;
  email: string;
  phone_number?: string;
  university: string;
  major: string;
  year_of_study: number;
  division: string;
  blockchain_experience?: string;
  reason: string;
  created_at: string;
  blockchainAreas: RegistrationBlockchainArea[];
}

export interface CreateRegistrationDto {
  full_name: string;
  student_id: string;
  email: string;
  phone_number?: string;
  university: string;
  major: string;
  year_of_study: number;
  division: string;
  blockchain_experience?: string;
  reason: string;
  blockchain_area_ids: number[];
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: Registration;
}

export interface RegistrationsListResponse {
  success: boolean;
  message: string;
  data: Registration[];
  count: number;
}

class RegistrationService {
  private baseURL = `${API_BASE_URL}/registrations`;

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const state = store.getState();
    const token = state.auth.user?.access_token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers || {}) as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if we received a new access token in response headers
    const newAccessToken = response.headers.get('X-New-Access-Token');
    if (newAccessToken) {
      console.log('🔄 New access token received, updating Redux store');
      store.dispatch(updateTokens({ access_token: newAccessToken }));
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new registration (Public endpoint)
   */
  async createRegistration(registrationData: CreateRegistrationDto): Promise<RegistrationResponse> {
    return this.makeRequest(`${this.baseURL}/create`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  /**
   * Get all registrations (Admin only)
   */
  async getAllRegistrations(): Promise<RegistrationsListResponse> {
    return this.makeRequest(`${this.baseURL}/get-all`);
  }

  /**
   * Get registration by ID (Admin only)
   */
  async getRegistrationById(id: number): Promise<Registration> {
    const response = await this.getAllRegistrations();
    const registration = response.data.find(reg => reg.id === id);
    
    if (!registration) {
      throw new Error('Registration not found');
    }
    
    return registration;
  }

  /**
   * Search registrations by criteria
   */
  async searchRegistrations(searchTerm: string): Promise<Registration[]> {
    const response = await this.getAllRegistrations();
    
    if (!searchTerm.trim()) {
      return response.data;
    }
    
    const term = searchTerm.toLowerCase();
    return response.data.filter(registration => 
      registration.full_name.toLowerCase().includes(term) ||
      registration.student_id.toLowerCase().includes(term) ||
      registration.email.toLowerCase().includes(term) ||
      registration.university.toLowerCase().includes(term) ||
      registration.major.toLowerCase().includes(term) ||
      registration.division.toLowerCase().includes(term)
    );
  }

  /**
   * Get registrations by blockchain area
   */
  async getRegistrationsByBlockchainArea(areaId: number): Promise<Registration[]> {
    const response = await this.getAllRegistrations();
    return response.data.filter(registration => 
      registration.blockchainAreas.some(area => area.area_id === areaId)
    );
  }

  /**
   * Get registrations statistics
   */
  async getRegistrationsStats(): Promise<{
    total: number;
    byUniversity: Record<string, number>;
    byDivision: Record<string, number>;
    byYearOfStudy: Record<number, number>;
    byBlockchainArea: Record<string, number>;
  }> {
    const response = await this.getAllRegistrations();
    const registrations = response.data;

    const stats = {
      total: registrations.length,
      byUniversity: {} as Record<string, number>,
      byDivision: {} as Record<string, number>,
      byYearOfStudy: {} as Record<number, number>,
      byBlockchainArea: {} as Record<string, number>,
    };

    registrations.forEach(registration => {
      // By university
      stats.byUniversity[registration.university] = 
        (stats.byUniversity[registration.university] || 0) + 1;

      // By division
      stats.byDivision[registration.division] = 
        (stats.byDivision[registration.division] || 0) + 1;

      // By year of study
      stats.byYearOfStudy[registration.year_of_study] = 
        (stats.byYearOfStudy[registration.year_of_study] || 0) + 1;

      // By blockchain areas
      registration.blockchainAreas.forEach(area => {
        if (area.blockchainArea) {
          stats.byBlockchainArea[area.blockchainArea.name] = 
            (stats.byBlockchainArea[area.blockchainArea.name] || 0) + 1;
        }
      });
    });

    return stats;
  }
}

export const registrationService = new RegistrationService();
