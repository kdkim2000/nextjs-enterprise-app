/**
 * Content Service Types
 */

// Multi-language field type
export interface MultiLangField {
  en: string;
  ko: string;
  zh: string;
  vi: string;
}

// ==================== Board Type ====================

export interface BoardType {
  id: string;
  code: string;
  name_en?: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
  type: string;
  settings?: Record<string, any>;
  write_roles?: string[];
  read_roles?: string[];
  category?: string;
  order?: number;
  status?: string;
  total_posts?: number;
  total_views?: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export interface BoardTypeApiResponse {
  id: string;
  code: string;
  name: MultiLangField;
  description: MultiLangField;
  type: string;
  settings: Record<string, any>;
  writeRoles: string[];
  readRoles: string[];
  category?: string;
  order: number;
  status: string;
  totalPosts: number;
  totalViews: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface BoardTypeCreateRequest {
  code: string;
  name?: MultiLangField | string;
  name_en?: string;
  name_ko?: string;
  name_zh?: string;
  name_vi?: string;
  description?: MultiLangField;
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
  type: string;
  settings?: Record<string, any>;
  writeRoles?: string[];
  readRoles?: string[];
  category?: string;
  order?: number;
  status?: string;
}

// ==================== Post ====================

export interface Post {
  id: string;
  board_type_id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  author_name_ko?: string;
  author_name_en?: string;
  author_department?: string;
  department_name_ko?: string;
  department_name_en?: string;
  is_anonymous?: boolean;
  post_type?: string;
  status?: string;
  is_secret?: boolean;
  is_pinned?: boolean;
  pinned_until?: Date;
  show_popup?: boolean;
  display_start_date?: Date;
  display_end_date?: Date;
  is_approved?: boolean;
  approved_by?: string;
  approved_at?: Date;
  view_count?: number;
  comment_count?: number;
  like_count?: number;
  attachment_count?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  attachment_id?: string;
  question_status?: string;
  accepted_answer_id?: string;
  answer_count?: number;
  resolved_at?: Date;
  resolved_by?: string;
  created_at?: Date;
  updated_at?: Date;
  published_at?: Date;
  deleted_at?: Date;
}

export interface PostApiResponse {
  id: string;
  boardTypeId: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorDepartment?: string;
  departmentName?: string;
  isAnonymous?: boolean;
  postType?: string;
  status?: string;
  isSecret?: boolean;
  isPinned?: boolean;
  pinnedUntil?: Date;
  showPopup?: boolean;
  displayStartDate?: Date;
  displayEndDate?: Date;
  isApproved?: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  attachmentCount: number;
  tags?: string[];
  metadata?: Record<string, any>;
  attachmentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  deletedAt?: Date;
}

export interface PostCreateRequest {
  boardTypeId: string;
  title: string;
  content: string;
  postType?: string;
  status?: string;
  isSecret?: boolean;
  isPinned?: boolean;
  pinnedUntil?: Date;
  showPopup?: boolean;
  displayStartDate?: Date;
  displayEndDate?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  attachmentId?: string;
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  postType?: string;
  status?: string;
  isSecret?: boolean;
  isPinned?: boolean;
  pinnedUntil?: Date;
  showPopup?: boolean;
  displayStartDate?: Date;
  displayEndDate?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  attachmentId?: string;
}

// ==================== Comment ====================

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  author_id: string;
  author_name?: string;
  author_name_ko?: string;
  author_name_en?: string;
  is_anonymous?: boolean;
  content: string;
  status?: string;
  like_count?: number;
  helpful_count?: number;
  depth?: number;
  is_accepted?: boolean;
  accepted_at?: Date;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface CommentApiResponse {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName?: string;
  isAnonymous?: boolean;
  content: string;
  status?: string;
  likeCount: number;
  helpfulCount?: number;
  depth: number;
  isAccepted?: boolean;
  acceptedAt?: Date;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  replies?: CommentApiResponse[];
}

export interface CommentCreateRequest {
  postId: string;
  parentId?: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface CommentUpdateRequest {
  content?: string;
  metadata?: Record<string, any>;
}

// ==================== Help ====================

export interface Help {
  id: string;
  program_id: string;
  title: string;
  content?: string;
  sections?: any[];
  faq?: any[];
  tips?: any[];
  troubleshooting?: any[];
  video_url?: string;
  related_topics?: any[];
  language?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
}

export interface HelpApiResponse {
  id: string;
  programId: string;
  title: string;
  content?: string;
  sections?: any[];
  faq?: any[];
  tips?: any[];
  troubleshooting?: any[];
  videoUrl?: string;
  relatedTopics?: any[];
  language?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface HelpCreateRequest {
  id?: string;
  programId: string;
  language?: string;
  title: string;
  content?: string;
  sections?: any[];
  faqs?: any[];
  tips?: any[];
  troubleshooting?: any[];
  videoUrl?: string;
  relatedLinks?: any[];
  status?: string;
}

export interface HelpUpdateRequest {
  programId?: string;
  language?: string;
  title?: string;
  content?: string;
  sections?: any[];
  faqs?: any[];
  tips?: any[];
  troubleshooting?: any[];
  videoUrl?: string;
  relatedLinks?: any[];
  status?: string;
}

// ==================== Token & Auth ====================

export interface TokenPayload {
  userId: string;
  loginid: string;
  role: string;
  type: 'access' | 'refresh';
}

// ==================== Pagination ====================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== Query Options ====================

export interface BoardTypeQueryOptions extends PaginationOptions {
  type?: string;
  category?: string;
  status?: string;
}

export interface PostQueryOptions extends PaginationOptions {
  boardTypeId?: string;
  postType?: string;
  status?: string;
  authorId?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CommentQueryOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface HelpQueryOptions extends PaginationOptions {
  programId?: string;
  language?: string;
  status?: string;
}

// ==================== Attachment (External Service) ====================

export interface Attachment {
  id: string;
  attachment_type_id: string;
  file_count: number;
  total_size: number;
  files?: AttachmentFile[];
}

export interface AttachmentFile {
  id: string;
  original_filename: string;
  stored_filename: string;
  file_extension: string;
  mime_type: string;
  file_size: number;
  is_image: boolean;
  download_count: number;
  created_at: Date;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      boardType?: BoardType;
      post?: Post;
      comment?: Comment;
    }
  }
}
