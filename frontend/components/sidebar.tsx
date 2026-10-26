"use client";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";
import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { path: "/dashboard", label: "Home", icon: LayoutDashboard },
    { path: "/transactions", label: "Transactions", icon: Wallet },
    { path: "/categories", label: "Categories", icon: CreditCard },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Fragment>
    <aside className="hidden w-[250px] shrink-0 border-r-2 border-[#171717] bg-[#171717] p-5 text-white lg:flex lg:flex-col">

      {/* LOGO */}
      <div className="mb-12 flex items-center gap-3">
        <div className="flex h-11 w-11 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] text-xl font-black text-[#171717] shadow-[3px_3px_0_#fff]">
          $
        </div>

        <div>
          <p className="text-sm font-black tracking-tight">
            EXPENSE
          </p>

          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Tracker
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-2">

        {/* DASHBOARD */}
        <button
          onClick={() => router.push("/dashboard")}
          className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-black transition ${
            isActive("/dashboard")
              ? "border-white bg-[#c8ff00] text-[#171717]"
              : "border-transparent text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        {/* TRANSACTIONS */}
        <button
          onClick={() => router.push("/transactions")}
          className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
            pathname.startsWith("/transactions")
              ? "border-white bg-[#c8ff00] text-[#171717]"
              : "border-transparent text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Wallet size={18} />
          Transactions
        </button>

        {/* CATEGORIES */}
        <button
          onClick={() => router.push("/categories")}
          className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
            pathname.startsWith("/categories")
              ? "border-white bg-[#c8ff00] text-[#171717]"
              : "border-transparent text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white"
          }`}
        >
          <CreditCard size={18} />
          Categories
        </button>

        {/* SETTINGS */}
        <button
          onClick={() => router.push("/settings")}
          className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
            pathname.startsWith("/settings")
              ? "border-white bg-[#c8ff00] text-[#171717]"
              : "border-transparent text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings size={18} />
          Settings
        </button>

      </nav>

      {/* BOTTOM */}
      <div className="mt-auto">

        {/* MONTHLY BUDGET */}
        <div className="mb-5 rounded-2xl border-2 border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Monthly budget
          </p>

          <p className="mt-2 text-2xl font-black">
            Rp 2.7M
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[68%] rounded-full bg-[#c8ff00]" />
          </div>

          <p className="mt-2 text-xs text-white/40">
            68% used this month
          </p>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          data-logout="sidebar"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ff6b6b] hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </aside>
    <nav
      data-mobile-nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t-2 border-[#171717] bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_14px_rgba(0,0,0,0.12)] lg:hidden"
    >
      {navigationItems.map(({ path, label, icon: Icon }) => {
        const active = path === "/dashboard"
          ? isActive(path)
          : pathname.startsWith(path);

        return (
          <button
            key={path}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => router.push(path)}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-bold ${
              active
                ? "bg-[#c8ff00] text-[#171717]"
                : "text-gray-500"
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
    </Fragment>
  );
}