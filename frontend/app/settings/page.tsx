"use client";

import { useEffect, useState } from "react";
import {
  Lock,
  LogOut,
  Moon,
  Save,
  Settings,
  Sun,
  User,
  X,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { getApiUrl } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();

  // =====================================================
  // STATE
  // =====================================================

  const [name, setName] = useState("Ardiansyah");
  const [email, setEmail] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetConfigured, setBudgetConfigured] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme === "dark";
      setDarkMode(isDark);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      setName(localStorage.getItem("user_name") || "Ardiansyah");
      setEmail(localStorage.getItem("user_email") || "");

      const token = localStorage.getItem("token");
      if (token) {
        void (async () => {
          try {
            const response = await fetch(getApiUrl("/api/profile"), {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            });
            if (!response.ok) return;

            const result = await response.json();
            if (result.data?.name && result.data?.email) {
              setName(result.data.name);
              setEmail(result.data.email);
              localStorage.setItem("user_name", result.data.name);
              localStorage.setItem("user_email", result.data.email);
            }
          } catch {
            return;
          }
        })();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    async function loadBudget() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(getApiUrl("/api/budget"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal memuat budget bulanan.");
        }

        setBudgetConfigured(Boolean(result.data?.configured));
        setBudgetAmount(
          result.data?.configured ? String(result.data.amount) : ""
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat budget bulanan."
        );
      }
    }

    void loadBudget();
  }, []);

  // =====================================================
  // DARK MODE
  // =====================================================

  function handleDarkModeChange() {
    const newValue = !darkMode;

    setDarkMode(newValue);
    document.documentElement.dataset.theme = newValue ? "dark" : "light";

    if (newValue) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleSaveProfile() {
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Nama tidak boleh kosong.");
      return;
    }

    if (!email.trim()) {
      setError("Email tidak boleh kosong.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch(getApiUrl("/api/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan profil.");
      }

      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
      }
      localStorage.setItem("user_name", name.trim());
      localStorage.setItem("user_email", email.trim());
      setMessage("Profile berhasil disimpan.");

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveBudget() {
    setError("");
    setMessage("");

    const amount = Number(budgetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Masukkan budget bulanan lebih dari Rp 0.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSavingBudget(true);
    try {
      const response = await fetch(getApiUrl("/api/budget"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan budget bulanan.");
      }

      setBudgetAmount(String(result.data.amount));
      setBudgetConfigured(true);
      setMessage("Budget bulanan berhasil disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan budget.");
    } finally {
      setSavingBudget(false);
    }
  }

  async function handleClearBudget() {
    setError("");
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSavingBudget(true);
    try {
      const response = await fetch(getApiUrl("/api/budget"), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus budget bulanan.");
      }

      setBudgetAmount("");
      setBudgetConfigured(false);
      setMessage("Budget bulanan berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus budget.");
    } finally {
      setSavingBudget(false);
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async function handleChangePassword() {
    setError("");
    setMessage("");

    // VALIDASI
    if (!currentPassword) {
      setError("Password saat ini wajib diisi.");
      return;
    }

    if (!newPassword) {
      setError("Password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (!confirmPassword) {
      setError("Konfirmasi password wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Session tidak ditemukan. Silakan login kembali.");
      return;
    }

    setLoadingPassword(true);

    try {
      /*
       * Endpoint:
       * PUT /api/profile
       *
       * Sesuai backend Go:
       *
       * {
       *   "current_password": "...",
       *   "email": "...",
       *   "name": "...",
       *   "new_password": "..."
       * }
       */

      const response = await fetch(
        getApiUrl("/api/profile"),
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            current_password: currentPassword,
            email: email.trim(),
            name: name.trim(),
            new_password: newPassword,
          }),
        }
      );

      const result = await response.json();

      // =====================================================
      // RESPONSE ERROR
      // =====================================================

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal memperbarui password."
        );
      }

      // =====================================================
      // UPDATE TOKEN
      // =====================================================

      if (result?.data?.token) {
        localStorage.setItem(
          "token",
          result.data.token
        );
      }

      // =====================================================
      // UPDATE LOCAL STORAGE
      // =====================================================

      localStorage.setItem(
        "user_name",
        name.trim()
      );

      localStorage.setItem(
        "user_email",
        email.trim()
      );

      // =====================================================
      // RESET FORM
      // =====================================================

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowPassword(false);

      // =====================================================
      // SUCCESS NOTIFICATION
      // =====================================================

      setMessage(
        "✓ Password berhasil diperbarui!"
      );

      // Hilangkan pesan setelah 5 detik
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Gagal memperbarui password."
        );
      }
    } finally {
      setLoadingPassword(false);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");

    router.push("/login");
  }

  // =====================================================
  // THEME CLASSES
  // =====================================================

  const pageBackground = darkMode
    ? "bg-[#111111] text-white"
    : "bg-[#f5f1e8] text-[#171717]";

  const cardBackground = darkMode
    ? "bg-[#1c1c1c] text-white"
    : "bg-white text-[#171717]";

  const inputBackground = darkMode
    ? "bg-[#252525] text-white placeholder:text-gray-500"
    : "bg-[#f5f1e8] text-[#171717] placeholder:text-gray-400";

  const secondaryBackground = darkMode
    ? "bg-[#252525]"
    : "bg-[#f5f1e8]";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      className={`flex min-h-screen pb-24 transition-colors duration-300 lg:pb-0 ${pageBackground}`}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

        <div className="min-h-screen min-w-0 flex-1">

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className={`border-b-2 border-[#171717] transition-colors duration-300 ${
            darkMode
              ? "bg-[#1c1c1c]"
              : "bg-white"
          }`}
        >

          <div className="mx-auto flex max-w-5xl items-center px-5 py-5 sm:px-8">
            {/* TITLE */}

            <div>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c5cff]">
                Account
              </p>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Settings
              </h1>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-10">

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="mb-8">

            <div className="mb-4 flex h-14 w-14 rotate-[-5deg] items-center justify-center rounded-2xl border-[3px] border-[#171717] bg-[#c8ff00] shadow-[4px_4px_0_#171717]">

              <Settings
                size={25}
                className="text-[#171717]"
              />

            </div>

            <h2 className="text-4xl font-black tracking-[-0.05em]">
              Manage your account.
            </h2>

            <p
              className={`mt-2 max-w-xl text-sm leading-6 ${
                darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Kelola informasi akun, keamanan,
              dan preferensi aplikasi kamu.
            </p>

          </div>

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border-[3px] border-[#171717] bg-[#c8ff00] px-5 py-4 text-sm font-black text-[#171717] shadow-[4px_4px_0_#171717]">

              <CheckCircle2
                size={20}
                className="shrink-0"
              />

              <span>{message}</span>

            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border-[3px] border-[#171717] bg-[#ff6b6b] px-5 py-4 text-sm font-bold text-[#171717] shadow-[4px_4px_0_#171717]">

              <X
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>

            </div>
          )}

          <div className="space-y-6">

            <section
              id="monthly-budget"
              className={`scroll-mt-6 rounded-[2rem] border-[3px] border-[#171717] p-6 shadow-[5px_5px_0_#171717] transition-colors duration-300 sm:p-8 ${cardBackground}`}
            >
              <div className="mb-7">
                <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                  Budget bulanan
                </p>
                <h3 className="mt-1 text-2xl font-black">
                  Atur batas pengeluaran
                </h3>
                <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Budget hanya berlaku untuk akun ini dan digunakan untuk
                  menghitung pengeluaran bulan berjalan.
                </p>
              </div>

              <div className="max-w-md">
                <label
                  htmlFor="monthly-budget-amount"
                  className="mb-2 block text-xs font-black uppercase tracking-wider"
                >
                  Budget per bulan (rupiah)
                </label>
                <input
                  id="monthly-budget-amount"
                  type="number"
                  min="1"
                  step="1000"
                  inputMode="numeric"
                  value={budgetAmount}
                  onChange={(event) => setBudgetAmount(event.target.value)}
                  placeholder="Contoh: 5000000"
                  className={`w-full rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-bold outline-none transition focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] ${inputBackground}`}
                />
                {budgetConfigured && (
                  <p className={`mt-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Budget saat ini:{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(Number(budgetAmount))}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {budgetConfigured && (
                  <button
                    type="button"
                    onClick={handleClearBudget}
                    disabled={savingBudget}
                    className={`rounded-xl border-2 border-[#171717] px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${darkMode ? "bg-[#252525] text-white" : "bg-white text-[#171717]"}`}
                  >
                    Hapus budget
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  disabled={savingBudget}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#c8ff00] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />
                  {savingBudget ? "Menyimpan..." : "Simpan budget"}
                </button>
              </div>
            </section>

            {/* =================================================
                PROFILE
            ================================================= */}

            <section
              className={`rounded-[2rem] border-[3px] border-[#171717] p-6 shadow-[5px_5px_0_#171717] transition-colors duration-300 sm:p-8 ${cardBackground}`}
            >

              <div className="mb-7 flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#171717] bg-[#7c5cff] text-white">

                  <User size={21} />

                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                    Profile
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Personal information
                  </h3>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    Update informasi dasar akun
                    kamu.
                  </p>

                </div>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>

                  <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                    Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Nama kamu"
                    className={`w-full rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-bold outline-none transition focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] ${inputBackground}`}
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="email@example.com"
                    className={`w-full rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-bold outline-none transition focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] ${inputBackground}`}
                  />

                </div>

              </div>

              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#c8ff00]"
                >

                  <Save size={17} />

                  {savingProfile ? "Saving..." : "Save profile"}

                </button>

              </div>

            </section>

            {/* =================================================
                APPEARANCE
            ================================================= */}

            <section
              className={`rounded-[2rem] border-[3px] border-[#171717] p-6 shadow-[5px_5px_0_#171717] transition-colors duration-300 sm:p-8 ${cardBackground}`}
            >

              <div className="mb-7 flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] text-[#171717]">

                  {darkMode ? (
                    <Moon size={21} />
                  ) : (
                    <Sun size={21} />
                  )}

                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                    Appearance
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Display
                  </h3>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    Pilih tampilan aplikasi.
                  </p>

                </div>

              </div>

              {/* DARK MODE */}

              <div
                className={`flex items-center justify-between gap-5 rounded-2xl border-2 border-[#171717] p-5 transition-colors duration-300 ${secondaryBackground}`}
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#171717] ${
                      darkMode
                        ? "bg-[#7c5cff] text-white"
                        : "bg-white text-[#171717]"
                    }`}
                  >

                    {darkMode ? (
                      <Moon size={19} />
                    ) : (
                      <Sun size={19} />
                    )}

                  </div>

                  <div>

                    <p className="text-sm font-black">
                      Dark mode
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {darkMode
                        ? "Dark mode sedang aktif."
                        : "Gunakan tampilan gelap untuk aplikasi."}
                    </p>

                  </div>

                </div>

                {/* TOGGLE */}

                <button
                  type="button"
                  aria-label="Toggle dark mode"
                  onClick={handleDarkModeChange}
                  className={`relative h-8 w-14 shrink-0 rounded-full border-2 border-[#171717] transition-colors ${
                    darkMode
                      ? "bg-[#7c5cff]"
                      : "bg-white"
                  }`}
                >

                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full border-2 border-[#171717] bg-[#171717] transition-all duration-300 ${
                      darkMode
                        ? "left-7"
                        : "left-1"
                    }`}
                  />

                </button>

              </div>

              <div className="mt-4 flex items-center justify-between">

                <p
                  className={`text-xs font-bold ${
                    darkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  Theme preference is saved automatically.
                </p>

                <span
                  className={`rounded-full border-2 border-[#171717] px-3 py-1 text-[10px] font-black uppercase ${
                    darkMode
                      ? "bg-[#7c5cff] text-white"
                      : "bg-[#c8ff00] text-[#171717]"
                  }`}
                >
                  {darkMode ? "Dark" : "Light"}
                </span>

              </div>

            </section>

            {/* =================================================
                SECURITY
            ================================================= */}

            <section
              className={`rounded-[2rem] border-[3px] border-[#171717] p-6 shadow-[5px_5px_0_#171717] transition-colors duration-300 sm:p-8 ${cardBackground}`}
            >

              <div className="mb-7 flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#171717] bg-[#ff6b6b] text-[#171717]">

                  <Lock size={21} />

                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-widest text-[#7c5cff]">
                    Security
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Change password
                  </h3>

                  <p
                    className={`mt-1 text-sm ${
                      darkMode
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    Perbarui password akun kamu
                    secara berkala.
                  </p>

                </div>

              </div>

              {/* =================================================
                  CHANGE PASSWORD BUTTON
              ================================================= */}

              {!showPassword ? (

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setShowPassword(true);
                  }}
                  className={`rounded-xl border-2 border-[#171717] px-5 py-3 text-sm font-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#c8ff00] ${
                    darkMode
                      ? "bg-[#252525] text-white"
                      : "bg-[#f5f1e8] text-[#171717]"
                  }`}
                >
                  Change password
                </button>

              ) : (

                <div className="space-y-5">

                  {/* CURRENT PASSWORD */}

                  <div>

                    <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                      Current password
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      placeholder="Password saat ini"
                      autoComplete="current-password"
                      className={`w-full rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-bold outline-none transition focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] ${inputBackground}`}
                    />

                  </div>

                  {/* NEW PASSWORD */}

                  <div>

                    <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                      New password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      placeholder="Password baru"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-bold outline-none transition focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] ${inputBackground}`}
                    />

                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                      Confirm new password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border-2 border-[#171717] px-4 py-3.5 text-sm font-bold outline-none transition focus:bg-white focus:shadow-[4px_4px_0_#c8ff00] ${inputBackground}`}
                    />

                  </div>

                  {/* PASSWORD INFO */}

                  <div
                    className={`rounded-xl border-2 border-[#171717] px-4 py-3 text-xs font-bold ${
                      darkMode
                        ? "bg-[#252525] text-gray-400"
                        : "bg-[#f5f1e8] text-gray-500"
                    }`}
                  >
                    Password baru minimal 8
                    karakter dan harus sama dengan
                    konfirmasi password.
                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    {/* CANCEL */}

                    <button
                      type="button"
                      disabled={loadingPassword}
                      onClick={() => {
                        setShowPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError("");
                      }}
                      className={`rounded-xl border-2 border-[#171717] px-5 py-3 text-sm font-black transition hover:-translate-y-1 hover:shadow-[3px_3px_0_#171717] disabled:cursor-not-allowed disabled:opacity-50 ${
                        darkMode
                          ? "bg-[#252525] text-white"
                          : "bg-white text-[#171717]"
                      }`}
                    >
                      Cancel
                    </button>

                    {/* UPDATE */}

                    <button
                      type="button"
                      disabled={loadingPassword}
                      onClick={
                        handleChangePassword
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#7c5cff] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {loadingPassword ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock size={17} />
                          Update password
                        </>
                      )}

                    </button>

                  </div>

                </div>

              )}

            </section>

            {/* =================================================
                LOGOUT
            ================================================= */}

            <section className="rounded-[2rem] border-[3px] border-[#171717] bg-[#ff6b6b] p-6 text-[#171717] shadow-[5px_5px_0_#171717] sm:p-8">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>

                  <p className="text-xs font-black uppercase tracking-widest">
                    Account
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Sign out
                  </h3>

                  <p className="mt-1 text-sm font-medium opacity-60">
                    Keluar dari akun Expense Tracker
                    di perangkat ini.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  data-logout="settings"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-white px-5 py-3 text-sm font-black transition hover:-translate-y-1 hover:shadow-[4px_4px_0_#171717]"
                >

                  <LogOut size={17} />

                  Logout

                </button>

              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}