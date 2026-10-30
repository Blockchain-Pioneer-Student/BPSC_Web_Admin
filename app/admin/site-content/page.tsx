"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  siteContentService,
  type SiteContentKey,
} from "@/lib/services/siteContentService";
import { UploadService } from "@/lib/services/uploadService";
import { usePreviewContext } from "@/components/admin/PreviewContext";

type FieldType = "text" | "textarea" | "number" | "url" | "image";

interface FieldDefinition {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
}

interface SectionDefinition {
  key: SiteContentKey;
  title: string;
  description: string;
  fields: FieldDefinition[];
}

const sections: SectionDefinition[] = [
  {
    key: "branding",
    title: "Branding",
    description: "Logos and site identity used by the current client design.",
    fields: [
      { name: "site_name", label: "Site name" },
      { name: "header_logo_url", label: "Header logo", type: "image" },
      { name: "footer_logo_url", label: "Footer logo", type: "image" },
      { name: "logo_alt", label: "Logo alt text" },
    ],
  },
  {
    key: "navigation",
    title: "Header Navigation",
    description: "Labels and routes rendered in the existing desktop/mobile header.",
    fields: [
      { name: "home_label", label: "Home label" },
      { name: "home_url", label: "Home URL", type: "url" },
      { name: "about_label", label: "About label" },
      { name: "about_url", label: "About URL", type: "url" },
      { name: "events_label", label: "Events label" },
      { name: "events_url", label: "Events URL", type: "url" },
      { name: "news_label", label: "News label" },
      { name: "news_url", label: "News URL", type: "url" },
      { name: "team_label", label: "Team label" },
      { name: "team_url", label: "Team URL", type: "url" },
      { name: "contact_label", label: "Contact label" },
      { name: "contact_url", label: "Contact URL", type: "url" },
      { name: "join_label", label: "Join button label" },
      { name: "join_url", label: "Join URL", type: "url" },
    ],
  },
  {
    key: "home_hero",
    title: "Home · Hero",
    description: "Hero copy, image and CTA from the current homepage.",
    fields: [
      { name: "eyebrow", label: "Eyebrow" },
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_url", label: "Hero image", type: "image" },
      { name: "cta_label", label: "CTA label" },
      { name: "cta_url", label: "CTA URL", type: "url" },
    ],
  },
  {
    key: "home_intro",
    title: "Home · Introduction",
    description: "About heading and the three feature cards.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "description", label: "Section description", type: "textarea" },
      { name: "feature_1_title", label: "Feature 1 title" },
      { name: "feature_1_description", label: "Feature 1 description", type: "textarea" },
      { name: "feature_2_title", label: "Feature 2 title" },
      { name: "feature_2_description", label: "Feature 2 description", type: "textarea" },
      { name: "feature_3_title", label: "Feature 3 title" },
      { name: "feature_3_description", label: "Feature 3 description", type: "textarea" },
    ],
  },
  {
    key: "home_events",
    title: "Home · Featured Activities",
    description: "Copy around the dynamic event cards.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "view_all_label", label: "View-all label" },
      { name: "view_all_url", label: "View-all URL", type: "url" },
    ],
  },
  {
    key: "home_partners",
    title: "Home · Partners",
    description: "Copy around the dynamic partner logo grid.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "view_all_label", label: "View-all label" },
      { name: "view_all_url", label: "View-all URL", type: "url" },
    ],
  },
  {
    key: "home_cta",
    title: "Home · Final CTA",
    description: "Bottom call-to-action section on the homepage.",
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "primary_label", label: "Primary button label" },
      { name: "primary_url", label: "Primary button URL", type: "url" },
    ],
  },
  {
    key: "about_hero",
    title: "About · Hero",
    description: "About-page hero section and background image.",
    fields: [
      { name: "title", label: "Title" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "cta_label", label: "CTA label" },
      { name: "cta_url", label: "CTA URL", type: "url" },
    ],
  },
  {
    key: "about_mission",
    title: "About · Mission",
    description: "Mission statement and four fixed bullet points.",
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "item_1", label: "Bullet 1" },
      { name: "item_2", label: "Bullet 2" },
      { name: "item_3", label: "Bullet 3" },
      { name: "item_4", label: "Bullet 4" },
    ],
  },
  {
    key: "about_vision",
    title: "About · Vision",
    description: "Vision copy and four statistics.",
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "stat_1_number", label: "Stat 1 number" },
      { name: "stat_1_label", label: "Stat 1 label" },
      { name: "stat_2_number", label: "Stat 2 number" },
      { name: "stat_2_label", label: "Stat 2 label" },
      { name: "stat_3_number", label: "Stat 3 number" },
      { name: "stat_3_label", label: "Stat 3 label" },
      { name: "stat_4_number", label: "Stat 4 number" },
      { name: "stat_4_label", label: "Stat 4 label" },
    ],
  },
  {
    key: "about_values",
    title: "About · Core Values",
    description: "Three fixed value cards in the current design.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "value_1_title", label: "Value 1 title" },
      { name: "value_1_description", label: "Value 1 description", type: "textarea" },
      { name: "value_2_title", label: "Value 2 title" },
      { name: "value_2_description", label: "Value 2 description", type: "textarea" },
      { name: "value_3_title", label: "Value 3 title" },
      { name: "value_3_description", label: "Value 3 description", type: "textarea" },
    ],
  },
  {
    key: "about_journey",
    title: "About · Journey",
    description: "Six timeline slots used by the current About page.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "item_1_year", label: "Milestone 1 date" },
      { name: "item_1_title", label: "Milestone 1 title" },
      { name: "item_1_description", label: "Milestone 1 description", type: "textarea" },
      { name: "item_2_year", label: "Milestone 2 date" },
      { name: "item_2_title", label: "Milestone 2 title" },
      { name: "item_2_description", label: "Milestone 2 description", type: "textarea" },
      { name: "item_3_year", label: "Milestone 3 date" },
      { name: "item_3_title", label: "Milestone 3 title" },
      { name: "item_3_description", label: "Milestone 3 description", type: "textarea" },
      { name: "item_4_year", label: "Milestone 4 date" },
      { name: "item_4_title", label: "Milestone 4 title" },
      { name: "item_4_description", label: "Milestone 4 description", type: "textarea" },
      { name: "item_5_year", label: "Milestone 5 date" },
      { name: "item_5_title", label: "Milestone 5 title" },
      { name: "item_5_description", label: "Milestone 5 description", type: "textarea" },
      { name: "item_6_year", label: "Milestone 6 date" },
      { name: "item_6_title", label: "Milestone 6 title" },
      { name: "item_6_description", label: "Milestone 6 description", type: "textarea" },
    ],
  },
  {
    key: "about_cta",
    title: "About · CTA",
    description: "Bottom CTA on the About page.",
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "primary_label", label: "Primary button label" },
      { name: "primary_url", label: "Primary button URL", type: "url" },
      { name: "secondary_label", label: "Secondary button label" },
      { name: "secondary_url", label: "Secondary button URL", type: "url" },
    ],
  },
  {
    key: "team_hero",
    title: "Team · Hero",
    description: "Copy and background image above the dynamic member/board listing.",
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "view_more_label", label: "View-more members label" },
      { name: "background_image_url", label: "Hero background image", type: "image" },
    ],
  },
  {
    key: "events_page",
    title: "Events Page",
    description: "Hero background image and collaboration CTA around dynamic event data.",
    fields: [
      { name: "hero_title", label: "Hero title" },
      { name: "hero_description", label: "Hero description", type: "textarea" },
      { name: "background_image_url", label: "Hero background image", type: "image" },
      { name: "cta_title", label: "CTA title" },
      { name: "cta_description", label: "CTA description", type: "textarea" },
      { name: "primary_label", label: "Primary button label" },
      { name: "primary_url", label: "Primary button URL", type: "url" },
      { name: "secondary_label", label: "Secondary button label" },
      { name: "secondary_url", label: "Secondary button URL", type: "url" },
    ],
  },
  {
    key: "blogs_page",
    title: "News / Blogs Page",
    description: "Hero copy and background image above dynamic blog content.",
    fields: [
      { name: "hero_title", label: "Hero title" },
      { name: "hero_description", label: "Hero description", type: "textarea" },
      { name: "background_image_url", label: "Hero background image", type: "image" },
    ],
  },
  {
    key: "join_hero",
    title: "Join · Hero",
    description: "Join-page hero copy.",
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "join_benefits",
    title: "Join · Benefits",
    description: "Why-join section and three benefit cards.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "description", label: "Section description", type: "textarea" },
      { name: "item_1_title", label: "Benefit 1 title" },
      { name: "item_1_description", label: "Benefit 1 description", type: "textarea" },
      { name: "item_2_title", label: "Benefit 2 title" },
      { name: "item_2_description", label: "Benefit 2 description", type: "textarea" },
      { name: "item_3_title", label: "Benefit 3 title" },
      { name: "item_3_description", label: "Benefit 3 description", type: "textarea" },
    ],
  },
  {
    key: "join_form",
    title: "Join · Application Form",
    description: "Copy around the fixed membership application fields.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "description", label: "Section description", type: "textarea" },
      { name: "closed_title", label: "Closed-campaign title" },
      { name: "closed_description", label: "Closed-campaign description", type: "textarea" },
      { name: "submit_label", label: "Submit button label" },
    ],
  },
  {
    key: "join_faq",
    title: "Join · FAQ",
    description: "Four FAQ slots in the current Join design.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "q1", label: "Question 1" },
      { name: "a1", label: "Answer 1", type: "textarea" },
      { name: "q2", label: "Question 2" },
      { name: "a2", label: "Answer 2", type: "textarea" },
      { name: "q3", label: "Question 3" },
      { name: "a3", label: "Answer 3", type: "textarea" },
      { name: "q4", label: "Question 4" },
      { name: "a4", label: "Answer 4", type: "textarea" },
    ],
  },
  {
    key: "contact_hero",
    title: "Contact · Hero",
    description: "Contact-page hero.",
    fields: [
      { name: "title", label: "Title" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "contact_info",
    title: "Contact · Information",
    description: "Address and direct contact details shared by Contact and Footer.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "connect_title", label: "Social heading" },
    ],
  },
  {
    key: "contact_location",
    title: "Contact · Location",
    description: "Map and directions section.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "map_embed_url", label: "Map embed URL", type: "url" },
      { name: "directions_label", label: "Directions button label" },
      { name: "directions_url", label: "Directions URL", type: "url" },
    ],
  },
  {
    key: "contact_faq",
    title: "Contact · FAQ",
    description: "Four FAQ slots on the Contact page.",
    fields: [
      { name: "title", label: "Section title" },
      { name: "q1", label: "Question 1" },
      { name: "a1", label: "Answer 1", type: "textarea" },
      { name: "q2", label: "Question 2" },
      { name: "a2", label: "Answer 2", type: "textarea" },
      { name: "q3", label: "Question 3" },
      { name: "a3", label: "Answer 3", type: "textarea" },
      { name: "q4", label: "Question 4" },
      { name: "a4", label: "Answer 4", type: "textarea" },
    ],
  },
  {
    key: "footer",
    title: "Footer",
    description: "Text labels in the existing four-column footer.",
    fields: [
      { name: "description", label: "Club description", type: "textarea" },
      { name: "quick_links_title", label: "Quick links title" },
      { name: "quick_about_label", label: "Quick link · About label" },
      { name: "quick_about_url", label: "Quick link · About URL", type: "url" },
      { name: "quick_events_label", label: "Quick link · Events label" },
      { name: "quick_events_url", label: "Quick link · Events URL", type: "url" },
      { name: "quick_news_label", label: "Quick link · News label" },
      { name: "quick_news_url", label: "Quick link · News URL", type: "url" },
      { name: "quick_media_label", label: "Quick link · Media label" },
      { name: "quick_media_url", label: "Quick link · Media URL", type: "url" },
      { name: "quick_partners_label", label: "Quick link · Partners label" },
      { name: "quick_partners_url", label: "Quick link · Partners URL", type: "url" },
      { name: "quick_team_label", label: "Quick link · Team label" },
      { name: "quick_team_url", label: "Quick link · Team URL", type: "url" },
      { name: "join_title", label: "Join column title" },
      { name: "member_label", label: "Member link label" },
      { name: "member_url", label: "Member link URL", type: "url" },
      { name: "faq_label", label: "FAQ link label" },
      { name: "faq_url", label: "FAQ link URL", type: "url" },
      { name: "contact_link_label", label: "Contact link label" },
      { name: "contact_link_url", label: "Contact link URL", type: "url" },
      { name: "contact_title", label: "Contact column title" },
      { name: "copyright_text", label: "Copyright text" },
    ],
  },
  {
    key: "socials",
    title: "Social Links",
    description: "Official social profiles used across the current client.",
    fields: [
      { name: "facebook", label: "Facebook URL", type: "url" },
      { name: "linkedin", label: "LinkedIn URL", type: "url" },
      { name: "telegram", label: "Telegram URL", type: "url" },
      { name: "x", label: "X URL", type: "url" },
      { name: "youtube", label: "YouTube URL", type: "url" },
    ],
  },
];

