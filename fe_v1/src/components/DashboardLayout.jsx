import React, { useState } from "react";

const DashboardLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-neutral-200 lg:grid lg:grid-cols-5">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-b-neutral-300 bg-neutral-100 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg bg-primary px-3 py-2 font-poppins text-sm font-medium text-white"
        >
          Menu
        </button>
        <h1 className="font-poppins text-lg font-semibold text-dark">
          {title || "Dashboard"}
        </h1>
      </header>

      <div className="hidden bg-size-[120%] bg-linear-120 from-[#063d34] via-tertiary to-[#0c6653] px-4 lg:col-span-1 lg:block lg:rounded-r-3xl">
        <div className="border-b border-b-neutral-600 py-4">
          <h1 className="font-poppins text-xl font-medium text-white">
            {title || "Sidebar"}
          </h1>
        </div>
        <div className="py-4 text-sm text-white/85">Menu</div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[84%] bg-linear-120 from-[#063d34] via-tertiary to-[#0c6653] px-4">
            <div className="flex items-center justify-end py-3">
              <button
                type="button"
                className="rounded-md border border-white/30 px-3 py-1 text-sm text-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                Tutup
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="overflow-auto p-4 sm:p-6 lg:col-span-4">{children}</div>
    </div>
  );
};

export default DashboardLayout;
