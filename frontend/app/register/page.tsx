"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const response = await register(email.trim(), name.trim(), password);
      if (response.success === false) {
        throw new Error(response.message || "Pendaftaran gagal.");
      }
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      data-auth-form
      className="relative min-h-screen overflow-hidden bg-[#f5f1e8] px-5 py-8 text-[#171717]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#c8ff00]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-40px] top-20 h-32 w-32 rotate-12 rounded-3xl border-4 border-[#171717] bg-[#ff6b6b]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-70px] left-[-40px] h-44 w-44 rounded-full border-[12px] border-[#7c5cff]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="w-full max-w-xl rounded-[2rem] border-[3px] border-[#171717] bg-white p-7 shadow-[10px_10px_0_#171717] sm:p-10">
          <div className="mb-8">
            <div className="mb-6 flex h-12 w-12 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] text-xl font-black shadow-[3px_3px_0_#171717]">
              $
            </div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#7c5cff]">
              Mulai kelola keuangan
            </p>
            <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Buat akun
            </h1>
            <p className="mt-4 text-sm leading-6 text-gray-500">
              Daftar untuk mulai mencatat pemasukan dan pengeluaranmu.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-[#171717]"
            >
              {error}
            </div>
          )}

          {registered ? (
            <div
              role="status"
              data-registration-success
              className="rounded-xl border-2 border-[#171717] bg-[#c8ff00] p-5"
            >
              <p className="font-black">Akun berhasil dibuat.</p>
              <p className="mt-2 text-sm">
                Sekarang kamu bisa masuk menggunakan email dan password yang
                didaftarkan.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-xl border-2 border-[#171717] bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
              >
                Lanjut ke login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-black uppercase tracking-wider"
                >
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nama lengkap"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-black uppercase tracking-wider"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-black uppercase tracking-wider"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-xs font-black uppercase tracking-wider"
                >
                  Konfirmasi password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-2 border-[#171717] bg-[#171717] px-4 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#7c5cff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Daftar akun →"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-black text-[#7c5cff] hover:underline"
            >
              Masuk
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
