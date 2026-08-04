import React, { useState } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { getRouteByRole, getStoredRole } from "../context/authSession";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email : "",
    password : "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.data.role);
        sessionStorage.setItem("isLoggedIn", true);
        navigate(getRouteByRole(getStoredRole()));
      }
      console.log("Login successful:", data);
    } catch (error) {
      console.error("Login error:", error);
    }
  }
  
  return (
    <div className="w-full max-w-xl">
      <div className="mb-8 sm:mb-10 text-center lg:text-start">
        <h1 className="font-inter text-2xl font-bold text-gray-700 sm:text-3xl">Masuk Ke Akun Anda</h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">Silakan masuk ke akun Anda untuk melanjutkan.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">email:</label>
          <input
            type="email"
            id="email"
            placeholder="Masukkan email"
            className="bg-neutral-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-dark"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Masukkan password"
            className="bg-neutral-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-dark"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="mt-8 w-full sm:mt-10">
          <Button text="Masuk" theme="primary" customClass={'py-3'}/>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
