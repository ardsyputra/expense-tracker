"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
e.preventDefault();


setError("");
setLoading(true);

try {
  const response = await login(email, password);

  if (!response.data?.token) {
    throw new Error("Token tidak ditemukan");
  }

  localStorage.setItem("token", response.data.token);

  router.push("/dashboard");
} catch (err) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("Login gagal");
  }
} finally {
  setLoading(false);
}


}

return ( <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] px-5 py-8 text-[#171717]">

  {/* BACKGROUND DECORATIONS */}

  <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#c8ff00]" />

  <div className="absolute right-[-40px] top-20 h-32 w-32 rotate-12 rounded-3xl border-4 border-[#171717] bg-[#ff6b6b]" />

  <div className="absolute bottom-[-70px] left-[-40px] h-44 w-44 rounded-full border-[12px] border-[#7c5cff]" />

  <div className="absolute bottom-20 right-10 hidden rotate-[-8deg] rounded-xl border-2 border-[#171717] bg-white px-4 py-2 text-sm font-black shadow-[4px_4px_0_#171717] sm:block">
    SPEND SMART ✦
  </div>

  {/* MAIN */}

  <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">

    <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border-[3px] border-[#171717] bg-white shadow-[10px_10px_0_#171717] md:grid-cols-2">

      {/* LEFT SIDE */}

      <section className="relative hidden min-h-[620px] overflow-hidden bg-[#171717] p-10 text-white md:flex md:flex-col md:justify-between">

        <div>

          <div className="mb-10 inline-flex -rotate-2 items-center rounded-full border-2 border-white bg-[#c8ff00] px-4 py-2 text-sm font-black text-[#171717]">
            EXPENSE TRACKER
          </div>

          <h2 className="max-w-md text-6xl font-black leading-[0.9] tracking-[-0.06em]">
            Your money.
            <br />
            Your rules.
          </h2>

          <p className="mt-6 max-w-sm text-base leading-7 text-white/60">
            Track your spending, understand your habits, and stay in
            control of your money.
          </p>

        </div>

        {/* GRAPHIC */}

        <div className="relative mt-10 h-64">

          <div className="absolute left-4 top-10 h-44 w-56 rotate-[-7deg] rounded-[2rem] border-2 border-white/20 bg-[#7c5cff] p-6">

            <p className="text-xs font-bold uppercase tracking-widest text-white/70">
              This month
            </p>

            <p className="mt-5 text-4xl font-black">
              Rp 2.4M
            </p>

            <div className="mt-6 h-3 rounded-full bg-white/20">
              <div className="h-3 w-[68%] rounded-full bg-[#c8ff00]" />
            </div>

          </div>

          <div className="absolute right-4 top-0 flex h-32 w-32 rotate-12 items-center justify-center rounded-full border-2 border-[#171717] bg-[#ff6b6b] text-center text-xl font-black text-[#171717]">
            SAVE
            <br />
            MORE!
          </div>

          <div className="absolute bottom-0 right-20 h-20 w-20 rotate-[-12deg] rounded-2xl bg-[#c8ff00]" />

        </div>

        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/40">
          <span>Finance / 01</span>
          <span>© 2026</span>
        </div>

      </section>

      {/* RIGHT SIDE */}

      <section className="flex min-h-[620px] flex-col justify-center p-7 sm:p-10 lg:p-14">

        {/* HEADER */}

        <div className="mb-8">

          <div className="mb-6 flex h-12 w-12 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-[#171717] bg-[#c8ff00] text-xl font-black shadow-[3px_3px_0_#171717]">
            $
          </div>

          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#7c5cff]">
            Welcome back
          </p>

          <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Let&apos;s get
            <br />

            <span className="relative inline-block">
              <span className="relative z-10">
                organized.
              </span>

              <span className="absolute bottom-0 left-0 -z-0 h-3 w-full -rotate-1 bg-[#c8ff00]" />
            </span>
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
            Masuk dan mulai kelola pengeluaranmu dengan lebih santai.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border-2 border-[#171717] bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-[#171717]">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>

            <label className="mb-2 block text-xs font-black uppercase tracking-wider">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
            />

          </div>

          {/* PASSWORD */}

          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="block text-xs font-black uppercase tracking-wider">
                Password
              </label>

              <button
                type="button"
                className="text-xs font-bold text-[#7c5cff] hover:underline"
              >
                Forgot?
              </button>

            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border-2 border-[#171717] bg-[#f5f1e8] px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-gray-400 focus:-translate-y-0.5 focus:bg-white focus:shadow-[4px_4px_0_#c8ff00]"
            />

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-2 border-[#171717] bg-[#171717] px-4 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#7c5cff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Memproses..."
              : "Masuk ke Dashboard →"}
          </button>

        </form>

        {/* DIVIDER */}

        <div className="mt-8 flex items-center gap-3">

          <div className="h-[2px] flex-1 bg-[#171717]/10" />

          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            secure login
          </span>

          <div className="h-[2px] flex-1 bg-[#171717]/10" />

        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Expense Tracker · Keep your spending in check ✦
        </p>

        <p className="mt-4 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-black text-[#7c5cff] hover:underline"
          >
            Buat akun
          </Link>
        </p>

      </section>

    </div>

  </div>

</main>


);
}
