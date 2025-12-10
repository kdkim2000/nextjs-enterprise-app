#!/bin/bash
# 서비스 헬스 체크 스크립트

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 서비스 목록
SERVICES=(
    "nginx:80:/health"
    "apisix:9080:/apisix/status"
    "frontend:3000:/"
    "auth-service:3011:/health"
    "admin-service:3012:/health"
    "content-service:3013:/health"
    "communication-service:3014:/health"
    "common-service:3015:/health"
    "legacy-backend:3001:/health"
)

# 호스트 설정 (Docker 내부 또는 외부)
HOST="${1:-localhost}"

echo "Health Check for $HOST"
echo "========================"
echo ""

all_healthy=true

for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r name port path <<< "$service_info"

    printf "%-25s" "$name:"

    response=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST:$port$path" 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}OK${NC} (HTTP $response)"
    elif [ "$response" = "000" ]; then
        echo -e "${RED}FAILED${NC} (Connection refused)"
        all_healthy=false
    else
        echo -e "${YELLOW}WARNING${NC} (HTTP $response)"
    fi
done

echo ""
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}Some services are not healthy!${NC}"
    exit 1
fi
