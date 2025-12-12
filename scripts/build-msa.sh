#!/bin/bash
# MSA 서비스 빌드 스크립트
# 통합 서비스 (core-service, app-service) 빌드

set -e

echo "=========================================="
echo "MSA 서비스 빌드 시작"
echo "=========================================="

# 프로젝트 루트로 이동
cd "$(dirname "$0")/.."

echo ""
echo "[1/4] Shared 라이브러리 빌드..."
echo "------------------------------------------"
cd shared
npm install
npm run build
cd ..

echo ""
echo "[2/4] Core Service 빌드..."
echo "------------------------------------------"
cd services/core-service
npm install
npm run build
echo "✓ Core Service 빌드 완료"
cd ../..

echo ""
echo "[3/4] App Service 빌드..."
echo "------------------------------------------"
cd services/app-service
npm install
npm run build
echo "✓ App Service 빌드 완료"
cd ../..

echo ""
echo "[4/4] Docker 이미지 빌드..."
echo "------------------------------------------"
cd infrastructure/docker

# Core Service Docker 이미지
echo "Building core-service Docker image..."
docker build -t corenext-core-service:latest \
  -f ../../services/core-service/Dockerfile \
  ../.. || echo "⚠ Core Service Docker 빌드 실패 (Docker 없음 또는 오류)"

# App Service Docker 이미지
echo "Building app-service Docker image..."
docker build -t corenext-app-service:latest \
  -f ../../services/app-service/Dockerfile \
  ../.. || echo "⚠ App Service Docker 빌드 실패 (Docker 없음 또는 오류)"

echo ""
echo "=========================================="
echo "MSA 서비스 빌드 완료!"
echo "=========================================="
echo ""
echo "서비스 목록:"
echo "  - core-service (Port 3011): Auth + Admin + Common"
echo "  - app-service (Port 3012): Content + Communication"
echo ""
echo "다음 단계:"
echo "  1. docker-compose up -d core-service app-service"
echo "  2. 통합 테스트 실행: ./scripts/test-api.sh"
echo ""
