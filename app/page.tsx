"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.role === "CREATOR") router.replace("/dashboard");
    else router.replace("/feed");
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-100 rounded-full animate-spin" />
    </div>
  );
}
