#!/bin/bash
# DB 마이그레이션 상태 확인 스크립트
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 기본값
DB_TYPE="${DB_TYPE:-postgres}"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  DB Migration Status${NC}"
echo -e "${GREEN}==================================${NC}"

cd "$DATABASE_DIR"

if command -v liquibase &> /dev/null; then
    liquibase --defaults-file="liquibase-${DB_TYPE}.properties" status
elif command -v docker &> /dev/null; then
    docker run --rm \
        -v "$DATABASE_DIR:/liquibase/changelog" \
        -e DB_HOST="${DB_HOST:-localhost}" \
        -e DB_PORT="${DB_PORT:-5432}" \
        -e DB_NAME="${DB_NAME:-corenextdb}" \
        -e DB_USER="${DB_USER:-corenext}" \
        -e DB_PASSWORD="$DB_PASSWORD" \
        --network host \
        liquibase/liquibase \
        --defaults-file="/liquibase/changelog/liquibase-${DB_TYPE}.properties" \
        status
else
    echo -e "${YELLOW}Warning: Neither liquibase nor docker is installed${NC}"
    exit 1
fi
