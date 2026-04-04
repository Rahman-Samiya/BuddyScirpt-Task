"use client";

import GuestRoute from "@/components/GuestRoute";
import Login from "@/pages/Login";

export default function LoginPage() {
  return (
    <GuestRoute>
      <Login />
    </GuestRoute>
  );
}
