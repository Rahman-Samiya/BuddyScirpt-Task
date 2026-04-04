"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import PostDetail from "@/pages/PostDetail";

export default function PostDetailPage() {
  return (
    <ProtectedRoute>
      <PostDetail />
    </ProtectedRoute>
  );
}
