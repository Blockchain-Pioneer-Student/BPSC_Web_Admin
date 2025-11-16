interface BlogTag{
    name: string;
}
interface CreateBlog {
  title: string;
  slug: string;
  content: string;
  short_description: string;
  thumbnail_image?: File;
  is_published: boolean;
  category_id?: number;
  tags?: BlogTag[]; // Added tags property
  author: string;
}

export type { CreateBlog };