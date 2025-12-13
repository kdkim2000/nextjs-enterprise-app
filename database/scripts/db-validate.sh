#!/bin/bash
# DB 마이그레이션 유효성 검사 스크립트
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 기본값
DB_TYPE="${DB_TYPE:-postgres}"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  DB Migration Validation${NC}"
echo -e "${GREEN}==================================${NC}"

cd "$DATABASE_DIR"

if command -v liquibase &> /dev/null; then
    echo "Validating changelog..."
    liquibase --defaults-file="liquibase-${DB_TYPE}.properties" validate

    echo ""
    echo "Checking for unrun changesets..."
    liquibase --defaults-file="liquibase-${DB_TYPE}.properties" status --verbose

elif command -v docker &> /dev/null; then
    echo "Validating changelog..."
    docker run --rm \
        -v "$DATABASE_DIR:/liquibase/changelog" \
        liquibase/liquibase \
        --defaults-file="/liquibase/changelog/liquibase-${DB_TYPE}.properties" \
        validate
else
    echo -e "${RED}Error: Neither liquibase nor docker is installed${NC}"
    exit 1
fi

echo -e "${GREEN}Validation completed!${NC}"
