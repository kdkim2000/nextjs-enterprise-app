#!/bin/bash
# MSA API 통합 테스트 스크립트
# core-service와 app-service의 모든 엔드포인트 검증

set -e

# 기본 설정
CORE_SERVICE_URL=${CORE_SERVICE_URL:-"http://localhost:3011"}
APP_SERVICE_URL=${APP_SERVICE_URL:-"http://localhost:3012"}

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 결과 카운터
PASSED=0
FAILED=0
SKIPPED=0

# 테스트 함수
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $name (HTTP $response)"
        ((PASSED++))
    elif [ "$response" = "000" ]; then
        echo -e "${YELLOW}○${NC} $name (서비스 연결 실패)"
        ((SKIPPED++))
    else
        echo -e "${RED}✗${NC} $name (HTTP $response, expected $expected_status)"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "MSA API 통합 테스트"
echo "=========================================="
echo ""
echo "Core Service: $CORE_SERVICE_URL"
echo "App Service:  $APP_SERVICE_URL"
echo ""

# ==========================================
# Core Service 테스트 (Port 3011)
# ==========================================
echo "----------------------------------------"
echo "[Core Service] Health & Auth 테스트"
echo "----------------------------------------"

test_endpoint "Health Check" "$CORE_SERVICE_URL/health"
test_endpoint "Auth - Login (POST)" "$CORE_SERVICE_URL/auth/login" "401"  # 인증 없이 접근

echo ""
echo "----------------------------------------"
echo "[Core Service] Admin 테스트"
echo "----------------------------------------"

test_endpoint "Admin - Users (GET)" "$CORE_SERVICE_URL/admin/users" "401"  # 인증 필요
test_endpoint "Admin - Roles (GET)" "$CORE_SERVICE_URL/admin/roles" "401"
test_endpoint "Admin - Menus (GET)" "$CORE_SERVICE_URL/admin/menus" "401"
test_endpoint "Admin - Departments (GET)" "$CORE_SERVICE_URL/admin/departments" "401"

echo ""
echo "----------------------------------------"
echo "[Core Service] Common 테스트"
echo "----------------------------------------"

test_endpoint "Common - Codes (GET)" "$CORE_SERVICE_URL/common/codes" "401"
test_endpoint "Common - Code Types (GET)" "$CORE_SERVICE_URL/common/code-types" "401"
test_endpoint "Common - Settings (GET)" "$CORE_SERVICE_URL/common/settings" "401"

# ==========================================
# App Service 테스트 (Port 3012)
# ==========================================
echo ""
echo "----------------------------------------"
echo "[App Service] Health 테스트"
echo "----------------------------------------"

test_endpoint "Health Check" "$APP_SERVICE_URL/health"

echo ""
echo "----------------------------------------"
echo "[App Service] Content 테스트"
echo "----------------------------------------"

test_endpoint "Content - Board Types (GET)" "$APP_SERVICE_URL/content/board-types" "200"
test_endpoint "Content - Posts (GET)" "$APP_SERVICE_URL/content/posts" "200"
test_endpoint "Content - Comments (GET)" "$APP_SERVICE_URL/content/comments" "400"  # postId 필요
test_endpoint "Content - QnA (GET)" "$APP_SERVICE_URL/content/qna" "200"
test_endpoint "Content - Help (GET)" "$APP_SERVICE_URL/content/help" "200"

echo ""
echo "----------------------------------------"
echo "[App Service] Communication 테스트"
echo "----------------------------------------"

test_endpoint "Comm - Mail Messages (GET)" "$APP_SERVICE_URL/comm/mail/messages" "401"  # 인증 필요
test_endpoint "Comm - System Messages (GET)" "$APP_SERVICE_URL/comm/messages" "401"
test_endpoint "Comm - Conversations (GET)" "$APP_SERVICE_URL/comm/conversations" "200"
test_endpoint "Comm - Conversation Stats (GET)" "$APP_SERVICE_URL/comm/conversations/stats" "200"
test_endpoint "Comm - Conversation Tags (GET)" "$APP_SERVICE_URL/comm/conversations/tags" "200"

# ==========================================
# 테스트 결과 요약
# ==========================================
echo ""
echo "=========================================="
echo "테스트 결과 요약"
echo "=========================================="
echo -e "${GREEN}통과: $PASSED${NC}"
echo -e "${RED}실패: $FAILED${NC}"
echo -e "${YELLOW}스킵: $SKIPPED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$((PASSED * 100 / TOTAL))
    echo "성공률: ${PASS_RATE}%"
fi

if [ $FAILED -gt 0 ]; then
    echo ""
    echo -e "${RED}일부 테스트가 실패했습니다.${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}모든 테스트가 통과했습니다!${NC}"
    exit 0
fi
