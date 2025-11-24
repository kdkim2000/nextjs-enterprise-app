export interface Post {
  id: string;
  board_type_id: string;
  board_type_code?: string;
  board_type_name?: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  author_username?: string;
  is_pinned: boolean;
  is_secret: boolean;
  is_approved: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  attachment_count: number;
  tags?: string[];
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PostFormData extends Partial<Post> {
  id?: string;
}

export interface PostSearchCriteria {
  board_type_id?: string;
  title?: string;
  author_id?: string;
  is_pinned?: boolean;
  is_secret?: boolean;
  is_approved?: boolean;
  status?: string;
  created_at_from?: string;
  created_at_to?: string;
  tags?: string;
  [key: string]: string | string[] | boolean | undefined;
}
