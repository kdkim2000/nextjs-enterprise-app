export interface Post {
  id: string;
  title: string;
  content?: string;
  author_id?: string;
  author_name?: string;
  author_username?: string;
  board_type_id?: string;
  is_pinned: boolean;
  is_secret: boolean;
  is_important?: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  attachment_count: number;
  tags?: string[];
  category?: string;
  status?: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at?: string;
}

export interface SearchCriteria {
  title: string;
  author_name: string;
  content: string;
  tags: string;
  category: string;
  status: string;
  is_pinned: string;
  is_secret: string;
}