type DraftMap = Record<string, Record<string, unknown>>;

const sectionUi: Record<string, { title: string; description: string }> = {
  branding: { title: "Thương hiệu", description: "Logo và thông tin nhận diện của website." },
  navigation: { title: "Điều hướng", description: "Nhãn và đường dẫn trên thanh điều hướng." },
  home_hero: { title: "Trang chủ · Phần đầu", description: "Nội dung chính, ảnh và nút hành động đầu trang." },
  home_intro: { title: "Trang chủ · Giới thiệu", description: "Tiêu đề giới thiệu và các điểm nổi bật." },
  home_events: { title: "Trang chủ · Hoạt động", description: "Nội dung bao quanh danh sách sự kiện." },
  home_partners: { title: "Trang chủ · Đối tác", description: "Nội dung bao quanh logo đối tác." },
  home_cta: { title: "Trang chủ · Kêu gọi tham gia", description: "Khu vực kêu gọi hành động cuối trang." },
  about_hero: { title: "Giới thiệu · Phần đầu", description: "Nội dung đầu trang giới thiệu." },
  about_mission: { title: "Giới thiệu · Sứ mệnh", description: "Sứ mệnh và các ý chính." },
  about_vision: { title: "Giới thiệu · Tầm nhìn", description: "Tầm nhìn và các con số nổi bật." },
  about_values: { title: "Giới thiệu · Giá trị", description: "Các giá trị cốt lõi của câu lạc bộ." },
  about_journey: { title: "Giới thiệu · Hành trình", description: "Các mốc phát triển của câu lạc bộ." },
  about_cta: { title: "Giới thiệu · Kêu gọi tham gia", description: "Khu vực cuối trang giới thiệu." },
  team_hero: { title: "Đội ngũ · Phần đầu", description: "Nội dung phía trên danh sách thành viên." },
  events_page: { title: "Trang sự kiện", description: "Nội dung đầu trang và lời mời hợp tác." },
  blogs_page: { title: "Trang bài viết", description: "Nội dung đầu trang tin tức." },
  join_hero: { title: "Tham gia · Phần đầu", description: "Nội dung đầu trang đăng ký." },
  join_benefits: { title: "Tham gia · Quyền lợi", description: "Các quyền lợi khi tham gia câu lạc bộ." },
  join_form: { title: "Tham gia · Biểu mẫu", description: "Nhãn và nội dung của biểu mẫu đăng ký." },
  join_faq: { title: "Tham gia · Câu hỏi thường gặp", description: "Các câu hỏi thường gặp khi đăng ký." },
  contact_hero: { title: "Liên hệ · Phần đầu", description: "Nội dung đầu trang liên hệ." },
  contact_info: { title: "Liên hệ · Thông tin", description: "Địa chỉ và thông tin liên hệ." },
  contact_location: { title: "Liên hệ · Bản đồ", description: "Đường dẫn bản đồ và vị trí." },
  contact_faq: { title: "Liên hệ · Câu hỏi thường gặp", description: "Các câu hỏi thường gặp khi liên hệ." },
  footer: { title: "Chân trang", description: "Liên kết và thông tin ở cuối website." },
  socials: { title: "Mạng xã hội", description: "Các đường dẫn mạng xã hội chính thức." },
};

