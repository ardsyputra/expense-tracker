"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  LogOut,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";

type Category = {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  name: string;
  type: string;
  user_id: number;
};

type Transaction = {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;

  title?: string;
  description?: string;
  amount: number;
  type: string;

  category?: Category | null;
  category_id?: number;

  user_id?: number;
};

type DashboardSummary = {
  total_income: number;
  total_expense: number;
  balance: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [showProfile, setShowProfile] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH TRANSACTIONS
  // =====================================================

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8081/api/transactions",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const summaryResponse = await fetch(
          "http://localhost:8081/api/dashboard/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();
        const summaryResult = await summaryResponse.json();

        if (response.status === 401 || summaryResponse.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok || !summaryResponse.ok) {
          throw new Error(
            result.message || summaryResult.message ||
              "Gagal mengambil data transaksi"
          );
        }

        const data = Array.isArray(result.data)
          ? result.data
          : [];

        setTransactions(data);
        setSummary(summaryResult.data);
      } catch (err) {
        console.error(
          "Fetch transactions error:",
          err
        );

        if (err instanceof TypeError) {
          setError(
            "Gagal terhubung ke backend. Pastikan Docker backend berjalan."
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal mengambil transaksi");
        }
      } finally {
        setLoadingTransactions(false);
      }
    }

    fetchTransactions();
  }, [router]);

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date?: string) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  }

  // =====================================================
  // CHECK TRANSACTION TYPE
  // =====================================================

  function isIncome(transaction: Transaction) {
    return (
      transaction.type?.toLowerCase() === "income"
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  // =====================================================
  // CALCULATE DATA
  // =====================================================

  const totalIncome = summary.total_income;
  const totalExpense = summary.total_expense;
  const totalBalance = summary.balance;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#171717]">

      {/* MOBILE HEADER */}
      <header className="flex items-center justify-between border-b-2 border-[#171717] bg-white px-5 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] font-black shadow-[3px_3px_0_#171717]">
            $
          </div>

          <span className="font-black tracking-tight">
            EXPENSE
          </span>
        </div>

        <button
          onClick={() => setShowProfile(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#171717] bg-[#7c5cff] text-sm font-black text-white"
        >
          AP
        </button>
      </header>

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <section className="relative flex-1 overflow-hidden">

          {/* DECORATION */}
          <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-52 w-52 rounded-full bg-[#c8ff00]" />

          <div className="pointer-events-none absolute bottom-[-90px] right-[15%] h-52 w-52 rounded-full border-[20px] border-[#7c5cff]" />

          <div className="relative mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">

            {/* TOP BAR */}
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#7c5cff]">
                  Wednesday · August 5, 2026
                </p>

                <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                  Hey, Ardiansyah
                  <span className="ml-2">✦</span>
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Let&apos;s see how your money is doing.
                </p>
              </div>

              <div className="hidden items-center gap-3 sm:flex">

                <button className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#171717] bg-white transition hover:-translate-y-1 hover:shadow-[3px_3px_0_#c8ff00]">
                  <Bell size={18} />
                </button>

                <button
                  onClick={() =>
                    setShowProfile(true)
                  }
                  className="flex items-center gap-3 rounded-xl border-2 border-[#171717] bg-white px-3 py-2 transition hover:-translate-y-1 hover:shadow-[3px_3px_0_#7c5cff]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c5cff] text-xs font-black text-white">
                    AP
                  </div>

                  <div className="text-left">
                    <p className="text-xs font-black">
                      Ardiansyah
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Personal
                    </p>
                  </div>

                  <ChevronDown size={15} />
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-2xl border-[3px] border-[#171717] bg-[#ff6b6b] p-4 text-sm font-bold">
                {error}
              </div>
            )}

            {/* BALANCE */}
            <div className="mb-6 grid gap-5 lg:grid-cols-[1.5fr_1fr_1fr]">

              <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-[#171717] bg-[#171717] p-7 text-white shadow-[7px_7px_0_#7c5cff]">

                <div className="absolute right-[-30px] top-[-40px] h-32 w-32 rounded-full bg-[#c8ff00]" />

                <div className="relative">

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
                      Total balance
                    </p>

                    <Wallet
                      size={20}
                      className="text-[#c8ff00]"
                    />
                  </div>

                  <p className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                    {formatRupiah(totalBalance)}
                  </p>

                  <div className="mt-7 flex items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-[#c8ff00] px-2 py-1 text-[#171717]">
                      LIVE
                    </span>

                    <span className="text-white/40">
                      calculated from transactions
                    </span>
                  </div>

                </div>
              </div>

              {/* INCOME */}
              <div className="rounded-[2rem] border-[3px] border-[#171717] bg-[#c8ff00] p-6 shadow-[5px_5px_0_#171717]">

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">
                    <ArrowUpRight size={19} />
                  </div>

                  <span className="text-xs font-black uppercase tracking-widest">
                    Income
                  </span>

                </div>

                <p className="mt-7 text-2xl font-black tracking-tight">
                  {formatRupiah(totalIncome)}
                </p>

                <p className="mt-1 text-xs font-bold opacity-50">
                  From transactions
                </p>

              </div>

              {/* EXPENSE */}
              <div className="rounded-[2rem] border-[3px] border-[#171717] bg-[#ff6b6b] p-6 shadow-[5px_5px_0_#171717]">

                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">
                    <ArrowDownRight size={19} />
                  </div>

                  <span className="text-xs font-black uppercase tracking-widest">
                    Expense
                  </span>

                </div>

                <p className="mt-7 text-2xl font-black tracking-tight">
                  {formatRupiah(totalExpense)}
                </p>

                <p className="mt-1 text-xs font-bold opacity-50">
                  From transactions
                </p>

              </div>

            </div>

            {/* CONTENT GRID */}
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

              {/* TRANSACTIONS */}
              <div className="rounded-[2rem] border-[3px] border-[#171717] bg-white p-6 shadow-[5px_5px_0_#171717]">

                <div className="mb-6 flex items-center justify-between">

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                      Activity
                    </p>

                    <h2 className="mt-1 text-2xl font-black tracking-tight">
                      Recent transactions
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      router.push("/transactions")
                    }
                    className="text-xs font-black underline decoration-2 underline-offset-4"
                  >
                    View all
                  </button>

                </div>

                {/* LOADING */}
                {loadingTransactions && (
                  <div className="rounded-2xl border-2 border-[#171717]/10 bg-[#f5f1e8] p-6 text-center">
                    <p className="text-sm font-bold text-gray-500">
                      Loading transactions...
                    </p>
                  </div>
                )}

                {/* EMPTY */}
                {!loadingTransactions &&
                  transactions.length === 0 &&
                  !error && (
                    <div className="rounded-2xl border-2 border-dashed border-[#171717]/20 bg-[#f5f1e8] p-8 text-center">

                      <Wallet
                        size={32}
                        className="mx-auto mb-3 text-gray-400"
                      />

                      <p className="text-sm font-black">
                        Belum ada transaksi
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Tambahkan transaksi pertama kamu.
                      </p>

                    </div>
                  )}

                {/* LIST */}
                {!loadingTransactions &&
                  transactions.length > 0 && (
                    <div className="space-y-3">

                      {transactions
                        .slice(0, 5)
                        .map((transaction) => {

                          const income =
                            isIncome(transaction);

                          return (
                            <div
                              key={transaction.ID}
                              className="group flex items-center justify-between rounded-2xl border-2 border-[#171717]/10 bg-[#f5f1e8] p-4 transition hover:border-[#171717] hover:bg-white"
                            >

                              <div className="flex items-center gap-4">

                                <div
                                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#171717] ${
                                    income
                                      ? "bg-[#c8ff00]"
                                      : "bg-white"
                                  }`}
                                >
                                  {income ? (
                                    <ArrowUpRight size={20} />
                                  ) : (
                                    <ArrowDownRight size={20} />
                                  )}
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-black">
                                    {transaction.title ||
                                      transaction.description ||
                                      "Transaction"}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-400">
                                    {transaction.category?.name ||
                                      "Uncategorized"}{" "}
                                    ·{" "}
                                    {formatDate(
                                      transaction.CreatedAt
                                    )}
                                  </p>

                                </div>
                              </div>

                              <p
                                className={`ml-4 shrink-0 text-sm font-black ${
                                  income
                                    ? "text-[#171717]"
                                    : "text-[#ff4f4f]"
                                }`}
                              >
                                {income ? "+" : "-"}
                                {formatRupiah(
                                  Math.abs(
                                    Number(
                                      transaction.amount || 0
                                    )
                                  )
                                )}
                              </p>

                            </div>
                          );
                        })}

                    </div>
                  )}

              </div>

              {/* QUICK ADD */}
              <div className="rounded-[2rem] border-[3px] border-[#171717] bg-[#7c5cff] p-6 text-white shadow-[5px_5px_0_#171717]">

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/50">
                      Quick action
                    </p>

                    <h2 className="mt-2 text-3xl font-black leading-none tracking-tight">
                      Add
                      <br />
                      transaction.
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] text-[#171717]">
                    <Plus size={22} />
                  </div>

                </div>

                <p className="mt-6 text-sm leading-6 text-white/60">
                  Catat pemasukan atau pengeluaran baru sebelum lupa.
                </p>

                <button
                  onClick={() =>
                    router.push(
                      "/transactions/tambahtransaction"
                    )
                  }
                  className="mt-8 w-full rounded-xl border-2 border-[#171717] bg-white px-4 py-3 text-sm font-black text-[#171717] transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#c8ff00]"
                >
                  + Add transaction
                </button>

              </div>

            </div>

            {/* BUDGET */}
            <div className="mt-6 rounded-[2rem] border-[3px] border-[#171717] bg-[#c8ff00] p-6 shadow-[5px_5px_0_#171717]">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Monthly budget
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    You&apos;re doing pretty good ✦
                  </h2>

                  <p className="mt-1 text-sm font-medium opacity-60">
                    {formatRupiah(totalExpense)} spent
                  </p>
                </div>

                <div className="min-w-[220px]">

                  <div className="mb-2 flex justify-between text-xs font-black">
                    <span>
                      {totalExpense > 0
                        ? "68%"
                        : "0%"}
                    </span>

                    <span>
                      Monthly budget
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full border-2 border-[#171717] bg-white">
                    <div className="h-full w-[68%] bg-[#7c5cff]" />
                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>
      </div>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/60 p-5 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-[2rem] border-[3px] border-[#171717] bg-white p-7 shadow-[8px_8px_0_#c8ff00]">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#171717] bg-[#7c5cff] text-lg font-black text-white">
                  AP
                </div>

                <h2 className="text-2xl font-black">
                  Ardiansyah
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Personal account
                </p>

              </div>

              <button
                onClick={() =>
                  setShowProfile(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#171717] bg-[#f5f1e8]"
              >
                <X size={16} />
              </button>

            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#171717]"
            >
              <LogOut size={17} />
              Logout
            </button>

          </div>

        </div>
      )}

    </main>
  );
}