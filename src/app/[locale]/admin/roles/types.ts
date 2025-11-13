export interface SearchCriteria {
  name: string;
  displayName: string;
  roleType: string;
  isActive: string;
  isSystem: string;
  manager: string;
  representative: string;
  [key: string]: string | string[];
}
