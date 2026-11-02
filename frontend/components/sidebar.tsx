"use client";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

type MonthlyBudget = {
  amount: number;
  monthly_expense: number;
  configured: boolean;
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBudget() {
      const token = localStorage.getItem("token");
      if (!token) {
        setBudgetLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl("/api/budget"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal memuat budget.");
        }
        if (active) {
          setMonthlyBudget(result.data);
          setBudgetError("");
        }
      } catch (err) {
        if (active) {
          setBudgetError(
            err instanceof Error ? err.message : "Gagal memuat budget."
          );
        }
      } finally {
        if (active) setBudgetLoading(false);
      }
    }

    void loadBudget();

    return () => {
      active = false;
    };
  }, [pathname]);

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
    <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 border-r-2 border-[#171717] bg-[#171717] p-5 text-white lg:flex lg:flex-col">

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
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[#171717]/10 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-2 backdrop-blur-xl shadow-[0_-8px_24px_rgba(23,23,23,0.10)] transition-all lg:hidden"
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
            className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-bold transition-all duration-200 active:scale-95 ${
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