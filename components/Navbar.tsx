"use client";
import Link from "next/link";
import type React from "react";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data } = useSession();
  const user = data?.user as any | undefined;
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ name?: string; email?: string; avatarUrl?: string } | null>(null);
  const pathname = usePathname();
  const hideOnReport = pathname?.startsWith("/report");

  async function fetchProfile() {
    try {
      const res = await fetch("/api/account", { cache: "no-store", credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.user) setProfile({ name: data.user.name, email: data.user.email, avatarUrl: data.user.avatarUrl });
    } catch {}
  }

  useEffect(() => {
    if (user && !profile) {
      fetchProfile();
    }
    // listen for account updates across the app
    const onUpdated = () => fetchProfile();
    window.addEventListener("nk-profile-updated" as any, onUpdated as any);
    return () => window.removeEventListener("nk-profile-updated" as any, onUpdated as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm px-3 py-1.5 rounded ${
          active ? "bg-kiwi-light text-green-600" : "hover:bg-green-50"
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    // Keep hooks order consistent; decide to render or not here
    hideOnReport ? null : (
    <header className="bg-[#f0f5ec] top-0 z-50 absolute w-full">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" width={36} height={36} alt="nineKiwi_logo" />
          <span className="text-xl font-heading font-bold text-kiwi-dark">
            nine<span className="text-green-600">kiwi</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {/* Profile + Main Menu dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500 hover:bg-green-50"
              onClick={async () => {
                if (!profile && user) {
                  try {
                    const res = await fetch("/api/account", { cache: "no-store", credentials: "include" });
                    if (res.ok) {
                      const data = await res.json();
                      setProfile({ name: data?.user?.name, email: data?.user?.email, avatarUrl: data?.user?.avatarUrl });
                    }
                  } catch {}
                }
                setMenuOpen((o) => !o);
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {/* avatar */}
              <span className="inline-flex h-8 w-8 rounded-full overflow-hidden bg-kiwi-light border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {profile?.avatarUrl || (user as any)?.image ? (
                  <img src={(profile?.avatarUrl || (user as any)?.image) as string} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="h-full w-full grid place-items-center text-kiwi-dark text-sm">
                    {(user?.name || "U").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="text-sm text-green-600">{user ? `Hi, ${profile?.name || user.name}` : "Menu"}</span>
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border rounded-xl shadow-lg z-50 py-2">
                {user ? (
                  <div className="px-3 pb-2 border-b">
                    <div className="flex items-center gap-2 py-2">
                      <span className="inline-flex h-9 w-9 rounded-full overflow-hidden bg-kiwi-light border">
                        {profile?.avatarUrl || (user as any)?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(profile?.avatarUrl || (user as any)?.image) as string} alt="avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="h-full w-full grid place-items-center text-green-600 text-sm">
                            {(user?.name || "U").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-green-600 truncate">{profile?.name || user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{profile?.email || user.email}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="py-1">
                  <Link href="/account" className="block px-4 py-2 text-sm hover:bg-kiwi-light">Account</Link>
                  <Link href="/pay" className="block px-4 py-2 text-sm hover:bg-kiwi-light">NineKiwi Payments</Link>
                  <Link href="/early-access" className="block px-4 py-2 text-sm hover:bg-kiwi-light">Get Early Access</Link>
                  <Link href="/report" className="block px-4 py-2 text-sm hover:bg-kiwi-light">Report Tool</Link>
                  {user?.role === "admin" && (
                    <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-kiwi-light">Admin Dashboard</Link>
                  )}
                </div>
                <div className="border-t">
                  {!user ? (
                    <div className="py-1">
                      <Link href="/login" className="block px-4 py-2 text-sm hover:bg-kiwi-light">Login</Link>
                      <Link href="/signup" className="block px-4 py-2 text-sm hover:bg-kiwi-light">Sign up</Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-kiwi-light"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className="md:hidden text-green-600 p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          ☰
        </button>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`md:hidden border-t bg-white overflow-hidden transition-all duration-300 ease-out ${
          open
            ? "max-h-[520px] opacity-100 pointer-events-auto"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`container mx-auto px-4 py-3 flex flex-col gap-3 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/account" className="px-4 py-2 rounded border text-sm text-green-600 hover:bg-green-50 w-full text-center">Account</Link>
            <Link href="/pay" className="px-4 py-2 rounded border text-sm text-green-600 hover:bg-green-50 w-full text-center">NineKiwi Payments</Link>
            <Link href="/early-access" className="px-4 py-2 rounded text-green-600 text-white hover:bg-green-800 w-full text-center">Get Early Access</Link>
            <Link href="/report" className="px-4 py-2 rounded border text-sm text-green-600 hover:bg-green-50 w-full text-center">Report Tool</Link>
          </div>

          {!user ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border-2 border-green-500 text-green-700 hover:bg-green-50 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 transition-colors px-4 py-2 text-sm font-semibold w-full"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 transition-colors px-4 py-2 text-sm font-semibold shadow-sm w-full"
              >
                Sign up
              </Link>
              <Link href="/admin/login" className="underline">
                Admin Login
              </Link>
              <Link href="/admin/signup" className="underline">
                Admin Signup
              </Link>
            </>
          ) : (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="px-3 py-2 border rounded">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-2 border rounded text-left hover:bg-green-50"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
    )
  );
}
