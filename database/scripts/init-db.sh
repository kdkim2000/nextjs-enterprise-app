#!/bin/bash
# DB 초기화 스크립트 (스키마 + 필수 데이터)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 기본값
DB_TYPE="${DB_TYPE:-postgres}"
INCLUDE_SAMPLE="${INCLUDE_SAMPLE:-false}"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  DB Initialization Script${NC}"
echo -e "${GREEN}==================================${NC}"

# 환경변수 확인
check_env() {
    if [ -z "$DB_HOST" ]; then
        echo -e "${YELLOW}Warning: DB_HOST not set, using 'localhost'${NC}"
        export DB_HOST="localhost"
    fi

    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${RED}Error: DB_PASSWORD is required${NC}"
        exit 1
    fi

    echo -e "${GREEN}DB Configuration:${NC}"
    echo "  Type: $DB_TYPE"
    echo "  Host: $DB_HOST"
    echo "  Port: ${DB_PORT:-5432}"
    echo "  Database: ${DB_NAME:-corenextdb}"
    echo "  User: ${DB_USER:-corenext}"
}

# Liquibase 실행
run_liquibase() {
    local properties_file="liquibase-${DB_TYPE}.properties"

    echo -e "\n${GREEN}Running Liquibase migration...${NC}"

    cd "$DATABASE_DIR"

    if command -v liquibase &> /dev/null; then
        # 로컬 Liquibase
        liquibase --defaults-file="$properties_file" update
    elif command -v docker &> /dev/null; then
        # Docker Liquibase
        docker run --rm \
            -v "$DATABASE_DIR:/liquibase/changelog" \
            -e DB_HOST="$DB_HOST" \
            -e DB_PORT="${DB_PORT:-5432}" \
            -e DB_NAME="${DB_NAME:-corenextdb}" \
            -e DB_USER="${DB_USER:-corenext}" \
            -e DB_PASSWORD="$DB_PASSWORD" \
            --network host \
            liquibase/liquibase \
            --defaults-file="/liquibase/changelog/$properties_file" \
            update
    else
        echo -e "${RED}Error: Neither liquibase nor docker is installed${NC}"
        exit 1
    fi

    echo -e "${GREEN}Migration completed successfully!${NC}"
}

# Seed 데이터 적재
run_seed() {
    local seed_type="$1"
    local seed_dir="$DATABASE_DIR/seed/$seed_type"

    if [ ! -d "$seed_dir" ]; then
        echo -e "${YELLOW}Warning: Seed directory not found: $seed_dir${NC}"
        return
    fi

    echo -e "\n${GREEN}Loading $seed_type seed data...${NC}"

    for sql_file in "$seed_dir"/*.sql; do
        if [ -f "$sql_file" ]; then
            echo "  Executing: $(basename "$sql_file")"

            if [ "$DB_TYPE" = "postgres" ]; then
                PGPASSWORD="$DB_PASSWORD" psql \
                    -h "${DB_HOST:-localhost}" \
                    -p "${DB_PORT:-5432}" \
                    -U "${DB_USER:-corenext}" \
                    -d "${DB_NAME:-corenextdb}" \
                    -f "$sql_file" \
                    -q
            elif [ "$DB_TYPE" = "oracle" ]; then
                echo "exit" | sqlplus -s \
                    "${DB_USER}/${DB_PASSWORD}@//${DB_HOST}:${DB_PORT:-1521}/${DB_SERVICE:-ORCL}" \
                    @"$sql_file"
            fi
        fi
    done

    echo -e "${GREEN}$seed_type seed data loaded!${NC}"
}

# 메인 실행
main() {
    check_env

    # 1. 스키마 마이그레이션
    run_liquibase

    # 2. 필수 데이터 적재
    run_seed "required"

    # 3. 샘플 데이터 적재 (옵션)
    if [ "$INCLUDE_SAMPLE" = "true" ]; then
        run_seed "sample"
    fi

    echo -e "\n${GREEN}==================================${NC}"
    echo -e "${GREEN}  DB Initialization Complete!${NC}"
    echo -e "${GREEN}==================================${NC}"
}

# 사용법 출력
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --type TYPE     Database type: postgres (default) or oracle"
    echo "  -s, --sample        Include sample data"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DB_HOST             Database host (default: localhost)"
    echo "  DB_PORT             Database port (default: 5432 for postgres, 1521 for oracle)"
    echo "  DB_NAME             Database name (default: corenextdb)"
    echo "  DB_USER             Database user (default: corenext)"
    echo "  DB_PASSWORD         Database password (required)"
    echo "  DB_SERVICE          Oracle service name (default: ORCL)"
}

# 인자 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            DB_TYPE="$2"
            shift 2
            ;;
        -s|--sample)
            INCLUDE_SAMPLE="true"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

main
