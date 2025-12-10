/**
 * 공통 타입 정의
 */

/**
 * 기본 엔티티 (모든 테이블 공통)
 */
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

/**
 * 소프트 삭제 지원 엔티티
 */
export interface SoftDeletableEntity extends BaseEntity {
  deleted_at?: Date;
  deleted_by?: string;
  is_deleted?: boolean;
}

/**
 * 상태 타입
 */
export type Status = 'active' | 'inactive';

/**
 * 코드 타입
 */
export interface Code {
  id: string;
  code_type_id: string;
  code: string;
  name_ko: string;
  name_en?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  parent_code?: string;
  extra_data?: Record<string, any>;
}

/**
 * 코드 타입
 */
export interface CodeType {
  id: string;
  code: string;
  name_ko: string;
  name_en?: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
}

/**
 * 부서
 */
export interface Department {
  id: string;
  name_ko: string;
  name_en?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
}

/**
 * 역할
 */
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
}

/**
 * 메뉴
 */
export interface Menu {
  id: string;
  parent_id?: string;
  name_ko: string;
  name_en?: string;
  url?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  requires_auth: boolean;
  children?: Menu[];
}

/**
 * 첨부파일
 */
export interface Attachment {
  id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
  path: string;
  entity_type: string;
  entity_id: string;
  created_at: Date;
  created_by?: string;
}

/**
 * 로그
 */
export interface Log {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  created_at: Date;
}
