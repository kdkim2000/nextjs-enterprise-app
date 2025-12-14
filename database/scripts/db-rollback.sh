#!/bin/bash
# DB 롤백 스크립트
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 기본값
DB_TYPE="${DB_TYPE:-postgres}"
ROLLBACK_COUNT="${1:-1}"

echo -e "${YELLOW}==================================${NC}"
echo -e "${YELLOW}  DB Rollback Script${NC}"
echo -e "${YELLOW}==================================${NC}"
echo -e "${YELLOW}Rolling back $ROLLBACK_COUNT changeset(s)${NC}"
echo ""

read -p "Are you sure you want to rollback? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled."
    exit 0
fi

cd "$DATABASE_DIR"

if command -v liquibase &> /dev/null; then
    liquibase --defaults-file="liquibase-${DB_TYPE}.properties" rollback-count "$ROLLBACK_COUNT"
elif command -v docker &> /dev/null; then
    docker run --rm -it \
        -v "$DATABASE_DIR:/liquibase/changelog" \
        -e DB_HOST="${DB_HOST:-localhost}" \
        -e DB_PORT="${DB_PORT:-5432}" \
        -e DB_NAME="${DB_NAME:-corenextdb}" \
        -e DB_USER="${DB_USER:-corenext}" \
        -e DB_PASSWORD="$DB_PASSWORD" \
        --network host \
        liquibase/liquibase \
        --defaults-file="/liquibase/changelog/liquibase-${DB_TYPE}.properties" \
        rollback-count "$ROLLBACK_COUNT"
else
    echo -e "${RED}Error: Neither liquibase nor docker is installed${NC}"
    exit 1
fi

echo -e "${GREEN}Rollback completed!${NC}"
