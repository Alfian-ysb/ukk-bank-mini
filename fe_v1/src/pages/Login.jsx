import React from "react";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-linear-120 from-1% from-[#063d34] to-primary">
      <div className="w-full flex h-screen flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full px-6 pb-8 pt-14 hidden lg:block lg:w-1/2 lg:px-[8%] lg:py-0">
          <h1 className="font-poppins text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-300 sm:text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores
            architecto accusantium molestias quaerat beatae esse atque, vel
            aperiam quisquam saepe qui odit libero porro quis et voluptatum
            voluptates voluptatem ut minima? Fuga placeat ipsam minima voluptate
            neque nisi inventore repellat.
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
