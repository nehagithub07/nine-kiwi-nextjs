"use client";

import { useState, useEffect } from "react";
 
import { useRouter } from "next/navigation";

export default function AdminSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [seedEnabled, setSeedEnabled] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    // If already admin, redirect to dashboard
    (async () => {
      try {
        const res = await fetch("/api/auth/check-admin", { cache: "no-store" });
        if (res.ok) router.replace("/admin/dashboard");
      } catch {}
    })();
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/_debug/seed-admin", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSeedEnabled(Boolean(data?.enabled));
        }
      } catch {}
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, adminKey: adminKey || undefined }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setError(data?.error || "Signup failed");
      } else if ((data?.user?.role as string) === "admin") {
        setInfo("Admin account created. Please login.");
        router.push("/admin/login");
      } else {
        setInfo("Account created as user. Provide a valid Admin Invite Code to create an admin account.");
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const onSeed = async () => {
    setError(null);
    setInfo(null);
    setSeeding(true);
    try {
      const res = await fetch("/api/_debug/seed-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email: email || undefined, password: password || undefined, role: "admin" }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Seeding failed");
        return;
      }
      setInfo("Admin user ready. Please login.");
      router.push("/admin/login");
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white/80">
         
        <h1 className="text-2xl font-semibold mb-4">Create Admin Account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="adminkey">Admin Invite Code</label>
            <input
              id="adminkey"
              type="text"
              className="w-full border rounded px-3 py-2"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Ask your owner for code"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-600">{info}</p>}
          <button
            type="submit"
            className="w-full bg-black text-white rounded py-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        {seedEnabled && (
          <div className="mt-4 border-t pt-4">
            <div className="text-sm text-gray-600 mb-2">Dev-only: Quickly create an admin user for this environment.</div>
            <button
              onClick={onSeed}
              className="w-full bg-gray-900 text-white rounded py-2 disabled:opacity-60"
              disabled={seeding}
            >
              {seeding ? "Creating admin..." : "Create Default Admin"}
            </button>
          </div>
        )}
        <p className="text-sm mt-4">
          Already have an account? <a className="underline" href="/admin/login">Admin login</a>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Not an admin? <a className="underline" href="/signup">User signup</a>
        </p>
      </div>
    </div>
  );
}
