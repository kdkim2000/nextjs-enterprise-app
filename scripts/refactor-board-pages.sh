#!/bin/bash

# Board Pages Refactoring Script
# This script refactors write and edit pages to use the new PostFormPage component

set -e

echo "========================================="
echo "Board Pages Refactoring Script"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
WRITE_PAGE="src/app/[locale]/boards/[boardTypeId]/write/page.tsx"
EDIT_PAGE="src/app/[locale]/boards/[boardTypeId]/[postId]/edit/page.tsx"
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"

# Step 1: Create backup directory
echo -e "${YELLOW}Step 1: Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ Backup directory created: $BACKUP_DIR${NC}"
echo ""

# Step 2: Backup existing files
echo -e "${YELLOW}Step 2: Backing up existing files...${NC}"
if [ -f "$WRITE_PAGE" ]; then
  cp "$WRITE_PAGE" "$BACKUP_DIR/write-page.tsx.backup"
  echo -e "${GREEN}✓ Backed up: $WRITE_PAGE${NC}"
else
  echo -e "${RED}✗ File not found: $WRITE_PAGE${NC}"
fi

if [ -f "$EDIT_PAGE" ]; then
  cp "$EDIT_PAGE" "$BACKUP_DIR/edit-page.tsx.backup"
  echo -e "${GREEN}✓ Backed up: $EDIT_PAGE${NC}"
else
  echo -e "${RED}✗ File not found: $EDIT_PAGE${NC}"
fi
echo ""

# Step 3: Refactor write page
echo -e "${YELLOW}Step 3: Refactoring write page...${NC}"
cat > "$WRITE_PAGE" << 'EOF'
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function PostWritePage() {
  const params = useParams();
  const boardTypeId = params.boardTypeId as string;

  return (
    <PostFormPage
      boardTypeId={boardTypeId}
      mode="create"
      basePath="/boards"
    />
  );
}
EOF
echo -e "${GREEN}✓ Write page refactored${NC}"
echo ""

# Step 4: Refactor edit page
echo -e "${YELLOW}Step 4: Refactoring edit page...${NC}"
cat > "$EDIT_PAGE" << 'EOF'
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PostFormPage from '@/components/boards/PostFormPage';

export default function PostEditPage() {
  const params = useParams();
  const boardTypeId = params.boardTypeId as string;
  const postId = params.postId as string;

  return (
    <PostFormPage
      boardTypeId={boardTypeId}
      postId={postId}
      mode="edit"
      basePath="/boards"
    />
  );
}
EOF
echo -e "${GREEN}✓ Edit page refactored${NC}"
echo ""

# Step 5: Summary
echo "========================================="
echo -e "${GREEN}Refactoring Complete!${NC}"
echo "========================================="
echo ""
echo "Summary:"
echo "  - Write page: $WRITE_PAGE"
echo "  - Edit page: $EDIT_PAGE"
echo "  - Backup location: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "  1. Test the refactored pages"
echo "  2. Check for any TypeScript errors"
echo "  3. Run the application and verify functionality"
echo ""
echo "To rollback:"
echo "  cp $BACKUP_DIR/write-page.tsx.backup $WRITE_PAGE"
echo "  cp $BACKUP_DIR/edit-page.tsx.backup $EDIT_PAGE"
echo ""
