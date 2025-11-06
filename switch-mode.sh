#!/bin/bash
# ==============================================================================
# Development Mode Switcher
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "======================================"
echo "Development Mode Switcher"
echo "======================================"
echo ""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning ".env.local not found. Creating from template..."
    cp env.api-routes.template .env.local
    print_success "Created .env.local"
fi

echo "Select development mode:"
echo ""
echo "  1) Next.js API Routes (권장)"
echo "     - Frontend: http://localhost:3000"
echo "     - Backend: http://localhost:3000/api/*"
echo "     - Single process"
echo "     - Vercel과 동일한 환경"
echo ""
echo "  2) Express Backend (레거시)"
echo "     - Frontend: http://localhost:3000"
echo "     - Backend: http://localhost:3001/api/*"
echo "     - Two processes"
echo "     - Express 서버 사용"
echo ""
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        print_info "Switching to Next.js API Routes mode..."
        cp env.api-routes.template .env.local
        print_success "Configuration updated"
        echo ""
        print_info "Start development server with:"
        echo "  npm run dev"
        echo ""
        print_info "Access application at:"
        echo "  http://localhost:3000"
        ;;
    2)
        print_info "Switching to Express Backend mode..."
        cp env.express.template .env.local
        print_success "Configuration updated"
        echo ""
        print_info "Start development server with:"
        echo "  npm run dev:express"
        echo ""
        print_info "Access application at:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:3001"
        ;;
    *)
        print_warning "Invalid choice. No changes made."
        exit 1
        ;;
esac

echo ""
print_success "Mode switched successfully!"
