import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { post } from "../api";
import { getRouteByRole, saveSession } from "../context/authSession";

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await post("/staff/login", form);
      saveSession(response);
      navigate(
        location.state?.from?.pathname ||
          getRouteByRole(response.user?.role || response.data?.role),
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="w-full max-w-xl" onSubmit={submit}>
      <div className="mb-8 sm:mb-10 text-center lg:text-start">
        <h1 className="font-inter text-2xl font-bold text-gray-700 sm:text-3xl">
          Login Staff
        </h1>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">
          Gunakan username dan password staff.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="username"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Masukkan username"
            className="bg-neutral-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-dark"
            value={form.username}
            onChange={change}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="password"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Masukkan password"
            className="bg-neutral-100 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-dark"
            value={form.password}
            onChange={change}
            required
          />
        </div>

        {message && <p className="text-sm text-red-600">{message}</p>}

        <div className="mt-8 w-full sm:mt-10">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 px-4 text-white font-medium hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-dark"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
