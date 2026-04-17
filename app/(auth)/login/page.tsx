"use client";
import Link from "next/link";
import api from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      router.replace(data.user.role === "CREATOR" ? "/dashboard" : "/feed");
    } catch (err: any) {
      toast.error("Login failed", {
        description: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 border-r border-zinc-800 flex-col justify-between p-12">
        <span className="font-syne font-bold text-xl tracking-tight">
          STREAMLINE
        </span>
        <div>
          <p className="font-syne text-5xl font-bold leading-tight text-zinc-100">
            Create.
            <br />
            Share.
            <br />
            Connect.
          </p>
          <p className="mt-4 text-zinc-500 text-sm">
            A platform for creators and their audiences.
          </p>
        </div>
        <p className="text-zinc-600 text-xs">© 2025 Streamline</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="font-syne text-3xl font-bold mb-1">Welcome back</h1>
          <p className="text-zinc-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-zinc-400 text-xs uppercase tracking-wider"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-600 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-zinc-400 text-xs uppercase tracking-wider"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-600 h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-zinc-500 text-sm">
            No account?{" "}
            <Link href="/signup" className="text-zinc-100 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
