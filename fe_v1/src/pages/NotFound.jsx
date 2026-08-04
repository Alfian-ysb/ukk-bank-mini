import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="overflow-clip min-h-screen bg-linear-120 from-[#063d34] to-primary px-6 py-10 sm:px-10">
      <div className="relative z-10 inset-0 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
      <p className="absolute left-1/2 -z-10 top-1/2 -translate-1/2 text-[15rem] sm:text-[20rem] md:text-[28rem] lg:text-[40rem] opacity-30 font-bold text-white/10 font-poppins">404</p>
        <section className="w-full sm:p-12">
          <p className="font-poppins text-sm font-semibold tracking-[0.25em] text-white/70">
            ERROR 404
          </p>
          <h1 className="mt-3 font-poppins text-5xl font-semibold text-white sm:text-6xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-200">
            URL yang kamu buka tidak tersedia, mungkin sudah dipindah atau salah
            ketik. Kembali ke halaman login untuk melanjutkan.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="rounded-xl bg-white px-6 py-3 font-poppins text-sm font-semibold text-[#063d34] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Kembali ke Login
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-xl border border-white/40 px-6 py-3 font-poppins text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Halaman Sebelumnya
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default NotFound;
