import { BaseApiService } from './baseApiService';

interface Contact {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface PaginatedContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetAllContactsParams {
  page?: number;
  limit?: number;
}

interface ContactsResponse {
  contacts?: Contact[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

class ContactService extends BaseApiService {
  private readonly endpoint = '/contacts';

  // Get all contacts with optional pagination
  async getAllContacts(params?: GetAllContactsParams): Promise<PaginatedContactsResponse | Contact[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `${this.endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.get<ContactsResponse>(url);

    // If pagination was used, return the structured response
    if (params?.page || params?.limit) {
      return {
        contacts: response.contacts || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        totalPages: response.totalPages || 0,
      };
    }

    // Otherwise, return the contacts array for backward compatibility
    return response.contacts || [];
  }

  // Get contact by ID
  async getContactById(id: number): Promise<Contact> {
    return await this.get<Contact>(`${this.endpoint}/${id}`);
  }

  // Delete contact
  async deleteContact(id: number): Promise<{ success: boolean; message: string }> {
    return await this.delete<{ success: boolean; message: string }>(`${this.endpoint}/${id}`);
  }

  // Create contact (public endpoint - for frontend form)
  async createContact(contactData: {
    full_name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<Contact> {
    return await this.post<Contact>(this.endpoint, contactData);
  }
}

export const contactService = new ContactService();
export type { Contact, PaginatedContactsResponse, GetAllContactsParams };
