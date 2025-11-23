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
