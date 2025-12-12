#!/bin/bash

# MSA 로컬 개발 환경 설정 스크립트
# Usage: ./scripts/setup-local-dev.sh

set -e

echo "========================================="
echo "MSA 로컬 개발 환경 설정 시작"
echo "========================================="

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo ""
echo "[1/5] Shared 라이브러리 의존성 설치..."
cd shared
npm install
cd ..

echo ""
echo "[2/5] Shared 라이브러리 빌드..."
cd shared
npm run build
cd ..

echo ""
echo "[3/5] Core-service 의존성 설치..."
cd services/core-service
npm install
cd ../..

echo ""
echo "[4/5] App-service 의존성 설치..."
cd services/app-service
npm install
cd ../..

echo ""
echo "[5/5] 서비스 빌드 확인..."
echo "  - Core-service 빌드 중..."
cd services/core-service
npm run build
cd ../..

echo "  - App-service 빌드 중..."
cd services/app-service
npm run build
cd ../..

echo ""
echo "========================================="
echo "로컬 개발 환경 설정 완료!"
echo "========================================="
echo ""
echo "사용 가능한 명령어:"
echo "  npm run dev:services  - 모든 MSA 서비스 실행 (core + app)"
echo "  npm run dev:msa       - 프론트엔드 + MSA 서비스 실행"
echo "  npm run dev:core      - Core-service만 실행 (포트 3011)"
echo "  npm run dev:app       - App-service만 실행 (포트 3012)"
echo ""
echo "서비스 포트:"
echo "  - Core-service: http://localhost:3011 (Auth + Admin + Common)"
echo "  - App-service:  http://localhost:3012 (Content + Communication)"
echo ""
