# ⚠️ DEPRECATED

이 서비스는 **더 이상 사용되지 않습니다**.

## 마이그레이션 정보

- **마이그레이션 날짜**: 2025-12-12
- **대체 서비스**: `core-service`
- **기존 포트**: 3012
- **새 포트**: 3011 (core-service로 통합)

## 변경 사항

`admin-service`의 모든 기능이 `core-service`로 통합되었습니다.

### API 경로 변경

| 기존 경로 | 새 경로 | 비고 |
|-----------|---------|------|
| `/admin/users` | `/admin/users` | 동일 |
| `/admin/roles` | `/admin/roles` | 동일 |
| `/admin/menus` | `/admin/menus` | 동일 |
| `/admin/departments` | `/admin/departments` | 동일 |

### 대체 서비스 사용

```bash
# 기존
curl http://localhost:3012/admin/users

# 새 서비스
curl http://localhost:3011/admin/users
```

## 삭제 예정

이 폴더는 마이그레이션 검증 후 삭제될 예정입니다.

---

> **참고**: 새 서비스 구조는 `docs/msa-deployment-guide.md` 문서를 참조하세요.
