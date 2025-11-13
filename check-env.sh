#!/bin/bash
# ==============================================================================
# Environment Configuration Checker
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "======================================"
echo "Environment Configuration Checker"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local not found!${NC}"
    echo ""
    echo "This file is required for the application to run."
    echo ""
    echo -e "${BLUE}[FIX] Creating .env.local from Next.js API Routes template...${NC}"
    cp env.api-routes.template .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo ""
    echo -e "${BLUE}ℹ You can now run: npm run dev${NC}"
    echo ""
    exit 0
fi

echo -e "${GREEN}✓ .env.local exists${NC}"
echo ""

# Check NEXT_PUBLIC_API_URL
if grep -q "NEXT_PUBLIC_API_URL=/api" .env.local; then
    echo -e "${GREEN}✓ Mode: Next.js API Routes${NC}"
    echo -e "${BLUE}ℹ API URL: /api${NC}"
    echo -e "${BLUE}ℹ Backend: Next.js API Routes (port 3000)${NC}"
    echo ""
    echo -e "${BLUE}ℹ Start server with:${NC}"
    echo "  npm run dev"
    echo ""
    echo -e "${BLUE}ℹ Access at:${NC}"
    echo "  http://localhost:3000"
elif grep -q "NEXT_PUBLIC_API_URL=http://localhost:3001/api" .env.local; then
    echo -e "${YELLOW}⚠ Mode: Express Backend${NC}"
    echo -e "${BLUE}ℹ API URL: http://localhost:3001/api${NC}"
    echo -e "${BLUE}ℹ Backend: Express (port 3001)${NC}"
    echo ""
    echo -e "${BLUE}ℹ Start server with:${NC}"
    echo "  npm run dev:express"
    echo ""
    echo -e "${BLUE}ℹ Or switch to Next.js API Routes mode:${NC}"
    echo "  ./switch-mode.sh"
    echo ""
    echo -e "${YELLOW}⚠ Make sure Express backend is running on port 3001!${NC}"
else
    echo -e "${RED}✗ Invalid NEXT_PUBLIC_API_URL configuration${NC}"
    echo ""
    echo -e "${BLUE}[FIX] Switching to Next.js API Routes mode...${NC}"
    cp env.api-routes.template .env.local
    echo -e "${GREEN}✓ Configuration fixed${NC}"
    echo ""
    echo -e "${BLUE}ℹ Run: npm run dev${NC}"
fi

echo ""
echo "======================================"
echo "Configuration Check Complete"
echo "======================================"
