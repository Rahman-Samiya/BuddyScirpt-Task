"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Feed from "@/pages/Feed";

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <Feed />
    </ProtectedRoute>
  );
}
