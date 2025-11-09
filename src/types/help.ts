export interface HelpContent {
  id: string;
  programId: string; // Unique program identifier (e.g., 'PROG-USER-LIST', 'PROG-DASHBOARD')
  title: string;
  content: string; // Rich HTML content
  sections?: HelpSection[];
  videos?: HelpVideo[];
  faqs?: HelpFAQ[];
  relatedLinks?: RelatedLink[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  status: 'draft' | 'published';
  language: 'en' | 'ko';
}

export interface HelpSection {
  id: string;
  title: string;
  content: string;
  order: number;
  collapsed?: boolean;
}

export interface HelpVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
}

export interface HelpFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface RelatedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface HelpSearchResult {
  id: string;
  programId: string;
  title: string;
  excerpt: string;
  relevance: number;
}
