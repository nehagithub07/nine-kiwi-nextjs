"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data } = useSession();
  const user = data?.user as any | undefined;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/report")) return null;

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm px-3 py-1.5 rounded ${active ? "bg-kiwi-light text-kiwi-dark" : "hover:bg-gray-50"}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="bg-white border-b border-kiwi-green/20 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" width={36} height={36} alt="nineKiwi_logo" />
          <span className="text-xl font-heading font-bold text-kiwi-dark">
            nine<span className="text-kiwi-green">kiwi</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/signup">Signup</NavLink>
              <span className="text-gray-400">|</span>
              <NavLink href="/admin/login">Admin Login</NavLink>
              <NavLink href="/admin/signup">Admin Signup</NavLink>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700">Hi, {user.name}</span>
              {user.role === "admin" && (
                <NavLink href="/admin">Admin</NavLink>
              )}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm px-3 py-1 border rounded">
                Logout
              </button>
            </>
          )}
        </div>

        <button className="md:hidden text-kiwi-dark" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          ☰
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {!user ? (
              <>
                <Link href="/login" className="underline">Login</Link>
                <Link href="/signup" className="underline">Signup</Link>
                <Link href="/admin/login" className="underline">Admin Login</Link>
                <Link href="/admin/signup" className="underline">Admin Signup</Link>
              </>
            ) : (
              <>
                {user.role === "admin" && <Link href="/admin" className="px-3 py-2 border rounded">Admin</Link>}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="px-3 py-2 border rounded text-left">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
