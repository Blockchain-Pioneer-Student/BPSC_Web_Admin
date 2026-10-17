import { BaseApiService } from './baseApiService';

export type SiteContentKey =
  | 'branding'
  | 'navigation'
  | 'home_hero'
  | 'home_intro'
  | 'home_events'
  | 'home_partners'
  | 'home_cta'
  | 'about_hero'
  | 'about_mission'
  | 'about_vision'
  | 'about_values'
  | 'about_journey'
  | 'about_cta'
  | 'team_hero'
  | 'events_page'
  | 'blogs_page'
  | 'join_hero'
  | 'join_benefits'
  | 'join_form'
  | 'join_faq'
  | 'contact_hero'
  | 'contact_info'
  | 'contact_location'
  | 'contact_faq'
  | 'footer'
  | 'socials';

export interface SiteContentEntry {
  key: SiteContentKey;
  value: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

class SiteContentService extends BaseApiService {
  getAllForAdmin(): Promise<SiteContentEntry[]> {
    return this.get<SiteContentEntry[]>('/site-content/admin/all');
  }

  getPublic(): Promise<SiteContentEntry[]> {
    return this.get<SiteContentEntry[]>('/site-content', false);
  }

  update(
    key: SiteContentKey,
    value: Record<string, unknown>,
    isVisible = true,
  ): Promise<SiteContentEntry> {
    return this.put<SiteContentEntry>(`/site-content/${key}`, {
      value,
      is_visible: isVisible,
    });
  }
}

export const siteContentService = new SiteContentService();
