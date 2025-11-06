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
}

export type{ CreateEventData, Speaker, Schedule };