"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import MyProfile from "@/pages/MyProfile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <MyProfile />
    </ProtectedRoute>
  );
}
