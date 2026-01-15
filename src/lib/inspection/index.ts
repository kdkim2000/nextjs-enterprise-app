// Status Options
export {
  TEMPLATE_STATUS_OPTIONS,
  INSPECTION_STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  ITEM_TYPE_OPTIONS,
  getStatusOption,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  getTemplateStatusLabel,
  getInspectionStatusLabel,
  getCategoryLabel,
  getItemTypeLabel,
  toSelectOptions,
  toCategorySelectOptions,
  toItemTypeSelectOptions,
} from './statusOptions';

export type {
  TemplateStatus,
  InspectionStatus,
  ItemType,
  StatusOption,
  CategoryOption,
  ItemTypeOption,
} from './statusOptions';

// Status Icons
export {
  getTemplateStatusIcon,
  getTemplateStatusColor,
  getTemplateStatusConfig,
  getInspectionStatusIcon,
  getInspectionStatusColor,
  getInspectionStatusConfig,
  getItemTypeIcon,
  getPriorityIcon,
  getPriorityColor,
} from './statusIcons';

export type { StatusIconConfig } from './statusIcons';
