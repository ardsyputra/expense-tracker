"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Loader2,
  Pencil,
  Wallet,
  X,
} from "lucide-react";
import Sidebar from "@/components/sidebar";

type Category = {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  name: string;
  type?: string;
  user_id?: number;
};

/*
|--------------------------------------------------------------------------
| BACKEND GO
|--------------------------------------------------------------------------
|
| Backend kamu berjalan di:
| http://localhost:8080
|
*/
const API_URL = "http://localhost:8081";

function EditTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("id");

  // =========================================================
  // FORM STATE
  // =========================================================

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  /*
   * Type sekarang TIDAK diedit langsung.
   *
   * Type akan ditentukan berdasarkan category.
   */
  const [type, setType] = useState<
    "expense" | "income"
  >("expense");

  // =========================================================
  // DATA STATE
  // =========================================================

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(Boolean(transactionId));

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(
    transactionId ? "" : "ID transaksi tidak ditemukan."
  );

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

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
          `${API_URL}/api/categories`,
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

        console.log("CATEGORY RESPONSE:", result);

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil kategori"
          );
        }

        const categoryData =
          result.data?.categories ??
          result.data ??
          result.categories ??
          (Array.isArray(result)
            ? result
            : []);

        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("CATEGORY ERROR:", err);

        if (err instanceof TypeError) {
          setError(
            `Tidak dapat terhubung ke backend Go di ${API_URL}.`
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal mengambil kategori.");
        }
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, [router]);

  // =========================================================
  // FETCH TRANSACTION
  // =========================================================

  useEffect(() => {
    async function fetchTransaction() {
      if (!transactionId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/transactions/${transactionId}`,
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

        console.log(
          "TRANSACTION RESPONSE:",
          result
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil transaksi"
          );
        }

        const transaction =
          result.data?.transaction ??
          result.data ??
          result.transaction ??
          result;

        if (
          !transaction ||
          !transaction.ID
        ) {
          throw new Error(
            "Data transaksi tidak ditemukan."
          );
        }

        console.log(
          "TRANSACTION LOADED:",
          transaction
        );

        // =====================================================
        // TITLE
        // =====================================================

        setTitle(transaction.title ?? "");

        // =====================================================
        // AMOUNT
        // =====================================================

        setAmount(
          transaction.amount !== undefined &&
            transaction.amount !== null
            ? String(transaction.amount)
            : ""
        );

        // =====================================================
        // DESCRIPTION
        // =====================================================

        setDescription(
          transaction.description ?? ""
        );

        // =====================================================
        // CATEGORY
        // =====================================================

        const currentCategoryId =
          transaction.category_id ??
          transaction.category?.ID ??
          "";

        setCategoryId(
          currentCategoryId
            ? String(currentCategoryId)
            : ""
        );

        // =====================================================
        // TYPE
        // =====================================================

        const transactionType =
          String(
            transaction.type ?? "expense"
          ).toLowerCase();

        setType(
          transactionType === "income"
            ? "income"
            : "expense"
        );

        // =====================================================
        // DATE
        // =====================================================

        if (transaction.date) {
          const transactionDate =
            String(transaction.date);

          setDate(
            transactionDate.includes("T")
              ? transactionDate.split("T")[0]
              : transactionDate.substring(
                  0,
                  10
                )
          );
        } else {
          setDate(
            new Date()
              .toISOString()
              .split("T")[0]
          );
        }
      } catch (err) {
        console.error(
          "TRANSACTION ERROR:",
          err
        );

        if (err instanceof TypeError) {
          setError(
            `Tidak dapat terhubung ke backend Go di ${API_URL}. Pastikan server Go sedang berjalan.`
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
    }

    fetchTransaction();
  }, [transactionId, router]);

  // =========================================================
  // SELECTED CATEGORY
  // =========================================================

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) =>
        category.ID === Number(categoryId)
    );
  }, [categories, categoryId]);

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  function handleCategoryChange(
    newCategoryId: string
  ) {
    setCategoryId(newCategoryId);

    const category = categories.find(
      (item) =>
        item.ID === Number(newCategoryId)
    );

    /*
     * Type otomatis mengikuti category.
     */

    if (category?.type) {
      const categoryType =
        category.type.toLowerCase();

      if (categoryType === "income") {
        setType("income");
      } else if (
        categoryType === "expense"
      ) {
        setType("expense");
      }
    }
  }

  // =========================================================
  // AMOUNT
  // =========================================================

  function handleAmountChange(
    value: string
  ) {
    const numericValue =
      value.replace(/\D/g, "");

    setAmount(numericValue);
  }

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  function formatPreviewAmount() {
    if (!amount) {
      return "Rp 0";
    }

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(Number(amount));
  }

  // =========================================================
  // FILTER CATEGORY
  // =========================================================

  /*
   * Semua kategori ditampilkan.
   *
   * Jadi user bisa mengganti:
   *
   * Expense -> Income
   * Income  -> Expense
   *
   * Type otomatis berubah berdasarkan category.
   */

  const filteredCategories = useMemo(() => {
    return categories;
  }, [categories]);

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    // =======================================================
    // VALIDATION
    // =======================================================

    if (!transactionId) {
      setError(
        "ID transaksi tidak ditemukan."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Judul transaksi wajib diisi."
      );
      return;
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      setError(
        "Amount harus lebih dari 0."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Silakan pilih kategori."
      );
      return;
    }

    if (!date) {
      setError(
        "Tanggal transaksi wajib diisi."
      );
      return;
    }

    // =======================================================
    // FIND CATEGORY
    // =======================================================

    const category = categories.find(
      (item) =>
        item.ID === Number(categoryId)
    );

    if (!category) {
      setError(
        "Kategori tidak ditemukan."
      );
      return;
    }

    // =======================================================
    // GET TYPE FROM CATEGORY
    // =======================================================

    let finalType:
      | "expense"
      | "income";

    if (
      category.type?.toLowerCase() ===
      "income"
    ) {
      finalType = "income";
    } else {
      finalType = "expense";
    }

    console.log(
      "CATEGORY SELECTED:",
      category
    );

    console.log(
      "FINAL TYPE:",
      finalType
    );

    // =======================================================
    // TOKEN
    // =======================================================

    const token =
      localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // =======================================================
    // REQUEST BODY
    // =======================================================

    const body = {
      title: title.trim(),

      amount: Number(amount),

      /*
       * Type ditentukan dari kategori.
       */
      type: finalType,

      /*
       * INI YANG PENTING
       */
      category_id: Number(categoryId),

      description:
        description.trim(),

      date: date,
    };

    console.log(
      "UPDATE TRANSACTION BODY:",
      body
    );

    // =======================================================
    // SEND PUT
    // =======================================================

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/transactions/${transactionId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(body),
        }
      );

      const result =
        await response.json();

      console.log(
        "UPDATE RESPONSE:",
        result
      );

      // =====================================================
      // UNAUTHORIZED
      // =====================================================

      if (response.status === 401) {
        localStorage.removeItem(
          "token"
        );

        router.push("/login");

        return;
      }

      // =====================================================
      // ERROR
      // =====================================================

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengupdate transaksi"
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      alert(
        "Transaksi berhasil diperbarui."
      );

      router.push(
        "/transactions"
      );

      router.refresh();
    } catch (err) {
      console.error(
        "UPDATE ERROR:",
        err
      );

      if (err instanceof TypeError) {
        setError(
          `Tidak dapat terhubung ke backend Go di ${API_URL}. Pastikan server Go sedang berjalan.`
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Terjadi kesalahan saat mengupdate transaksi."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1e8] text-[#171717]">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#171717]/20 border-t-[#7c5cff]" />

              <p className="mt-4 text-sm font-black text-gray-400">
                Loading transaction...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#171717]">
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="min-w-0 flex-1">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="border-b-2 border-[#171717] bg-white">
            <div className="mx-auto max-w-5xl px-5 py-5 sm:px-8">

              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c5cff]">
                Finance
              </p>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Edit Transaction
              </h1>

            </div>
          </header>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">

            {/* ERROR */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-bold">

                <X
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* =================================================
                CARD
            ================================================= */}

            <div className="overflow-hidden rounded-[2rem] border-[3px] border-[#171717] bg-white shadow-[8px_8px_0_#171717]">

              {/* CARD HEADER */}

              <div className="relative overflow-hidden bg-[#171717] p-7 text-white sm:p-10">

                <div className="absolute right-[-40px] top-[-50px] h-40 w-40 rounded-full bg-[#7c5cff]" />

                <div className="relative">

                  <div className="mb-5 flex h-12 w-12 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] text-[#171717] shadow-[3px_3px_0_#fff]">

                    <Pencil
                      size={22}
                      strokeWidth={3}
                    />

                  </div>

                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c8ff00]">
                    Transaction
                  </p>

                  <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                    Edit transaction
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">
                    Ubah informasi transaksi
                    kemudian simpan perubahanmu.
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

                <div className="grid gap-6 md:grid-cols-2">

                  {/* TITLE */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                      Title
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) =>
                        setTitle(
                          e.target.value
                        )
                      }
                      placeholder="Contoh: Makan siang"
                      required
                      className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                    />

                  </div>

                  {/* AMOUNT */}

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

                  {/* DATE */}

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
                          setDate(
                            e.target.value
                          )
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

                    <div
                      className={`rounded-xl border-2 border-[#171717] px-4 py-3.5 text-center text-sm font-black ${
                        type === "income"
                          ? "bg-[#c8ff00]"
                          : "bg-[#ff6b6b]"
                      }`}
                    >
                      {type === "income"
                        ? "Income"
                        : "Expense"}
                    </div>

                    <p className="mt-2 text-xs font-bold text-gray-400">
                      Type otomatis mengikuti
                      kategori yang dipilih.
                    </p>

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
                        handleCategoryChange(
                          e.target.value
                        )
                      }
                      required
                      disabled={
                        loadingCategories
                      }
                      className="w-full appearance-none rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-bold outline-none transition focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <option value="">
                        {loadingCategories
                          ? "Loading categories..."
                          : "Pilih kategori"}
                      </option>

                      {filteredCategories.map(
                        (category) => (
                          <option
                            key={
                              category.ID
                            }
                            value={
                              category.ID
                            }
                          >
                            {category.name}
                            {category.type
                              ? ` (${category.type})`
                              : ""}
                          </option>
                        )
                      )}

                    </select>

                    {selectedCategory && (
                      <p className="mt-2 text-xs font-bold text-gray-500">
                        Type kategori:{" "}
                        <span className="font-black text-[#171717]">
                          {
                            selectedCategory.type ??
                            "Tidak diketahui"
                          }
                        </span>
                      </p>
                    )}

                  </div>

                  {/* DESCRIPTION */}

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

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">

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

                        {selectedCategory && (
                          <p className="mt-1 text-xs font-bold text-gray-700">
                            {
                              selectedCategory.name
                            }
                          </p>
                        )}

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

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/transactions"
                      )
                    }
                    disabled={saving}
                    className="rounded-xl border-2 border-[#171717] bg-white px-6 py-3.5 text-sm font-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#171717] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      loadingCategories ||
                      !categoryId
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#7c5cff] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Pencil size={17} />

                        Simpan perubahan
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditTransactionPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] text-sm font-black text-gray-400">
          Loading transaction...
        </main>
      }
    >
      <EditTransactionContent />
    </Suspense>
  );
}