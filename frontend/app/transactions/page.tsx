"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  Wallet,
  CalendarDays,
  Trash2,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { getApiUrl } from "@/lib/api";

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
  CreatedAt: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;

  title: string;
  amount: number;
  type: string;
  description?: string;
  date: string;

  category_id?: number;
  user_id?: number;

  category?: Category;
};

export default function PageTransaction() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  // =====================================================
  // FETCH TRANSACTIONS
  // =====================================================

  const fetchTransactions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        getApiUrl("/api/transactions"),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      console.log("Transaction response:", result);

      // =================================================
      // UNAUTHORIZED
      // =================================================

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // =================================================
      // ERROR RESPONSE
      // =================================================

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengambil data transaksi"
        );
      }

      // =================================================
      // RESPONSE DATA
      // =================================================

      const data =
        result.data?.transactions ??
        result.data ??
        result.transactions ??
        [];

      setTransactions(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Fetch transactions error:",
        err
      );

      if (err instanceof TypeError) {
        setError(
          "Tidak dapat terhubung ke backend API. Periksa URL backend dan konfigurasi CORS."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Terjadi kesalahan saat mengambil transaksi."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void fetchTransactions();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fetchTransactions]);

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

  function formatDate(date: string) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(parsedDate);
  }

  // =====================================================
  // FILTER TRANSACTIONS
  // =====================================================

  const availableYears = useMemo(() => {
    const years = transactions
      .map((transaction) => transaction.date?.slice(0, 4))
      .filter((year): year is string => Boolean(year));

    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const keyword = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !keyword ||
        transaction.title
          ?.toLowerCase()
          .includes(keyword) ||
        transaction.description
          ?.toLowerCase()
          .includes(keyword) ||
        transaction.category?.name
          ?.toLowerCase()
          .includes(keyword);

      const normalizedType =
        transaction.type?.toLowerCase();

      const matchesType =
        filterType === "all" ||
        normalizedType ===
          filterType.toLowerCase();

      const dateKey = transaction.date?.slice(0, 7) ?? "";
      const matchesMonth =
        filterMonth === "all" ||
        dateKey.slice(5, 7) === filterMonth;
      const matchesYear =
        filterYear === "all" ||
        dateKey.slice(0, 4) === filterYear;

      return (
        matchesSearch &&
        matchesType &&
        matchesMonth &&
        matchesYear
      );
    });
  }, [
    transactions,
    search,
    filterType,
    filterMonth,
    filterYear,
  ]);

  // =====================================================
  // TOTAL INCOME
  // =====================================================

  const totalIncome = transactions
    .filter(
      (item) =>
        item.type?.toLowerCase() ===
        "income"
    )
    .reduce(
      (total, item) =>
        total + Number(item.amount),
      0
    );

  // =====================================================
  // TOTAL EXPENSE
  // =====================================================

  const totalExpense = transactions
    .filter(
      (item) =>
        item.type?.toLowerCase() ===
        "expense"
    )
    .reduce(
      (total, item) =>
        total + Number(item.amount),
      0
    );

  // =====================================================
  // DELETE TRANSACTION
  // =====================================================

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        getApiUrl(`/api/transactions/${id}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      console.log(
        "Delete transaction response:",
        result
      );

      // =================================================
      // UNAUTHORIZED
      // =================================================

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // =================================================
      // ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menghapus transaksi"
        );
      }

      // =================================================
      // REMOVE FROM UI
      // =================================================

      setTransactions(
        (current) =>
          current.filter(
            (transaction) =>
              transaction.ID !== id
          )
      );
    } catch (err) {
      console.error(
        "Delete transaction error:",
        err
      );

      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert(
          "Gagal menghapus transaksi"
        );
      }
    }
  }

  // =====================================================
  // EDIT TRANSACTION
  // =====================================================

  function handleEdit(id: number) {
    router.push(
      `/transactions/edittransaction?id=${id}`
    );
  }

  // =====================================================
  // ADD TRANSACTION
  // =====================================================

  function handleAddTransaction() {
    router.push(
      "/transactions/tambahtransaction"
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main data-bright-icon-backgrounds className="min-h-screen bg-[#f5f1e8] pb-24 text-[#171717] lg:pb-0">

      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="flex min-h-screen">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Sidebar />

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="min-w-0 flex-1">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="sticky top-0 z-40 border-b border-[#171717]/10 bg-white/95 backdrop-blur-xl lg:relative lg:border-b-2 lg:border-[#171717]">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8 sm:py-5 lg:px-10">

              {/* PAGE TITLE */}

              <div>

                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c5cff]">
                  Finance
                </p>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Transactions
                </h1>

              </div>

              {/* ADD TRANSACTION */}

              <button
                type="button"
                onClick={
                  handleAddTransaction
                }
                className="flex items-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#c8ff00]"
              >

                <Plus size={18} />

                <span className="hidden sm:inline">
                  Add transaction
                </span>

              </button>

            </div>

          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">

              {/* TOTAL TRANSACTIONS */}

              <div className="col-span-2 rounded-[1.5rem] border-[3px] border-[#171717] bg-[#171717] p-5 text-white shadow-[4px_4px_0_#7c5cff] sm:p-6 md:col-span-1 sm:shadow-[5px_5px_0_#7c5cff]">

                <div className="flex items-center justify-between">

                  <p className="text-xs font-black uppercase tracking-widest text-white/50">
                    Transactions
                  </p>

                  <Wallet
                    size={20}
                    className="text-[#c8ff00]"
                  />

                </div>

                <p className="mt-5 text-3xl font-black">
                  {transactions.length}
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Total records
                </p>

              </div>

              {/* INCOME */}

              <div className="rounded-[1.5rem] border-[3px] border-[#171717] bg-[#c8ff00] p-4 shadow-[4px_4px_0_#171717] sm:p-6 sm:shadow-[5px_5px_0_#171717]">

                <div className="flex items-center justify-between">

                  <p className="text-xs font-black uppercase tracking-widest">
                    Income
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">

                    <ArrowUpRight
                      size={19}
                    />

                  </div>

                </div>

                <p className="mt-4 text-base font-black sm:mt-5 sm:text-2xl">
                  {formatRupiah(
                    totalIncome
                  )}
                </p>

                <p className="mt-1 text-xs font-bold opacity-50">
                  Total income
                </p>

              </div>

              {/* EXPENSE */}

              <div className="rounded-[1.5rem] border-[3px] border-[#171717] bg-[#ff6b6b] p-4 shadow-[4px_4px_0_#171717] sm:p-6 sm:shadow-[5px_5px_0_#171717]">

                <div className="flex items-center justify-between">

                  <p className="text-xs font-black uppercase tracking-widest">
                    Expense
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">

                    <ArrowDownRight
                      size={19}
                    />

                  </div>

                </div>

                <p className="mt-4 text-base font-black sm:mt-5 sm:text-2xl">
                  {formatRupiah(
                    totalExpense
                  )}
                </p>

                <p className="mt-1 text-xs font-bold opacity-50">
                  Total expense
                </p>

              </div>

            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="mb-6 rounded-[1.5rem] border-[3px] border-[#171717] bg-white p-4 shadow-[4px_4px_0_#171717] sm:p-5 sm:shadow-[5px_5px_0_#171717]">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                {/* SEARCH */}

                <div className="relative w-full lg:max-w-md">

                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Cari transaksi..."
                    className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                  />

                </div>

                {/* FILTER BUTTONS */}

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <select
                    aria-label="Filter bulan"
                    value={filterMonth}
                    onChange={(event) => setFilterMonth(event.target.value)}
                    className="w-full rounded-xl border-2 border-[#171717] bg-white px-3 py-2 text-xs font-black outline-none sm:w-auto"
                  >
                    <option value="all">Semua bulan</option>
                    <option value="01">Januari</option>
                    <option value="02">Februari</option>
                    <option value="03">Maret</option>
                    <option value="04">April</option>
                    <option value="05">Mei</option>
                    <option value="06">Juni</option>
                    <option value="07">Juli</option>
                    <option value="08">Agustus</option>
                    <option value="09">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>

                  <select
                    aria-label="Filter tahun"
                    value={filterYear}
                    onChange={(event) => setFilterYear(event.target.value)}
                    className="w-full rounded-xl border-2 border-[#171717] bg-white px-3 py-2 text-xs font-black outline-none sm:w-auto"
                  >
                    <option value="all">Semua tahun</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  {/* ALL */}

                  <button
                    type="button"
                    onClick={() =>
                      setFilterType(
                        "all"
                      )
                    }
                    className={`rounded-xl border-2 border-[#171717] px-4 py-2 text-xs font-black transition ${
                      filterType === "all"
                        ? "bg-[#171717] text-white"
                        : "bg-white hover:bg-[#f5f1e8]"
                    }`}
                  >
                    All
                  </button>

                  {/* INCOME */}

                  <button
                    type="button"
                    onClick={() =>
                      setFilterType(
                        "income"
                      )
                    }
                    className={`rounded-xl border-2 border-[#171717] px-4 py-2 text-xs font-black transition ${
                      filterType === "income"
                        ? "bg-[#c8ff00]"
                        : "bg-white hover:bg-[#f5f1e8]"
                    }`}
                  >
                    Income
                  </button>

                  {/* EXPENSE */}

                  <button
                    type="button"
                    onClick={() =>
                      setFilterType(
                        "expense"
                      )
                    }
                    className={`rounded-xl border-2 border-[#171717] px-4 py-2 text-xs font-black transition ${
                      filterType === "expense"
                        ? "bg-[#ff6b6b]"
                        : "bg-white hover:bg-[#f5f1e8]"
                    }`}
                  >
                    Expense
                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                TRANSACTION LIST
            ================================================= */}

            <div className="rounded-[1.5rem] border-[3px] border-[#171717] bg-white p-4 shadow-[4px_4px_0_#171717] sm:p-6 sm:shadow-[5px_5px_0_#171717]">

              {/* HEADER LIST */}

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                    Activity
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    All transactions
                  </h2>

                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">

                  <CalendarDays
                    size={15}
                  />

                  {filteredTransactions.length}{" "}
                  results

                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (

                <div className="mb-5 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-bold">

                  {error}

                  <button
                    type="button"
                    onClick={
                      fetchTransactions
                    }
                    className="ml-3 underline"
                  >
                    Coba lagi
                  </button>

                </div>

              )}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (

                <div className="flex min-h-[250px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#171717]/20 border-t-[#7c5cff]" />

                    <p className="mt-4 text-sm font-bold text-gray-400">
                      Loading transactions...
                    </p>

                  </div>

                </div>

              )}

              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading &&
                !error &&
                filteredTransactions.length ===
                  0 && (

                  <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#171717]/20">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#171717] bg-[#c8ff00]">

                      <Wallet
                        size={24}
                      />

                    </div>

                    <h3 className="mt-4 text-lg font-black">
                      No transactions
                      found
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Belum ada transaksi
                      yang sesuai.
                    </p>

                    <button
                      type="button"
                      onClick={
                        handleAddTransaction
                      }
                      className="mt-5 rounded-xl border-2 border-[#171717] bg-[#171717] px-4 py-3 text-xs font-black text-white transition hover:-translate-y-1 hover:shadow-[3px_3px_0_#c8ff00]"
                    >
                      + Add transaction
                    </button>

                  </div>

                )}

              {/* =================================================
                  DATA
              ================================================= */}

              {!loading &&
                filteredTransactions.length >
                  0 && (

                  <div className="space-y-3">

                    {filteredTransactions.map(
                      (transaction) => {

                        const isIncome =
                          transaction.type
                            ?.toLowerCase() ===
                          "income";

                        return (

                          <div
                            key={
                              transaction.ID
                            }
                            className="group flex flex-col gap-4 rounded-2xl border-2 border-[#171717]/10 bg-[#f5f1e8] p-4 transition hover:border-[#171717] hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                          >

                            {/* LEFT */}

                            <div className="flex min-w-0 items-center gap-4">

                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#171717] ${
                                  isIncome
                                    ? "bg-[#c8ff00]"
                                    : "bg-white"
                                }`}
                              >

                                {isIncome ? (
                                  <ArrowUpRight
                                    size={
                                      21
                                    }
                                  />
                                ) : (
                                  <ArrowDownRight
                                    size={
                                      21
                                    }
                                  />
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-black">
                                  {
                                    transaction.title
                                  }
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">

                                  <span>
                                    {transaction
                                      .category
                                      ?.name ||
                                      "Tanpa kategori"}
                                  </span>

                                  <span>
                                    ·
                                  </span>

                                  <span>
                                    {formatDate(
                                      transaction.date
                                    )}
                                  </span>

                                </div>

                                {transaction.description && (

                                  <p className="mt-1 truncate text-xs text-gray-400">
                                    {
                                      transaction.description
                                    }
                                  </p>

                                )}

                              </div>

                            </div>

                            {/* RIGHT */}

                            <div className="flex items-center justify-between gap-4 sm:justify-end">

                              <p
                                className={`text-sm font-black ${
                                  isIncome
                                    ? "text-[#171717]"
                                    : "text-[#ff4f4f]"
                                }`}
                              >

                                {isIncome
                                  ? "+"
                                  : "-"}

                                {formatRupiah(
                                  Math.abs(
                                    Number(
                                      transaction.amount
                                    )
                                  )
                                )}

                              </p>

                              {/* ACTIONS */}

                              <div className="flex gap-2 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100">

                                {/* EDIT */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      transaction.ID
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#171717] bg-white transition hover:bg-[#c8ff00]"
                                  title="Edit"
                                >

                                  <Pencil
                                    size={
                                      15
                                    }
                                  />

                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      transaction.ID
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#171717] bg-white transition hover:bg-[#ff6b6b]"
                                  title="Delete"
                                >

                                  <Trash2
                                    size={
                                      15
                                    }
                                  />

                                </button>

                              </div>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}