#!/bin/bash
# 서버 배포 스크립트
# 사용법: ./deploy.sh [start|stop|restart|build|logs|status]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/infrastructure/docker"

# 환경 변수 파일 확인
check_env() {
    if [ ! -f "$DOCKER_DIR/.env" ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
        if [ -f "$DOCKER_DIR/.env.example" ]; then
            cp "$DOCKER_DIR/.env.example" "$DOCKER_DIR/.env"
            echo -e "${YELLOW}Please edit $DOCKER_DIR/.env with your configuration${NC}"
        else
            echo -e "${RED}Error: .env.example not found${NC}"
            exit 1
        fi
    fi
}

# 빌드
build() {
    echo -e "${GREEN}Building Docker images...${NC}"
    cd "$DOCKER_DIR"
    docker-compose build --no-cache "$@"
    echo -e "${GREEN}Build completed!${NC}"
}

# 시작
start() {
    check_env
    echo -e "${GREEN}Starting services...${NC}"
    cd "$DOCKER_DIR"
    docker-compose up -d "$@"
    echo -e "${GREEN}Services started!${NC}"
    status
}

# 중지
stop() {
    echo -e "${YELLOW}Stopping services...${NC}"
    cd "$DOCKER_DIR"
    docker-compose down "$@"
    echo -e "${GREEN}Services stopped!${NC}"
}

# 재시작
restart() {
    stop
    start "$@"
}

# 로그
logs() {
    cd "$DOCKER_DIR"
    if [ -n "$1" ]; then
        docker-compose logs -f "$@"
    else
        docker-compose logs -f
    fi
}

# 상태 확인
status() {
    echo -e "${GREEN}Service Status:${NC}"
    cd "$DOCKER_DIR"
    docker-compose ps
    echo ""
    echo -e "${GREEN}Health Check:${NC}"

    # Nginx 상태
    echo -n "Nginx: "
    curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "Not responding"
    echo ""

    # APISIX 상태
    echo -n "APISIX: "
    curl -s -o /dev/null -w "%{http_code}" http://localhost:9080/apisix/status 2>/dev/null || echo "Not responding"
    echo ""
}

# 서비스 스케일링
scale() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo -e "${RED}Usage: deploy.sh scale <service> <count>${NC}"
        exit 1
    fi
    cd "$DOCKER_DIR"
    docker-compose up -d --scale "$1=$2"
}

# 특정 서비스만 재시작
restart_service() {
    if [ -z "$1" ]; then
        echo -e "${RED}Usage: deploy.sh restart-service <service>${NC}"
        exit 1
    fi
    cd "$DOCKER_DIR"
    docker-compose restart "$1"
}

# 클린업 (볼륨 포함)
clean() {
    echo -e "${YELLOW}Cleaning up all containers, networks, and volumes...${NC}"
    cd "$DOCKER_DIR"
    docker-compose down -v --remove-orphans
    echo -e "${GREEN}Cleanup completed!${NC}"
}

# 도움말
help() {
    echo "Usage: deploy.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start             Start all services"
    echo "  stop              Stop all services"
    echo "  restart           Restart all services"
    echo "  build             Build Docker images"
    echo "  logs [service]    View logs (optionally for specific service)"
    echo "  status            Show service status"
    echo "  scale <svc> <n>   Scale a service to n instances"
    echo "  restart-service   Restart a specific service"
    echo "  clean             Stop and remove all containers, networks, volumes"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh logs auth-service"
    echo "  ./deploy.sh scale admin-service 3"
    echo "  ./deploy.sh build frontend"
}

# 메인
case "${1:-}" in
    start)
        shift
        start "$@"
        ;;
    stop)
        shift
        stop "$@"
        ;;
    restart)
        shift
        restart "$@"
        ;;
    build)
        shift
        build "$@"
        ;;
    logs)
        shift
        logs "$@"
        ;;
    status)
        status
        ;;
    scale)
        shift
        scale "$@"
        ;;
    restart-service)
        shift
        restart_service "$@"
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        help
        exit 1
        ;;
esac
