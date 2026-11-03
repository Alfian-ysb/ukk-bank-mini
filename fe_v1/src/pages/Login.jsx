import React from "react";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-linear-120 from-1% from-primary to-secondary">
      <div className="w-full flex h-screen flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full px-6 pb-8 pt-14 hidden lg:block lg:w-1/2 lg:px-[8%] lg:py-0">
          <h1 className="font-poppins text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            E-Teller Bank Mini SMK Negeri 1 Bantul
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-300 sm:text-base">
            Sistem manajemen transaksi teller modern untuk kemudahan pelayanan perbankan yang cepat, aman, dan akurat.
          </p>
        </div>
        <div className="flex w-full h-full flex-1 justify-center items-center rounded-t-3xl bg-neutral-100 px-[8%] py-10 lg:h-full lg:w-1/2 lg:rounded-l-4xl lg:rounded-t-none lg:py-0">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
