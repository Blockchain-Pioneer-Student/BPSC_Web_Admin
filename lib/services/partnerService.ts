import { BaseApiService } from './baseApiService';

export type PartnerType =
  | 'academic'
  | 'business'
  | 'community'
  | 'government'
  | 'technology';

export type PartnerStatus = 'active' | 'inactive' | 'pending';

export interface Partner {
  id: number;
  name: string;
  logo: string;
  type: PartnerType;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  display_order: number;
  status: PartnerStatus;
  created_at: string;
  updated_at: string;
}

export type PartnerPayload = Omit<
  Partner,
  'id' | 'created_at' | 'updated_at'
>;

class PartnerService extends BaseApiService {
  getAllPartners(): Promise<Partner[]> {
    return this.get<Partner[]>('/partners/admin/all');
  }

  getPartnerById(id: number): Promise<Partner> {
    return this.get<Partner>(`/partners/${id}`);
  }

  createPartner(payload: PartnerPayload): Promise<Partner> {
    return this.post<Partner>('/partners', payload);
  }

  updatePartner(
    id: number,
    payload: Partial<PartnerPayload>,
  ): Promise<Partner> {
    return this.patch<Partner>(`/partners/${id}`, payload);
  }

  deletePartner(id: number): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/partners/${id}`);
  }
}

export const partnerService = new PartnerService();
