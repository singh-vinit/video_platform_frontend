"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      login(data.token, data.user);
      router.replace(data.user.role === "CREATOR" ? "/dashboard" : "/feed");
    } catch (err: any) {
      toast.error("Signup failed", {
        description: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-syne font-bold text-lg tracking-tight block mb-10">
          STREAMLINE
        </Link>

        <h1 className="font-syne text-3xl font-bold mb-1">Create account</h1>
        <p className="text-zinc-500 text-sm mb-8">Join as a creator or viewer</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              required
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-600 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-600 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              className="bg-zinc-900 border-zinc-800 focus:border-zinc-600 h-11"
            />
          </div>

          {/* Role toggle */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">I am a</Label>
            <div className="grid grid-cols-2 gap-2">
              {["USER", "CREATOR"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`h-11 rounded-md border text-sm font-syne font-semibold transition-all ${
                    form.role === r
                      ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                      : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  {r === "USER" ? "Viewer" : "Creator"}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-zinc-100 hover:bg-white text-zinc-900 font-syne font-semibold"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-100 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}