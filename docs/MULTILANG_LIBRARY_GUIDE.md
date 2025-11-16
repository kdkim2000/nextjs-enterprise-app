# Multi-Language Library Usage Guide

## 📚 개요

이 가이드는 애플리케이션 전체에서 다국어 필드를 관리하기 위한 공통 라이브러리 사용법을 설명합니다.

**라이브러리 위치:** `src/lib/i18n/multiLang.ts`

---

## 🎯 주요 특징

### ✨ 단일 진실 공급원 (Single Source of Truth)
- 지원 언어는 한 곳(`SUPPORTED_LANGUAGES`)에서만 관리
- 새 언어 추가 시 1곳만 수정하면 전체 애플리케이션에 자동 반영

### 🔒 타입 안정성
- TypeScript로 완전히 타입이 지정됨
- `SupportedLanguage`와 `MultiLangField` 타입으로 컴파일 타임 검증

### 🧩 재사용 가능
- 모든 관리 페이지(codes, departments, users 등)에서 사용 가능
- 일관된 API와 패턴

---

## 📦 주요 타입

### `SupportedLanguage`
```typescript
type SupportedLanguage = 'en' | 'ko' | 'zh' | 'vi';
```
애플리케이션에서 지원하는 언어의 유니온 타입

### `MultiLangField`
```typescript
type MultiLangField = Record<SupportedLanguage, string>;
// 예: { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' }
```
모든 지원 언어에 대한 값을 포함하는 객체

---

## 🔧 핵심 함수

### 1. 빈 필드 생성

#### `createEmptyMultiLangField()`
빈 다국어 필드 객체 생성
```typescript
const emptyName = createEmptyMultiLangField();
// 결과: { en: '', ko: '', zh: '', vi: '' }
```

#### `createEmptyMultiLangFormFields()`
빈 name과 description 필드를 플랫 형식으로 생성
```typescript
const emptyFields = createEmptyMultiLangFormFields();
// 결과: {
//   nameEn: '', nameKo: '', nameZh: '', nameVi: '',
//   descriptionEn: '', descriptionKo: '', descriptionZh: '', descriptionVi: ''
// }
```

### 2. 데이터 변환

#### `multiLangFieldsToFormData(name, description)`
DB 형식(중첩) → 폼 형식(플랫)
```typescript
const name = { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' };
const desc = { en: 'World', ko: '세계', zh: '世界', vi: 'Thế giới' };

const formData = multiLangFieldsToFormData(name, desc);
// 결과: {
//   nameEn: 'Hello', nameKo: '안녕', nameZh: '你好', nameVi: 'Xin chào',
//   descriptionEn: 'World', descriptionKo: '세계', descriptionZh: '世界', descriptionVi: 'Thế giới'
// }
```

#### `formDataToMultiLangFields(formData)`
폼 형식(플랫) → DB 형식(중첩)
```typescript
const formData = {
  nameEn: 'Hello', nameKo: '안녕', nameZh: '你好', nameVi: 'Xin chào',
  descriptionEn: 'World', descriptionKo: '세계', ...
};

const { name, description } = formDataToMultiLangFields(formData);
// 결과:
// name: { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' }
// description: { en: 'World', ko: '세계', zh: '世界', vi: 'Thế giới' }
```

### 3. 값 접근

#### `getLocalizedValue(multiLangField, locale)`
현재 로케일에 해당하는 값 가져오기 (영어로 자동 폴백)
```typescript
const name = { en: 'Hello', ko: '안녕', zh: '', vi: '' };

getLocalizedValue(name, 'ko');  // '안녕'
getLocalizedValue(name, 'zh');  // 'Hello' (폴백)
```

### 4. 검색

#### `searchMultiLangField(multiLangField, query)`
모든 언어에서 검색어 찾기
```typescript
const name = { en: 'Hello', ko: '안녕', zh: '你好', vi: 'Xin chào' };

searchMultiLangField(name, 'hello');  // true
searchMultiLangField(name, '안녕');    // true
searchMultiLangField(name, 'goodbye'); // false
```

### 5. 유효성 검사

#### `validateMultiLangField(multiLangField, requiredLanguages?)`
필수 언어가 모두 채워졌는지 확인
```typescript
const name = { en: 'Hello', ko: '', zh: '', vi: '' };

validateMultiLangField(name, ['en', 'ko']); // false (ko가 비어있음)
validateMultiLangField(name, ['en']);        // true
```

