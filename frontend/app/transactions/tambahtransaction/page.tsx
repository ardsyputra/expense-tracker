"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

type Category = {
  ID: number;
  name: string;
  type?: string;
  user_id?: number;
};

export default function NewTransactionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  // =====================================================
  // TANGGAL OTOMATIS HARI INI
  // =====================================================

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // GET CATEGORIES
  // =====================================================

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          getApiUrl("/api/categories"),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const result = await response.json();

        console.log("Category response:", result);

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil kategori"
          );
        }

        /*
          Backend bisa mengembalikan:

          {
            success: true,
            data: [...]
          }

          atau:

          {
            success: true,
            data: {
              categories: [...]
            }
          }

          atau langsung array.
        */

        const categoryData =
          result.data?.categories ??
          result.data ??
          result.categories ??
          result;

        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Category error:", err);

        if (err instanceof TypeError) {
          setError(
            "Tidak dapat terhubung ke server. Pastikan backend Go berjalan."
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal mengambil kategori");
        }
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, [router]);

  // =====================================================
  // SUBMIT TRANSACTION
  // =====================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    // =====================================================
    // VALIDASI
    // =====================================================

    if (!title.trim()) {
      setError("Judul transaksi wajib diisi.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Amount harus lebih dari 0.");
      return;
    }

    if (!categoryId) {
      setError("Silakan pilih kategori.");
      return;
    }

    if (!date) {
      setError("Tanggal transaksi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // =====================================================
      // REQUEST BODY
      // =====================================================

      const body = {
        title: title.trim(),
        amount: Number(amount),
        type,
        category_id: Number(categoryId),
        description: description.trim(),
        date,
      };

      console.log("Sending transaction:", body);

      const response = await fetch(
        getApiUrl("/api/transactions"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();

      console.log("Transaction response:", result);

      // =====================================================
      // TOKEN EXPIRED / INVALID
      // =====================================================

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // =====================================================
      // ERROR RESPONSE
      // =====================================================

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal membuat transaksi"
        );
      }

      // =====================================================
      // BERHASIL
      // KEMBALI KE HALAMAN TRANSACTIONS
      // =====================================================

      router.push("/transactions");
      router.refresh();
    } catch (err) {
      console.error(
        "Create transaction error:",
        err
      );

      if (err instanceof TypeError) {
        setError(
          "Tidak dapat terhubung ke server. Pastikan backend Go berjalan."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Terjadi kesalahan saat membuat transaksi."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FORMAT AMOUNT
  // =====================================================

  function handleAmountChange(value: string) {
    // Hanya angka
    const numericValue = value.replace(/\D/g, "");

    setAmount(numericValue);
  }

  function formatPreviewAmount() {
    if (!amount) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-8 text-[#171717]">

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() =>
            router.push("/transactions")
          }
          className="mb-8 flex items-center gap-2 rounded-xl border-2 border-[#171717] bg-white px-4 py-2.5 text-sm font-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#c8ff00]"
        >
          <ArrowLeft size={17} />
          Back to Transactions
        </button>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="overflow-hidden rounded-[2rem] border-[3px] border-[#171717] bg-white shadow-[8px_8px_0_#171717]">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="relative overflow-hidden bg-[#171717] p-7 text-white sm:p-10">

            <div className="absolute right-[-40px] top-[-50px] h-40 w-40 rounded-full bg-[#c8ff00]" />

            <div className="relative">

              <div className="mb-5 flex h-12 w-12 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] text-[#171717] shadow-[3px_3px_0_#fff]">
                <Plus
                  size={22}
                  strokeWidth={3}
                />
              </div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c8ff00]">
                New transaction
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Add transaction
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">
                Catat pemasukan atau pengeluaranmu
                agar kondisi keuangan tetap
                terkontrol.
              </p>

            </div>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="p-7 sm:p-10"
          >

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-[#171717]">

                <X
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>

              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">

              {/* =================================================
                  TITLE
              ================================================= */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Contoh: Makan siang"
                  required
                  className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                />

              </div>

              {/* =================================================
                  AMOUNT
              ================================================= */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) =>
                      handleAmountChange(
                        e.target.value
                      )
                    }
                    placeholder="50000"
                    required
                    className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] py-3.5 pl-11 pr-4 text-sm font-bold outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                  />

                </div>

                <p className="mt-2 text-xs font-bold text-gray-400">
                  {formatPreviewAmount()}
                </p>

              </div>

              {/* =================================================
                  DATE
              ================================================= */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Date
                </label>

                <div className="relative">

                  <CalendarDays
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 pl-11 text-sm font-bold outline-none transition focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                  />

                </div>

              </div>

              {/* =================================================
                  TYPE
              ================================================= */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setType("expense")
                    }
                    className={`rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-black transition ${
                      type === "expense"
                        ? "bg-[#ff6b6b] shadow-[3px_3px_0_#171717]"
                        : "bg-[#f5f1e8] hover:bg-white"
                    }`}
                  >
                    Expense
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setType("income")
                    }
                    className={`rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-black transition ${
                      type === "income"
                        ? "bg-[#c8ff00] shadow-[3px_3px_0_#171717]"
                        : "bg-[#f5f1e8] hover:bg-white"
                    }`}
                  >
                    Income
                  </button>

                </div>

              </div>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value
                    )
                  }
                  required
                  disabled={loadingCategories}
                  className="w-full appearance-none rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-bold outline-none transition focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Pilih kategori"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.ID}
                        value={category.ID}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Description
                </label>

                <div className="relative">

                  <FileText
                    size={17}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Tambahkan catatan jika diperlukan..."
                    rows={4}
                    className="w-full resize-none rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 pl-11 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                PREVIEW
            ================================================= */}

            <div className="mt-8 rounded-2xl border-2 border-[#171717] bg-[#c8ff00] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">
                    <Wallet size={20} />
                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-widest">
                      Transaction preview
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {title ||
                        "Transaction title"}
                    </p>

                  </div>

                </div>

                <p
                  className={`text-lg font-black ${
                    type === "income"
                      ? "text-[#171717]"
                      : "text-[#ff4f4f]"
                  }`}
                >
                  {type === "income"
                    ? "+"
                    : "-"}

                  {formatPreviewAmount()}
                </p>

              </div>

            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  router.push("/transactions")
                }
                disabled={loading}
                className="rounded-xl border-2 border-[#171717] bg-white px-6 py-3.5 text-sm font-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#171717] disabled:opacity-50"
              >
                Cancel
              </button>

              {/* ADD TRANSACTION */}

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingCategories
                }
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#7c5cff] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus size={17} />

                    Add transaction
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}