const fieldLabels: Record<string, string> = {
  "Site name": "Tên website",
  "Header logo": "Logo đầu trang",
  "Footer logo": "Logo chân trang",
  "Logo alt text": "Mô tả logo",
  "Home label": "Nhãn trang chủ",
  "Home URL": "Đường dẫn trang chủ",
  "About label": "Nhãn giới thiệu",
  "About URL": "Đường dẫn giới thiệu",
  "Events label": "Nhãn sự kiện",
  "Events URL": "Đường dẫn sự kiện",
  "News label": "Nhãn bài viết",
  "News URL": "Đường dẫn bài viết",
  "Team label": "Nhãn đội ngũ",
  "Team URL": "Đường dẫn đội ngũ",
  "Contact label": "Nhãn liên hệ",
  "Contact URL": "Đường dẫn liên hệ",
  "Join button label": "Nhãn nút tham gia",
  "Join URL": "Đường dẫn tham gia",
  "Title": "Tiêu đề",
  "Description": "Mô tả",
  "Subtitle": "Mô tả phụ",
  "Section title": "Tiêu đề khu vực",
  "Section description": "Mô tả khu vực",
  "Hero title": "Tiêu đề đầu trang",
  "Hero description": "Mô tả đầu trang",
  "CTA label": "Nhãn nút hành động",
  "CTA URL": "Đường dẫn nút hành động",
  "Image URL": "Đường dẫn ảnh",
  "Hero background image": "Ảnh nền phần đầu trang",
};

