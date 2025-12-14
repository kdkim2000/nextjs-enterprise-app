#!/bin/bash
# SQL 생성 스크립트 (실행 전 검토용)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"

# 색상 정의
GREEN='\033[0;32m'
NC='\033[0m'

# 기본값
DB_TYPE="${DB_TYPE:-postgres}"
OUTPUT_FILE="${1:-$DATABASE_DIR/output/migration.sql}"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  Generate Migration SQL${NC}"
echo -e "${GREEN}==================================${NC}"

# 출력 디렉토리 생성
mkdir -p "$(dirname "$OUTPUT_FILE")"

cd "$DATABASE_DIR"

if command -v liquibase &> /dev/null; then
    liquibase --defaults-file="liquibase-${DB_TYPE}.properties" \
        update-sql > "$OUTPUT_FILE"
elif command -v docker &> /dev/null; then
    docker run --rm \
        -v "$DATABASE_DIR:/liquibase/changelog" \
        liquibase/liquibase \
        --defaults-file="/liquibase/changelog/liquibase-${DB_TYPE}.properties" \
        update-sql > "$OUTPUT_FILE"
else
    echo "Error: Neither liquibase nor docker is installed"
    exit 1
fi

echo -e "${GREEN}SQL generated: $OUTPUT_FILE${NC}"
echo "Review this file before running the migration."
