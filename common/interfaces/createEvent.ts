interface Speaker {
  name: string;
  role?: string;
  avatar_img?: string;
  bio?: string;
}

interface Schedule {
  time: string;
  title: string;
  description?: string;
  date?: string;
}

interface CreateEventData {
  title: string;
  slug: string;
  date: string;
  time?: string;
  location?: string;
  excerpt?: string;
  registration_link?: string;
  notion_content?: string;
  is_visible?: boolean;
  category_id?: number;
  schedules?: Schedule[];
  speakers?: Speaker[];
  image_file?: File;

  // NEW: mapping id -> file
  speaker_avatar_images?: {
    [speakerId: number]: File;   // ví dụ: { 1: File, 5: File, 8: File }
  };
}

export type { CreateEventData, Speaker, Schedule };
