#!/bin/bash
# DB 초기화 스크립트 (스키마 + 데이터)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 기본값
DB_TYPE="${DB_TYPE:-postgres}"
INCLUDE_SAMPLE="${INCLUDE_SAMPLE:-false}"
INCLUDE_COMM="${INCLUDE_COMM:-false}"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  DB Initialization Script${NC}"
echo -e "${GREEN}==================================${NC}"

check_env() {
    [ -z "$DB_HOST" ] && export DB_HOST="localhost"
    [ -z "$DB_PASSWORD" ] && { echo -e "${RED}Error: DB_PASSWORD required${NC}"; exit 1; }

    if [ "$DB_TYPE" = "oracle" ]; then
        export DB_PORT="${DB_PORT:-1521}"
        export DB_SERVICE="${DB_SERVICE:-ORCL}"
    elif [ "$DB_TYPE" = "mysql" ]; then
        export DB_PORT="${DB_PORT:-3306}"
    else
        export DB_PORT="${DB_PORT:-5432}"
    fi

    echo -e "${GREEN}DB Config: $DB_TYPE @ $DB_HOST:$DB_PORT${NC}"
}

run_postgres() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "${DB_USER:-corenext}" -d "${DB_NAME:-corenextdb}" -f "$1" -q
}

run_oracle() {
    echo "exit" | sqlplus -s "${DB_USER:-corenext}/${DB_PASSWORD}@//${DB_HOST}:${DB_PORT}/${DB_SERVICE}" @"$1"
}

run_mysql() {
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "${DB_USER:-corenext}" -p"$DB_PASSWORD" "${DB_NAME:-corenextdb}" < "$1"
}

main() {
    check_env

    if [ "$DB_TYPE" = "postgres" ]; then
        echo -e "${GREEN}Applying PostgreSQL schema...${NC}"
        run_postgres "$SCRIPT_DIR/original-schema.sql"
        echo -e "${GREEN}Loading master data...${NC}"
        run_postgres "$SCRIPT_DIR/master-data.sql"
        [ "$INCLUDE_SAMPLE" = "true" ] && run_postgres "$SCRIPT_DIR/content-data.sql"
        [ "$INCLUDE_COMM" = "true" ] && run_postgres "$SCRIPT_DIR/comm-data.sql"
    elif [ "$DB_TYPE" = "oracle" ]; then
        echo -e "${GREEN}Applying Oracle schema...${NC}"
        run_oracle "$SCRIPT_DIR/original-schema-oracle.sql"
        [ -f "$SCRIPT_DIR/master-data-oracle.sql" ] && run_oracle "$SCRIPT_DIR/master-data-oracle.sql"
    elif [ "$DB_TYPE" = "mysql" ]; then
        echo -e "${GREEN}Applying MySQL/MariaDB schema...${NC}"
        run_mysql "$SCRIPT_DIR/original-schema-mysql.sql"
        echo -e "${GREEN}Loading data via Node.js script...${NC}"
        cd "$SCRIPT_DIR"
        DATA_OPTS="--master"
        [ "$INCLUDE_SAMPLE" = "true" ] && DATA_OPTS="$DATA_OPTS --content"
        [ "$INCLUDE_COMM" = "true" ] && DATA_OPTS="$DATA_OPTS --comm"
        node load-mysql-data.js $DATA_OPTS
    fi

    echo -e "${GREEN}==================================${NC}"
    echo -e "${GREEN}  DB Initialization Complete!${NC}"
    echo -e "${GREEN}==================================${NC}"
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
  -t, --type TYPE   postgres (default), oracle, or mysql
  -s, --sample      Include content data
  -c, --comm        Include communication data
  -h, --help        Show help

Environment Variables:
  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SERVICE (oracle)

Examples:
  DB_PASSWORD=secret $0 -t postgres -s -c
  DB_PASSWORD=secret DB_SERVICE=ORCL $0 -t oracle
  DB_PASSWORD=secret $0 -t mysql -s -c
EOF
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type) DB_TYPE="$2"; shift 2 ;;
        -s|--sample) INCLUDE_SAMPLE="true"; shift ;;
        -c|--comm) INCLUDE_COMM="true"; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown: $1"; usage; exit 1 ;;
    esac
done

main
