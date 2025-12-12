# ⚠️ DEPRECATED

이 서비스는 **더 이상 사용되지 않습니다**.

## 마이그레이션 정보

- **마이그레이션 날짜**: 2025-12-12
- **대체 서비스**: `core-service`
- **기존 포트**: 3015
- **새 포트**: 3011 (core-service로 통합)

## 변경 사항

`common-service`의 모든 기능이 `core-service`로 통합되었습니다.

### API 경로 변경

| 기존 경로 | 새 경로 | 비고 |
|-----------|---------|------|
| `/common/codes` | `/common/codes` | 동일 |
| `/common/code-types` | `/common/code-types` | 동일 |
| `/common/settings` | `/common/settings` | 동일 |
| `/common/attachments` | `/common/attachments` | 동일 |

### 대체 서비스 사용

```bash
# 기존
curl http://localhost:3015/common/codes

# 새 서비스
curl http://localhost:3011/common/codes
```

## 삭제 예정

이 폴더는 마이그레이션 검증 후 삭제될 예정입니다.

---

> **참고**: 새 서비스 구조는 `docs/msa-deployment-guide.md` 문서를 참조하세요.
