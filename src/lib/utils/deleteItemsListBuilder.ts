/**
 * DeleteItemsList type for DeleteConfirmDialog
 */
export interface DeleteItem {
  id: string | number;
  displayName: string;
}

export interface DeleteItemsListBuilderOptions<T> {
  /**
   * Array of selected IDs to delete
   */
  selectedIds: (string | number)[];

  /**
   * Array of items to search from
   */
  items: T[];

  /**
   * Function to get the ID from an item
   */
  getId: (item: T) => string | number;

  /**
   * Function to get the display name from an item
   */
  getDisplayName: (item: T) => string;

  /**
   * Fallback display name pattern when item not found
   * Use {id} as placeholder for the ID
   * @default "Item {id}"
   */
  fallbackPattern?: string;
}

/**
 * Builds a list of items for DeleteConfirmDialog
 *
 * @example
 * ```tsx
 * const deleteItemsList = buildDeleteItemsList({
 *   selectedIds: selectedForDelete,
 *   items: posts,
 *   getId: (post) => post.id,
 *   getDisplayName: (post) => post.title,
 *   fallbackPattern: "Post {id}"
 * });
 * ```
 *
 * @example With localized names
 * ```tsx
 * const deleteItemsList = buildDeleteItemsList({
 *   selectedIds: selectedForDelete,
 *   items: departments,
 *   getId: (dept) => dept.id,
 *   getDisplayName: (dept) => `${dept.code} (${dept.name[locale] || dept.name.en})`,
 *   fallbackPattern: "Department {id}"
 * });
 * ```
 */
export function buildDeleteItemsList<T>(
  options: DeleteItemsListBuilderOptions<T>
): DeleteItem[] {
  const {
    selectedIds,
    items,
    getId,
    getDisplayName,
    fallbackPattern = 'Item {id}'
  } = options;

  return selectedIds.map((id) => {
    const item = items.find((i) => getId(i) === id);

    if (item) {
      return {
        id,
        displayName: getDisplayName(item)
      };
    }

    return {
      id,
      displayName: fallbackPattern.replace('{id}', String(id))
    };
  });
}

/**
 * Simplified version for items with standard id and name/title fields
 *
 * @example
 * ```tsx
 * const deleteItemsList = buildSimpleDeleteItemsList(
 *   selectedIds,
 *   posts,
 *   'title',  // field to use as display name
 *   'Post'    // item type name for fallback
 * );
 * ```
 */
export function buildSimpleDeleteItemsList<T extends { id: string | number }>(
  selectedIds: (string | number)[],
  items: T[],
  displayField: keyof T,
  itemTypeName: string = 'Item'
): DeleteItem[] {
  return buildDeleteItemsList({
    selectedIds,
    items,
    getId: (item) => item.id,
    getDisplayName: (item) => String(item[displayField] || `${itemTypeName} ${item.id}`),
    fallbackPattern: `${itemTypeName} {id}`
  });
}

/**
 * Version for items with localized name fields (name_en, name_ko, etc.)
 *
 * @example
 * ```tsx
 * const deleteItemsList = buildLocalizedDeleteItemsList(
 *   selectedIds,
 *   departments,
 *   locale,
 *   'code',        // optional code field to prefix
 *   'Department'   // item type name for fallback
 * );
 * ```
 */
export function buildLocalizedDeleteItemsList<
  T extends {
    id: string | number;
    name?: { en?: string; ko?: string; zh?: string; vi?: string } | string;
    name_en?: string;
    name_ko?: string;
    name_zh?: string;
    name_vi?: string;
    code?: string;
  }
>(
  selectedIds: (string | number)[],
  items: T[],
  locale: string,
  codeField?: keyof T,
  itemTypeName: string = 'Item'
): DeleteItem[] {
  return buildDeleteItemsList({
    selectedIds,
    items,
    getId: (item) => item.id,
    getDisplayName: (item) => {
      // Try to get localized name
      let name: string | undefined;

      // Check for name object format
      if (typeof item.name === 'object' && item.name !== null) {
        name = (item.name as any)[locale] || item.name.en;
      }

      // Check for name_locale format
      if (!name) {
        const localizedField = `name_${locale}` as keyof T;
        name = item[localizedField] as string | undefined;
      }

      // Fallback to name_en
      if (!name && item.name_en) {
        name = item.name_en;
      }

      // Build display name with optional code prefix
      if (codeField && item[codeField]) {
        return `${item[codeField]} (${name || item.id})`;
      }

      return name || String(item.id);
    },
    fallbackPattern: `${itemTypeName} {id}`
  });
}