#### `hasAnyValue(multiLangField)`
최소 하나의 언어에 값이 있는지 확인
```typescript
const name = { en: '', ko: '', zh: '你好', vi: '' };
hasAnyValue(name); // true
```

---

## 💡 실전 사용 예제

### 예제 1: 새 관리 페이지 만들기

#### 1단계: 타입 정의 (`types.ts`)
```typescript
import { MultiLangField } from '@/lib/i18n/multiLang';

export interface Product {
  id: string;
  code: string;
  name: MultiLangField;        // ✅ 공통 타입 사용
  description: MultiLangField;  // ✅ 공통 타입 사용
  price: number;
  status: 'active' | 'inactive';
}
```

#### 2단계: Hook에서 사용 (`hooks/useProductManagement.ts`)
```typescript
import {
  multiLangFieldsToFormData,
  formDataToMultiLangFields,
  createEmptyMultiLangFormFields
} from '@/lib/i18n/multiLang';

// 새 항목 추가
const handleAdd = useCallback(() => {
  setEditingProduct({
    id: '',
    code: '',
    ...createEmptyMultiLangFormFields(),  // ✅ 빈 다국어 필드 자동 생성
    price: 0,
    status: 'active'
  } as any);
  setDialogOpen(true);
}, []);

// 기존 항목 편집
const handleEdit = useCallback((id: string) => {
  const product = products.find(p => p.id === id);
  if (product) {
    const formFields = multiLangFieldsToFormData(
      product.name,
      product.description
    );  // ✅ DB 형식 → 폼 형식

    setEditingProduct({
      id: product.id,
      code: product.code,
      ...formFields,
      price: product.price,
      status: product.status
    } as any);
    setDialogOpen(true);
  }
}, [products]);

// 저장
const handleSave = useCallback(async () => {
  if (!editingProduct) return;

  const { name, description } = formDataToMultiLangFields(editingProduct);
  // ✅ 폼 형식 → DB 형식

  const payload = {
    code: editingProduct.code,
    name,
    description,
    price: editingProduct.price,
    status: editingProduct.status
  };

  await api.post('/product', payload);
}, [editingProduct]);
```

#### 3단계: 페이지에서 사용 (`page.tsx`)
```typescript
import {
  SUPPORTED_LANGUAGES,
  getLocalizedValue,
  searchMultiLangField
} from '@/lib/i18n/multiLang';

// 현재 로케일 값 표시
<Typography>
  {getLocalizedValue(product.name, currentLocale)}
</Typography>

// 검색 필터
const filtered = products.filter(p =>
  searchMultiLangField(p.name, searchQuery)
);
```

---

### 예제 2: 기존 페이지 마이그레이션

#### Before (하드코딩된 방식)
```typescript
// ❌ 문제: 새 언어 추가 시 10+ 곳 수정 필요
const handleAdd = () => {
  setEditing({
    nameEn: '', nameKo: '', nameZh: '', nameVi: '',
    descriptionEn: '', descriptionKo: '', descriptionZh: '', descriptionVi: ''
  });
};

const payload = {
  name: {
    en: editing.nameEn,
    ko: editing.nameKo,
    zh: editing.nameZh,
    vi: editing.nameVi
  },
  description: { ... }  // 동일 패턴 반복
};
```

#### After (공통 라이브러리 사용)
```typescript
// ✅ 해결: 새 언어 추가 시 1곳만 수정
import {
  createEmptyMultiLangFormFields,
  formDataToMultiLangFields
} from '@/lib/i18n/multiLang';

const handleAdd = () => {
  setEditing({
    ...createEmptyMultiLangFormFields()
  });
};

const { name, description } = formDataToMultiLangFields(editing);
const payload = { name, description };
```

---

## 🆕 새 언어 추가하기

### 단계별 가이드

#### 1단계: `multiLang.ts` 수정 (유일한 수정 위치!)
```typescript
// 1. SupportedLanguage 타입에 추가
export type SupportedLanguage = 'en' | 'ko' | 'zh' | 'vi' | 'ja';  // ✅ 'ja' 추가

// 2. SUPPORTED_LANGUAGES 배열에 추가
export const SUPPORTED_LANGUAGES: SupportedLanguage[] =
  ['en', 'ko', 'zh', 'vi', 'ja'];  // ✅ 'ja' 추가

// 3. LANGUAGE_NAMES에 추가
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  ko: '한국어',
  zh: '中文',
  vi: 'Tiếng Việt',
  ja: '日本語'  // ✅ 추가
};

// 4. LANGUAGE_CODES에 추가 (선택사항)
export const LANGUAGE_CODES: Record<string, SupportedLanguage> = {
  // ... 기존 코드
  ja: 'ja',
  'ja-JP': 'ja'  // ✅ 추가
};
```

