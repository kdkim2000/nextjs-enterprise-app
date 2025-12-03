#!/bin/bash
# PostgreSQL Database Backup Script
# Usage: ./backup_db.sh

set -e

# Configuration
CONTAINER_NAME="pg16"
DB_USER="corenext"
DB_NAME="corenextdb"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${DATE}.sql.gz"

# Create backup directory if not exists
mkdir -p "${BACKUP_DIR}"

echo "=========================================="
echo "PostgreSQL Backup Script"
echo "=========================================="
echo "Container: ${CONTAINER_NAME}"
echo "Database:  ${DB_NAME}"
echo "Backup to: ${BACKUP_FILE}"
echo "=========================================="

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Error: Container '${CONTAINER_NAME}' is not running"
    exit 1
fi

# Perform backup
echo "⏳ Starting backup..."
docker exec ${CONTAINER_NAME} pg_dump -U ${DB_USER} -d ${DB_NAME} | gzip > "${BACKUP_FILE}"

# Verify backup
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup completed successfully!"
    echo "   File: ${BACKUP_FILE}"
    echo "   Size: ${BACKUP_SIZE}"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Optional: Remove backups older than 7 days
echo ""
echo "🧹 Cleaning old backups (older than 7 days)..."
find "${BACKUP_DIR}" -name "backup_${DB_NAME}_*.sql.gz" -mtime +7 -delete 2>/dev/null || true

echo ""
echo "📁 Current backups:"
ls -lh "${BACKUP_DIR}"/backup_${DB_NAME}_*.sql.gz 2>/dev/null || echo "   No backups found"

echo ""
echo "=========================================="
echo "Done!"
echo "=========================================="
