import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import Table from "../components/Table";

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="mt-6 rounded-2xl bg-white p-4 shadow sm:p-5">
        <h3 className="mb-4 font-poppins text-lg font-semibold text-dark">Dashboard</h3>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
