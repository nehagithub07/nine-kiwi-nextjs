"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      // auto sign-in
      await signIn("credentials", { redirect: false, email, password });
      router.push("/");
    } catch (e: any) {
      setError(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white shadow p-6 rounded-xl space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full border px-4 py-2 rounded flex items-center justify-center gap-2"
        >
          <span>Continue with Google</span>
        </button>
        <div className="text-center text-xs text-gray-400">or</div>
        <div className="space-y-1">
          <label className="text-sm">Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-kiwi-green text-white px-4 py-2 rounded hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
        <div className="text-sm text-center space-y-1">
          <p>Have an account? <a href="/login" className="underline">Login</a></p>
          <p><a href="/forgot" className="underline">Forgot your password?</a></p>
          <p>Are you an admin? <a href="/admin/login" className="underline">Admin Login</a> or <a href="/admin/signup" className="underline">Admin Signup</a></p>
        </div>
      </form>
    </div>
  );
}
