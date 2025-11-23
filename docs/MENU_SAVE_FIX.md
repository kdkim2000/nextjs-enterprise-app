# Menu Save Error Fix

## Problem
Menu save fails because the `description` field is not properly handled in the backend service layer.

## Root Cause
1. Database schema has separate columns: `description_en`, `description_ko`, `description_zh`, `description_vi`
2. Backend routes try to stringify description as JSON
3. Menu service doesn't include description fields in INSERT/UPDATE queries

## Solution

### 1. Fix `backend/services/menuService.js`

#### In `createMenu` function (around line 98):

**Before:**
```javascript
async function createMenu(menuData) {
  const {
    id, code, nameEn, nameKo, nameZh, nameVi, path, icon,
    parentId, level, order, visible, programId
  } = menuData;

  const query = `
    INSERT INTO menus (
      id, code, name_en, name_ko, name_zh, name_vi, path, icon,
      parent_id, level, "order", visible, program_id, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    RETURNING *
  `;

  const params = [id, code, nameEn, nameKo, nameZh, nameVi, path, icon, parentId, level, order, visible, programId];
  const result = await db.query(query, params);
  return result.rows[0];
}
```

**After:**
```javascript
async function createMenu(menuData) {
  const {
    id, code, nameEn, nameKo, nameZh, nameVi, path, icon,
    parentId, level, order, visible, programId,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi
  } = menuData;

  const query = `
    INSERT INTO menus (
      id, code, name_en, name_ko, name_zh, name_vi, path, icon,
      parent_id, level, "order", visible, program_id,
      description_en, description_ko, description_zh, description_vi,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
    RETURNING *
  `;

  const params = [
    id, code, nameEn, nameKo, nameZh, nameVi, path, icon,
    parentId, level, order, visible, programId,
    descriptionEn, descriptionKo, descriptionZh, descriptionVi
  ];
  const result = await db.query(query, params);
  return result.rows[0];
}
```

#### In `updateMenu` function (around line 125):

**Before:**
```javascript
async function updateMenu(menuId, updates) {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi', 'path', 'icon',
    'parent_id', 'level', 'order', 'visible', 'program_id'
  ];
```

**After:**
```javascript
async function updateMenu(menuId, updates) {
  const allowedFields = [
    'code', 'name_en', 'name_ko', 'name_zh', 'name_vi', 'path', 'icon',
    'parent_id', 'level', 'order', 'visible', 'program_id',
    'description_en', 'description_ko', 'description_zh', 'description_vi'
  ];
```

### 2. Fix `backend/routes/menu.js`

#### In POST route (around line 194):

**Before:**
```javascript
const menuData = {
  code,
  nameEn: typeof name === 'string' ? name : name.en || '',
  nameKo: typeof name === 'object' ? name.ko || '' : '',
  nameZh: typeof name === 'object' ? name.zh || '' : '',
  nameVi: typeof name === 'object' ? name.vi || '' : '',
  path,
  icon: icon || 'Article',
  order,
  parentId: parentId || null,
  level,
  programId: programId || null,
  description: JSON.stringify(description || { en: '', ko: '', zh: '', vi: '' })
};
```

**After:**
```javascript
const menuData = {
  code,
  nameEn: typeof name === 'string' ? name : name.en || '',
  nameKo: typeof name === 'object' ? name.ko || '' : '',
  nameZh: typeof name === 'object' ? name.zh || '' : '',
  nameVi: typeof name === 'object' ? name.vi || '' : '',
  path,
  icon: icon || 'Article',
  order,
  parentId: parentId || null,
  level,
  programId: programId || null,
  descriptionEn: typeof description === 'string' ? description : description?.en || '',
  descriptionKo: typeof description === 'object' ? description.ko || '' : '',
  descriptionZh: typeof description === 'object' ? description.zh || '' : '',
  descriptionVi: typeof description === 'object' ? description.vi || '' : ''
};
```

#### In PUT route (around line 266):

**Before:**
```javascript
if (order !== undefined) updates.order = order;
if (parentId !== undefined) updates.parentId = parentId;
if (level !== undefined) updates.level = level;
if (programId !== undefined) updates.programId = programId;
if (description) updates.description = JSON.stringify(description);
```

**After:**
```javascript
if (order !== undefined) updates.order = order;
if (parentId !== undefined) updates.parentId = parentId;
if (level !== undefined) updates.level = level;
if (programId !== undefined) updates.programId = programId;
if (description) {
  if (typeof description === 'object') {
    if (description.en !== undefined) updates.descriptionEn = description.en;
    if (description.ko !== undefined) updates.descriptionKo = description.ko;
    if (description.zh !== undefined) updates.descriptionZh = description.zh;
    if (description.vi !== undefined) updates.descriptionVi = description.vi;
  }
}
```

## Testing

After making these changes:

1. Restart the backend server:
   ```bash
   npm run dev:backend
   ```

2. Test menu creation:
   - Go to http://localhost:3000/ko/admin/menus
   - Click "Add" button
   - Fill in all fields including descriptions
   - Click "Save"
   - Verify no errors occur

3. Test menu update:
   - Edit an existing menu
   - Modify descriptions
   - Click "Save"
   - Verify changes are saved correctly

## Verification

Check the database to ensure description fields are properly saved:
```sql
SELECT id, code, name_en, description_en, description_ko
FROM menus
WHERE code = 'YOUR_TEST_MENU_CODE';
```
