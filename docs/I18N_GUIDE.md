# Internationalization (i18n) Guide

## Overview
This application uses [next-international](https://github.com/QuiiBz/next-international) for internationalization support. The system is designed to be flexible and easily extensible for adding new languages.

## Supported Languages
- **English (en)** - 🇺🇸 English
- **Korean (ko)** - 🇰🇷 한국어
- **Chinese (zh)** - 🇨🇳 简体中文
- **Vietnamese (vi)** - 🇻🇳 Tiếng Việt

## Architecture

### File Structure
```
src/lib/i18n/
├── languages.ts          # Language configuration (centralized)
├── client.ts             # Client-side i18n hooks
├── server.ts             # Server-side i18n utilities
├── index.ts              # Re-exports
└── locales/
    ├── en.ts             # English translations
    ├── ko.ts             # Korean translations
    ├── zh.ts             # Chinese translations
    └── vi.ts             # Vietnamese translations

middleware.ts              # Next.js middleware for locale handling
```

### Key Components

#### 1. Language Configuration (`languages.ts`)
Centralized configuration for all supported languages:

```typescript
export interface LanguageConfig {
  code: string;           // Language code (e.g., 'en', 'ko')
  name: string;           // English name
  nativeName: string;     // Native language name
  flag: string;           // Emoji flag
  direction: 'ltr' | 'rtl'; // Text direction
}
```

#### 2. Middleware (`middleware.ts`)
Handles locale detection and routing:
- Detects user's preferred language from browser settings
- Rewrites URLs to include locale prefix
- Supports all configured languages

#### 3. Translation Files (`locales/*.ts`)
Each language has its own translation file with the same structure:
- `common`: General UI texts
- `auth`: Authentication related
- `menu`: Navigation menus
- `fields`: Form labels
- `placeholders`: Input placeholders
- And more...

## Adding a New Language

### Step 1: Create Translation File
Create a new file in `src/lib/i18n/locales/` (e.g., `ja.ts` for Japanese):

```typescript
export default {
  common: {
    appName: 'エンタープライズアプリ',
    submit: '送信',
    cancel: 'キャンセル',
    // ... copy all keys from en.ts and translate
  },
  auth: {
    login: 'ログイン',
    // ... translate all keys
  },
  // ... translate all sections
} as const;
```

**Important**: Ensure all keys match exactly with the English (`en.ts`) file structure.

### Step 2: Add to Language Configuration
Update `src/lib/i18n/languages.ts`:

```typescript
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  // ... existing languages
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr'
  }
];
```

### Step 3: Register in i18n System
Update both `client.ts` and `server.ts`:

```typescript
// src/lib/i18n/client.ts
export const { useI18n, I18nProviderClient, useCurrentLocale, useChangeLocale } = createI18nClient({
  en: () => import('./locales/en'),
  ko: () => import('./locales/ko'),
  zh: () => import('./locales/zh'),
  vi: () => import('./locales/vi'),
  ja: () => import('./locales/ja')  // Add new language
});

// src/lib/i18n/server.ts
export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } = createI18nServer({
  en: () => import('./locales/en'),
  ko: () => import('./locales/ko'),
  zh: () => import('./locales/zh'),
  vi: () => import('./locales/vi'),
  ja: () => import('./locales/ja')  // Add new language
});
```

### Step 4: Update Middleware
Update `middleware.ts` to include the new locale:

```typescript
const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'ko', 'zh', 'vi', 'ja'],  // Add new locale
  defaultLocale: 'en',
  urlMappingStrategy: 'rewriteDefault'
});
```

### Step 5: Test
1. Restart the development server
2. Navigate to the app
3. Open user menu → Language section
4. The new language should appear automatically with its native name and flag
5. Select it to switch the interface

## Usage in Components

### Client Components
```typescript
'use client';

import { useI18n, useCurrentLocale, useChangeLocale } from '@/lib/i18n/client';

function MyComponent() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>Current language: {locale}</p>
      <button onClick={() => changeLocale('ko')}>
        한국어로 변경
      </button>
    </div>
  );
}
```

### Server Components
```typescript
import { getI18n, getCurrentLocale } from '@/lib/i18n/server';

async function MyServerComponent() {
  const t = await getI18n();
  const locale = await getCurrentLocale();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>Current language: {locale}</p>
    </div>
  );
}
```

### With Parameters
Translations can include parameters using `{variable}` syntax:

```typescript
// In translation file:
{
  grid: {
    totalCount: 'Total {count}'
  }
}

// In component:
t('grid.totalCount', { count: 42 })  // "Total 42"
```

## Language Selector UI

The language selector is automatically populated from `SUPPORTED_LANGUAGES` configuration:
- Location: User menu (top-right avatar dropdown)
- Display: Shows native name with English translation
- Visual: Selected language has checkmark, others show flag emoji
- Behavior: Clicking a language immediately switches the interface

## Translation Keys Structure

### Common Sections
- `common`: Buttons, actions, general UI terms
- `auth`: Login, logout, authentication
- `menu`: Navigation menus
- `header`: Top header items
- `footer`: Footer content
- `grid`: DataGrid related
- `file`: File upload/download
- `editor`: Rich text editor
- `fields`: Form field labels
- `placeholders`: Input field placeholders

### Page-Specific
- `menuManagement`: Menu management page
- `autoLogout`: Auto-logout warning dialog
- And more...

## Best Practices

### 1. Key Naming
- Use camelCase for keys
- Be descriptive but concise
- Group related keys together

### 2. Consistency
- Keep the same structure across all language files
- Use the same parameter names
- Maintain consistent terminology

### 3. Fallbacks
- English (`en`) is the default/fallback language
- Always translate English first, then other languages
- Missing translations will fall back to the key name

### 4. Testing
- Test all new translations in the UI
- Check for text overflow in different languages
- Verify parameter substitution works correctly

### 5. RTL Languages
For right-to-left languages (Arabic, Hebrew, etc.):
- Set `direction: 'rtl'` in language config
- CSS will automatically adjust
- Test layout thoroughly

## Tooling & Maintenance

### Check Missing Translations
```bash
# Compare keys between language files
npm run i18n:check  # (if script is added)
```

### Generate Translation Template
When adding new keys to `en.ts`:
1. Add the key with English translation
2. Add the same key to all other language files
3. Mark with `// TODO: Translate` comment
4. Get translations from native speakers

### Common Issues

**Issue**: Language not appearing in selector
- **Solution**: Check if added to `SUPPORTED_LANGUAGES` in `languages.ts`

**Issue**: Translations not working
- **Solution**: Ensure key structure matches exactly across all files

**Issue**: Page not found after language switch
- **Solution**: Check middleware configuration and locale routing

## Resources
- [next-international Documentation](https://github.com/QuiiBz/next-international)
- [Unicode CLDR](http://cldr.unicode.org/) - Language/locale data
- [Google Translate](https://translate.google.com/) - For initial translations (always verify with native speakers)

## Future Enhancements
1. **Translation Management System**: Web-based UI for managing translations
2. **Automatic Translation**: Integration with translation APIs
3. **Translation Memory**: Reuse previous translations
4. **Locale-Specific Formatting**: Dates, numbers, currencies
5. **Pluralization Rules**: Handle complex plural forms
6. **Context-Based Translations**: Same word, different contexts
