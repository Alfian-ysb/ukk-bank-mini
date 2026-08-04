import React from "react";
import DashboardLayout from "../components/DashboardLayout";

const Profile = () => {
  return (
    <DashboardLayout title="Profile">
      <div className="h-full w-full px-0 sm:px-[4%] lg:px-[10%]">
        <div className="w-full overflow-clip rounded-2xl shadow-lg inset-shadow-2xs">
          <div className="flex flex-col items-start gap-4 bg-linear-120 from-[#063d34] via-tertiary to-[#0c6653] px-5 py-6 text-white sm:flex-row sm:items-center sm:px-[5%]">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-3 border-neutral-200 bg-primary font-inter text-3xl font-bold sm:h-20 sm:w-20 sm:text-4xl">
              L
            </div>
            <h1 className="text-lg font-inter font-medium sm:text-xl">
              Lorem, ipsum dolor.
            </h1>
          </div>
          <div className="px-5 py-4 text-sm text-gray-700 sm:px-[5%] sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores,
            et.
          </div>
        </div>
        <div className="mt-4 w-full overflow-clip rounded-2xl px-5 py-6 text-sm text-gray-700 shadow-lg inset-shadow-2xs sm:mt-6 sm:px-[5%] sm:text-base">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quidem
          minima delectus voluptatum quia cum est nam sint nesciunt tempora iste
          impedit debitis vel eius, deserunt, sapiente optio, quae sunt
          deleniti.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
