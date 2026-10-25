"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
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
  user_id?: number;
};

const API_URL = "http://localhost:8081";

export default function CategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">(
    "expense"
  );

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = useCallback(async () => {
    try {
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

      console.log("Categories response:", result);

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

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
          data: {
            categories: [...]
          }
        }

        atau langsung:

        [...]
      */

      const data =
        Array.isArray(result)
          ? result
          : result.data?.categories ??
            result.data ??
            result.categories ??
            [];

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch categories error:", err);

      if (err instanceof TypeError) {
        setError(
          "Tidak dapat terhubung ke backend. Pastikan backend Go dan Docker berjalan."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal mengambil kategori.");
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
      void fetchCategories();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fetchCategories]);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  function handleAdd() {
    setEditingCategory(null);
    setName("");
    setType("expense");
    setError("");
    setShowModal(true);
  }

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setType(
      category.type?.toLowerCase() === "income"
        ? "income"
        : "expense"
    );
    setError("");
    setShowModal(true);
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    setName("");
    setType("expense");
    setError("");
  }

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Nama kategori minimal 2 karakter.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const body = {
        name: trimmedName,
        type,
      };

      console.log("Category request:", body);

      let response: Response;

      // =================================================
      // CREATE
      // =================================================

      if (!editingCategory) {
        response = await fetch(
          `${API_URL}/api/categories`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
      }

      // =================================================
      // UPDATE
      // =================================================

      else {
        response = await fetch(
          `${API_URL}/api/categories/${editingCategory.ID}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
      }

      const result = await response.json();

      console.log("Category mutation response:", result);

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            (editingCategory
              ? "Gagal mengubah kategori."
              : "Gagal membuat kategori.")
        );
      }

      closeModal();

      await fetchCategories();
    } catch (err) {
      console.error("Category mutation error:", err);

      if (err instanceof TypeError) {
        setError(
          "Tidak dapat terhubung ke backend. Pastikan backend Go dan Docker berjalan."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kategori "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.ID);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/categories/${category.ID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log("Delete category response:", result);

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menghapus kategori."
        );
      }

      // Hapus langsung dari UI
      setCategories((current) =>
        current.filter(
          (item) => item.ID !== category.ID
        )
      );
    } catch (err) {
      console.error("Delete category error:", err);

      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Gagal menghapus kategori.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // FILTER
  // =====================================================

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        category.name
          ?.toLowerCase()
          .includes(keyword);

      const normalizedType =
        category.type?.toLowerCase();

      const matchesType =
        filterType === "all" ||
        normalizedType ===
          filterType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [categories, search, filterType]);

  // =====================================================
  // COUNTS
  // =====================================================

  const incomeCategories = categories.filter(
    (category) =>
      category.type?.toLowerCase() === "income"
  ).length;

  const expenseCategories = categories.filter(
    (category) =>
      category.type?.toLowerCase() === "expense"
  ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#171717]">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <header className="border-b-2 border-[#171717] bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c5cff]">
                  Finance
                </p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Categories
                </h1>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#c8ff00]"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">
                  Add category
                </span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-[2rem] border-[3px] border-[#171717] bg-[#171717] p-6 text-white shadow-[5px_5px_0_#7c5cff]">

            <div className="flex items-center justify-between">

              <p className="text-xs font-black uppercase tracking-widest text-white/50">
                Categories
              </p>

              <FolderOpen
                size={20}
                className="text-[#c8ff00]"
              />

            </div>

            <p className="mt-5 text-3xl font-black">
              {categories.length}
            </p>

            <p className="mt-1 text-xs text-white/40">
              Total categories
            </p>

          </div>

          {/* INCOME */}

          <div className="rounded-[2rem] border-[3px] border-[#171717] bg-[#c8ff00] p-6 shadow-[5px_5px_0_#171717]">

            <div className="flex items-center justify-between">

              <p className="text-xs font-black uppercase tracking-widest">
                Income
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">
                <ArrowUpRight size={19} />
              </div>

            </div>

            <p className="mt-5 text-3xl font-black">
              {incomeCategories}
            </p>

            <p className="mt-1 text-xs font-bold opacity-50">
              Income categories
            </p>

          </div>

          {/* EXPENSE */}

          <div className="rounded-[2rem] border-[3px] border-[#171717] bg-[#ff6b6b] p-6 shadow-[5px_5px_0_#171717]">

            <div className="flex items-center justify-between">

              <p className="text-xs font-black uppercase tracking-widest">
                Expense
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#171717] bg-white">
                <ArrowDownRight size={19} />
              </div>

            </div>

            <p className="mt-5 text-3xl font-black">
              {expenseCategories}
            </p>

            <p className="mt-1 text-xs font-bold opacity-50">
              Expense categories
            </p>

          </div>

        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="mb-6 rounded-[2rem] border-[3px] border-[#171717] bg-white p-5 shadow-[5px_5px_0_#171717]">

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
                  setSearch(e.target.value)
                }
                placeholder="Cari kategori..."
                className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
              />

            </div>

            {/* FILTER BUTTON */}

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  setFilterType("all")
                }
                className={`rounded-xl border-2 border-[#171717] px-4 py-2 text-xs font-black transition ${
                  filterType === "all"
                    ? "bg-[#171717] text-white"
                    : "bg-white hover:bg-[#f5f1e8]"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilterType("income")
                }
                className={`rounded-xl border-2 border-[#171717] px-4 py-2 text-xs font-black transition ${
                  filterType === "income"
                    ? "bg-[#c8ff00]"
                    : "bg-white hover:bg-[#f5f1e8]"
                }`}
              >
                Income
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilterType("expense")
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
            CATEGORY LIST
        ================================================= */}

        <div className="rounded-[2rem] border-[3px] border-[#171717] bg-white p-5 shadow-[5px_5px_0_#171717] sm:p-6">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                Manage
              </p>

              <h2 className="mt-1 text-2xl font-black">
                All categories
              </h2>

            </div>

            <p className="text-xs font-bold text-gray-400">
              {filteredCategories.length} results
            </p>

          </div>

          {/* ERROR */}

          {error && !showModal && (

            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-bold">

              <span>{error}</span>

              <button
                type="button"
                onClick={fetchCategories}
                className="shrink-0 underline"
              >
                Coba lagi
              </button>

            </div>

          )}

          {/* LOADING */}

          {loading && (

            <div className="flex min-h-[250px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center">

                  <Loader2
                    size={32}
                    className="animate-spin text-[#7c5cff]"
                  />

                </div>

                <p className="mt-4 text-sm font-bold text-gray-400">
                  Loading categories...
                </p>

              </div>

            </div>

          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredCategories.length === 0 && (

              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#171717]/20">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#171717] bg-[#c8ff00]">
                  <FolderOpen size={24} />
                </div>

                <h3 className="mt-4 text-lg font-black">
                  No categories found
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Belum ada kategori yang sesuai.
                </p>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-5 flex items-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-4 py-3 text-xs font-black text-white"
                >
                  <Plus size={15} />
                  Add category
                </button>

              </div>

            )}

          {/* DATA */}

          {!loading &&
            filteredCategories.length > 0 && (

              <div className="space-y-3">

                {filteredCategories.map((category) => {

                  const isIncome =
                    category.type?.toLowerCase() ===
                    "income";

                  const isDeleting =
                    deletingId === category.ID;

                  return (

                    <div
                      key={category.ID}
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
                              size={21}
                            />
                          ) : (
                            <ArrowDownRight
                              size={21}
                            />
                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-black">
                            {category.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2">

                            <span
                              className={`rounded-full border border-[#171717] px-2 py-0.5 text-[10px] font-black uppercase ${
                                isIncome
                                  ? "bg-[#c8ff00]"
                                  : "bg-[#ff6b6b]"
                              }`}
                            >
                              {isIncome
                                ? "Income"
                                : "Expense"}
                            </span>

                            <span className="text-xs text-gray-400">
                              ID #{category.ID}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          disabled={isDeleting}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#171717] bg-white transition hover:bg-[#c8ff00] disabled:cursor-not-allowed disabled:opacity-50"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category)
                          }
                          disabled={isDeleting}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#171717] bg-white transition hover:bg-[#ff6b6b] disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>

                      </div>

                    </div>

                  );
                })}

              </div>

            )}

        </div>

          </div>
        </div>
      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/60 p-5 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-[2rem] border-[3px] border-[#171717] bg-white shadow-[8px_8px_0_#c8ff00]">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b-2 border-[#171717] p-6">

              <div>

                <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                  Category
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {editingCategory
                    ? "Edit category"
                    : "Add category"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#171717] bg-[#f5f1e8] transition hover:bg-[#ff6b6b] disabled:opacity-50"
              >
                <X size={16} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {/* MODAL ERROR */}

              {error && (

                <div className="mb-5 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-bold">
                  {error}
                </div>

              )}

              {/* NAME */}

              <div>

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Category name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Contoh: Makanan"
                  autoFocus
                  disabled={saving}
                  className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-bold outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] disabled:opacity-50"
                />

              </div>

              {/* TYPE */}

              <div className="mt-6">

                <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setType("expense")
                    }
                    disabled={saving}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-black transition ${
                      type === "expense"
                        ? "bg-[#ff6b6b] shadow-[3px_3px_0_#171717]"
                        : "bg-[#f5f1e8] hover:bg-white"
                    }`}
                  >
                    <ArrowDownRight size={17} />
                    Expense
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setType("income")
                    }
                    disabled={saving}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-black transition ${
                      type === "income"
                        ? "bg-[#c8ff00] shadow-[3px_3px_0_#171717]"
                        : "bg-[#f5f1e8] hover:bg-white"
                    }`}
                  >
                    <ArrowUpRight size={17} />
                    Income
                  </button>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border-2 border-[#171717] bg-white px-5 py-3 text-sm font-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#171717] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#7c5cff] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      {editingCategory
                        ? "Saving..."
                        : "Adding..."}
                    </>
                  ) : (
                    <>
                      {editingCategory ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={17} />
                      )}

                      {editingCategory
                        ? "Save changes"
                        : "Add category"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}