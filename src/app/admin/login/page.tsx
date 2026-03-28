"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-[#FDE7E7] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-bold text-2xl text-[#0C0D0F] tracking-tight">
            Body Good<span className="text-[#ED1B1B]">.</span>
          </p>
          <p className="text-[#55575A] text-sm mt-1">Staff Portal</p>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5] shadow-sm p-8">
          <h1 className="font-semibold text-[#0C0D0F] text-xl mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
            Sign in to Admin
          </h1>
          <p className="text-[#55575A] text-sm mb-6">Authorized staff only</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0C0D0F] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#ED1B1B] transition-colors"
                placeholder="you@bodygoodstudio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0C0D0F] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#ED1B1B] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ED1B1B] text-white font-semibold py-2.5 rounded-full text-sm hover:bg-red-700 transition-colors disabled:opacity-60 mt-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#55575A] mt-6">
          Body Good Studio · Internal Use Only
        </p>
      </div>
    </div>
  );
}