const translateFieldLabel = (label: string) => {
  if (fieldLabels[label]) return fieldLabels[label];
  return label
    .replaceAll("Quick link", "Liên kết nhanh")
    .replaceAll("View-all", "Xem tất cả")
    .replaceAll("Primary", "Chính")
    .replaceAll("Secondary", "Phụ")
    .replaceAll("label", "nhãn")
    .replaceAll("URL", "đường dẫn")
    .replaceAll("title", "tiêu đề")
    .replaceAll("description", "mô tả")
    .replaceAll("number", "số")
    .replaceAll("date", "ngày")
    .replaceAll("year", "năm")
    .replaceAll("Value", "Giá trị")
    .replaceAll("Stat", "Chỉ số");
};

export default function SiteContentPage() {
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const {
    setDrafts: setPreviewDrafts,
    setVisibility: setPreviewVisibility,
  } = usePreviewContext();

  const numberFields = useMemo(() => {
    const result = new Set<string>();
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === "number") {
          result.add(`${section.key}:${field.name}`);
        }
      });
    });
    return result;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const entries = await siteContentService.getAllForAdmin();
        const nextDrafts: DraftMap = {};
        const nextVisibility: Record<string, boolean> = {};

        sections.forEach((section) => {
          const entry = entries.find((item) => item.key === section.key);
          nextDrafts[section.key] = entry?.value ?? {};
          nextVisibility[section.key] = entry?.is_visible ?? true;
        });

        setDrafts(nextDrafts);
        setVisibility(nextVisibility);
        setPreviewDrafts(nextDrafts);
        setPreviewVisibility(nextVisibility);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải nội dung website");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [setPreviewDrafts, setPreviewVisibility]);

  const updateField = (
    sectionKey: SiteContentKey,
    fieldName: string,
    value: string,
  ) => {
    setDrafts((current) => {
      const next = {
        ...current,
        [sectionKey]: {
          ...(current[sectionKey] ?? {}),
          [fieldName]: numberFields.has(`${sectionKey}:${fieldName}`)
            ? value === ""
              ? ""
              : Number(value)
            : value,
        },
      };
      setPreviewDrafts(next);
      return next;
    });
  };

  const uploadImage = async (
    sectionKey: SiteContentKey,
    fieldName: string,
    file?: File,
  ) => {
    if (!file) return;

    const uploadKey = `${sectionKey}:${fieldName}`;
    try {
      setUploadingField(uploadKey);
      const result = await UploadService.uploadImage(file);
      updateField(sectionKey, fieldName, result.url);
      toast.success("Đã tải ảnh");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải ảnh");
    } finally {
      setUploadingField(null);
    }
  };

  const saveSection = async (sectionKey: SiteContentKey) => {
    try {
      setSavingKey(sectionKey);
      await siteContentService.update(
        sectionKey,
        drafts[sectionKey] ?? {},
        visibility[sectionKey] ?? true,
      );
      toast.success("Đã lưu khu vực");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu khu vực");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Nội dung website</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung hiển thị mà không cần sửa bố cục hoặc mã nguồn.
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{sectionUi[section.key]?.title ?? section.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sectionUi[section.key]?.description ?? section.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor={`visible-${section.key}`}>Hiển thị</Label>
                <Switch
                  id={`visible-${section.key}`}
                  checked={visibility[section.key] ?? true}
                  onCheckedChange={(checked) =>
                    setVisibility((current) => {
                      const next = { ...current, [section.key]: checked };
                      setPreviewVisibility(next);
                      return next;
                    })
                  }
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {section.fields.map((field) => {
                const value = drafts[section.key]?.[field.name];
                const stringValue =
                  value === undefined || value === null ? "" : String(value);
                const fieldId = `${section.key}-${field.name}`;
                const uploadKey = `${section.key}:${field.name}`;

                return (
                  <div
                    key={field.name}
                    className={
                      field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"
                    }
                  >
                    <Label htmlFor={fieldId}>{translateFieldLabel(field.label)}</Label>

                    {field.type === "textarea" ? (
                      <Textarea
                        id={fieldId}
                        value={stringValue}
                        placeholder={field.placeholder || "Nhập nội dung bằng tiếng Việt"}
                        onChange={(event) =>
                          updateField(section.key, field.name, event.target.value)
                        }
                        rows={4}
                      />
                    ) : (
                      <Input
                        id={fieldId}
                        type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                        value={stringValue}
                        placeholder={
                          field.placeholder ||
                          (field.type === "url"
                            ? "https://bpsclub.com/duong-dan"
                            : "Nhập nội dung bằng tiếng Việt")
                        }
                        onChange={(event) =>
                          updateField(section.key, field.name, event.target.value)
                        }
                      />
                    )}

                    {field.type === "image" && (
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                          {uploadingField === uploadKey ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Tải ảnh
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingField === uploadKey}
                            onChange={(event) =>
                              void uploadImage(
                                section.key,
                                field.name,
                                event.target.files?.[0],
                              )
                            }
                          />
                        </label>
                        {stringValue && (
                          <span className="max-w-md truncate text-xs text-muted-foreground">
                            {stringValue}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => void saveSection(section.key)}
                disabled={savingKey === section.key}
              >
                {savingKey === section.key ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu khu vực
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
