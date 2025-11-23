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
