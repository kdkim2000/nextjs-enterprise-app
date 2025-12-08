#!/bin/bash
# Docker 볼륨 백업 스크립트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

echo "Starting volume backup..."

# Docker Compose 프로젝트 이름 확인
PROJECT_NAME="docker"

# 볼륨 목록
VOLUMES=(
    "etcd_data"
    "redis_data"
    "uploads_data"
)

for volume in "${VOLUMES[@]}"; do
    full_volume_name="${PROJECT_NAME}_${volume}"
    backup_file="$BACKUP_DIR/${volume}_${DATE}.tar.gz"

    echo "Backing up $full_volume_name..."

    docker run --rm \
        -v "${full_volume_name}:/source:ro" \
        -v "$BACKUP_DIR:/backup" \
        alpine \
        tar czf "/backup/${volume}_${DATE}.tar.gz" -C /source .

    echo "  -> $backup_file"
done

echo ""
echo "Backup completed!"
echo "Backup location: $BACKUP_DIR"

# 7일 이상 된 백업 삭제
echo ""
echo "Cleaning old backups (older than 7 days)..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Done!"