#### 2단계: 완료!
- ✅ 모든 헬퍼 함수가 자동으로 'ja' 지원
- ✅ `createEmptyMultiLangField()` → `{ ..., ja: '' }`
- ✅ `multiLangFieldsToFormData()` → `{ ..., nameJa: '', descriptionJa: '' }`
- ✅ 모든 변환 함수가 'ja' 처리

#### 3단계: i18n 번역 파일 추가
```typescript
// src/lib/i18n/locales/ja.ts
export default {
  // ... 번역 추가
};
```

---

## 📊 적용된 페이지

### ✅ 이미 적용된 페이지
1. **Codes 관리** (`/admin/codes`)
   - `src/app/[locale]/admin/codes/`

2. **Departments 관리** (`/admin/departments`)
   - `src/app/[locale]/admin/departments/`

### 🔄 적용 가능한 페이지
- Users 관리
- Menus 관리
- Programs 관리
- 기타 다국어 필드가 있는 모든 관리 페이지

---

## 🎨 FormFields 컴포넌트와 통합

### 현재 방식 (수동 필드)
```typescript
// CodeFormFields.tsx
<TextField label="Name (English)" value={code.nameEn} />
<TextField label="Name (Korean)" value={code.nameKo} />
<TextField label="Name (Chinese)" value={code.nameZh} />
<TextField label="Name (Vietnamese)" value={code.nameVi} />
```

### 향후 개선 가능 (동적 필드)
```typescript
// MultiLangTextField 컴포넌트 예제
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/lib/i18n/multiLang';

{SUPPORTED_LANGUAGES.map(lang => (
  <TextField
    key={lang}
    label={`Name (${LANGUAGE_NAMES[lang]})`}
    value={formData[`name${lang.toUpperCase()}`]}
    onChange={(e) => handleChange(`name${lang.toUpperCase()}`, e.target.value)}
  />
))}
```

---

## ⚡ 성능 최적화 팁

### 1. 메모이제이션
```typescript
import { useMemo } from 'react';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

const localizedName = useMemo(
  () => getLocalizedValue(item.name, currentLocale),
  [item.name, currentLocale]
);
```

### 2. 검색 최적화
```typescript
import { searchMultiLangField } from '@/lib/i18n/multiLang';

// ✅ Good: 한 번의 함수 호출로 모든 언어 검색
const filtered = items.filter(item =>
  searchMultiLangField(item.name, query)
);

// ❌ Bad: 각 언어를 개별적으로 체크
const filtered = items.filter(item =>
  item.name.en.includes(query) ||
  item.name.ko.includes(query) ||
  item.name.zh.includes(query) ||
  item.name.vi.includes(query)
);
```

---

## 🐛 트러블슈팅

### Q: "Type error: Property 'nameZh' does not exist"
**A:** FormData 인터페이스가 업데이트되지 않았습니다.
```typescript
// ❌ Bad
interface FormData {
  nameEn: string;
  nameKo: string;
}

// ✅ Good: 공통 라이브러리 사용
import { createEmptyMultiLangFormFields } from '@/lib/i18n/multiLang';
const formData = createEmptyMultiLangFormFields();
```

### Q: "Cannot find module '@/lib/i18n/multiLang'"
**A:** TypeScript 경로 매핑 확인
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Q: 새 언어가 적용되지 않음
**A:** 체크리스트:
1. ✅ `SupportedLanguage` 타입에 추가했나요?
2. ✅ `SUPPORTED_LANGUAGES` 배열에 추가했나요?
3. ✅ TypeScript 서버를 재시작했나요?

---

## 📚 추가 리소스

### 관련 문서
- [I18N_GUIDE.md](./I18N_GUIDE.md) - 전반적인 국제화 가이드
- [TypeScript 공식 문서](https://www.typescriptlang.org/)

### 파일 위치
- **공통 라이브러리:** `src/lib/i18n/multiLang.ts`
- **사용 예제:** `src/app/[locale]/admin/codes/`
- **사용 예제:** `src/app/[locale]/admin/departments/`

---

## 💬 피드백 & 기여

버그 리포트나 기능 제안은 GitHub Issues를 통해 제출해주세요.

---

**마지막 업데이트:** 2025-11-16
**버전:** 1.0.0
