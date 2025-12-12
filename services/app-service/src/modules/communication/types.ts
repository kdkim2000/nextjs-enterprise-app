/**
 * Communication Module Types
 */

// Multi-language field type
export interface MultiLangField {
  en: string;
  ko: string;
  zh: string;
  vi: string;
}

// ==================== Mail Types ====================

export interface MailMessage {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  body_html?: string;
  attachment_id?: string;
  send_external: boolean;
  external_status?: string;
  external_sent_at?: Date;
  external_error?: string;
  is_draft: boolean;
  sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MailUserMessage {
  id: string;
  message_id: string;
  user_id: string;
  role: 'sender' | 'to' | 'cc' | 'bcc';
  folder: 'inbox' | 'sent' | 'draft' | 'trash';
  is_read: boolean;
  read_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MailRecipient {
  id: string;
  name?: string;
  email?: string;
  type: 'to' | 'cc' | 'bcc';
}

export interface MailMessageWithDetails extends MailMessage {
  user_message_id: string;
  folder: string;
  is_read: boolean;
  role: string;
  sender_name?: string;
  sender_email?: string;
  recipients?: MailRecipient[];
  preview?: string;
}

export interface MailFolderCounts {
  inbox: { total: number; unread: number };
  sent: { total: number; unread: number };
  draft: { total: number; unread: number };
  trash: { total: number; unread: number };
}

export interface CreateDraftRequest {
  subject?: string;
  body?: string;
  bodyHtml?: string;
  recipients?: MailRecipient[];
  attachmentId?: string;
  sendExternal?: boolean;
}

export interface SendMessageRequest extends CreateDraftRequest {
  draftId?: string;
}

// ==================== Message Types (System Messages) ====================

export interface SystemMessage {
  id: string;
  code: string;
  category: string;
  type: string;
  message_en: string;
  message_ko: string;
  message_zh: string;
  message_vi: string;
  description_en?: string;
  description_ko?: string;
  description_zh?: string;
  description_vi?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface SystemMessageApiResponse {
  id: string;
  code: string;
  category: string;
  type: string;
  message: MultiLangField;
  description: MultiLangField;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemMessageCreateRequest {
  code: string;
  category: string;
  type: string;
  message: MultiLangField;
  description?: MultiLangField;
  status?: string;
}

// ==================== Conversation Types ====================

export interface Conversation {
  id: string;
  title?: string;
  category?: string;
  difficulty_level?: string;
  branch_name?: string;
  total_messages: number;
  duration_minutes?: number;
  summary?: string;
  status?: string;
  started_at?: Date;
  ended_at?: Date;
  created_at: Date;
  updated_at?: Date;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  content_type?: string;
  has_code?: boolean;
  has_error?: boolean;
  tool_calls?: any;
  order: number;
  created_at: Date;
}

export interface ConversationTag {
  id: string;
  name: string;
  name_ko?: string;
  description?: string;
  color?: string;
  category?: string;
  usage_count: number;
}

export interface ConversationCodeChange {
  id: string;
  conversation_id: string;
  file_path: string;
  file_name: string;
  change_type: string;
  language?: string;
  lines_added?: number;
  lines_removed?: number;
  explanation?: string;
  created_at: Date;
}

export interface ConversationWithDetails extends Conversation {
  tags?: ConversationTag[];
  messages?: ConversationMessage[];
  codeChanges?: ConversationCodeChange[];
}

export interface ConversationQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  branch?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ConversationStats {
  total: number;
  avgDuration: number;
  avgMessages: number;
  totalMessages: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  byMonth: Record<string, number>;
  byBranch: Record<string, number>;
}

// ==================== Pagination ====================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
