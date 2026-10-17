import { BaseApiService } from './baseApiService';

export type RecruitmentCampaignStatus =
  | 'draft'
  | 'open'
  | 'closed'
  | 'archived';

export interface RecruitmentCampaign {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
  status: RecruitmentCampaignStatus;
  has_been_published: boolean;
  is_visible: boolean;
  external_form_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecruitmentCampaignPayload {
  title: string;
  slug: string;
  description?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
  status?: RecruitmentCampaignStatus;
  is_visible?: boolean;
  external_form_url?: string | null;
}

class RecruitmentCampaignService extends BaseApiService {
  getAll(): Promise<RecruitmentCampaign[]> {
    return this.get<RecruitmentCampaign[]>('/recruitment-campaigns');
  }

  getActive(): Promise<RecruitmentCampaign | null> {
    return this.get<RecruitmentCampaign | null>(
      '/recruitment-campaigns/active',
      false,
    );
  }

  create(
    payload: RecruitmentCampaignPayload,
  ): Promise<RecruitmentCampaign> {
    return this.post<RecruitmentCampaign>(
      '/recruitment-campaigns',
      payload,
    );
  }

  update(
    id: number,
    payload: Partial<RecruitmentCampaignPayload>,
  ): Promise<RecruitmentCampaign> {
    return this.patch<RecruitmentCampaign>(
      `/recruitment-campaigns/${id}`,
      payload,
    );
  }

  remove(id: number): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(
      `/recruitment-campaigns/${id}`,
    );
  }
}

export const recruitmentCampaignService =
  new RecruitmentCampaignService();
