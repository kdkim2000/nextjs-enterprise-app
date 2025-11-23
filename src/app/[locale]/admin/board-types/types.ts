export interface MultiLangField {
  en: string;
  ko: string;
  zh?: string;
  vi?: string;
}

export interface BoardType {
  id: string;
  code: string;
  // Backend returns name/description as objects
  name?: MultiLangField;
  description?: MultiLangField;
  // Fallback for flat structure
  name_en?: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
  type: 'normal' | 'notice';
  category?: string;
  settings: {
    allowComments?: boolean;
    allowAttachments?: boolean;
    allowLikes?: boolean;
    requireApproval?: boolean;
    maxAttachments?: number;
    maxAttachmentSize?: number;
    allowedFileTypes?: string[];
  };
  // Backend returns camelCase, frontend form uses snake_case
  write_roles?: string[];
  read_roles?: string[];
  writeRoles?: string[];
  readRoles?: string[];
  status: string;
  order?: number;
  totalPosts?: number;
  totalViews?: number;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  created_by?: string;
  updated_by?: string;
  createdBy?: string;
  updatedBy?: string;
  post_count?: number;
  comment_count?: number;
  like_count?: number;
  attachment_count?: number;
  view_count?: number;
}

export interface BoardTypeFormData extends Partial<BoardType> {
  id?: string;
}

export interface BoardTypeSearchCriteria {
  code?: string;
  name?: string;
  type?: string;
  category?: string;
  status?: string;
  created_at_from?: string;
  created_at_to?: string;
  [key: string]: string | string[] | undefined;
}
