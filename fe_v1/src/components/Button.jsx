import React from "react";

const Button = ({ text, onClick, theme, customClass, disabled }) => {
  const themeClasses = {
    primary:
      "bg-primary hover:bg-secondary text-sm text-white font-bold px-4 py-2 rounded transition duration-300 cursor-pointer",
    secondary:
      "bg-secondary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 cursor-pointer",
    danger:
      "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 cursor-pointer",
    disabled:
      "bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed",
    white:
      "rounded-xl bg-white px-6 py-3 font-poppins text-sm font-semibold text-[#063d34] transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer",
    outline:
      "rounded outline outline-primary/70 bg-white/20 px-4 py-2 font-poppins text-sm font-semibold text-neutral-700 transition hover:bg-primary/10 cursor-pointer",
  };

  return (
    <button
      onClick={onClick}
      className={`${themeClasses[theme] || themeClasses.primary} ${customClass || ""}`}
      disabled={disabled}
    >
      {text || "Button"}
    </button>
  );
};

export default Button;
