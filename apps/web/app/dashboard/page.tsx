import ZenGarden from "@/components/ZenGarden";
import { BrainIcon, HeartIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <main className="container mx-auto">
      <h2 className="text-3xl font-semibold">Welcome back , there</h2>
      <p className="text-gray-600">Wednesday, January 28</p>
      <div className="flex gap-4">
        {/* quick actions  */}
        <div className="bg-green-100 shadow p-6 rounded-xl">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          <p className="text-gray-600 text-base">Start your wellness journey</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-green-500 p-4 rounded-lg text-white">
              <h4>Start Therapy</h4>
              <p className="text-gray-500">Begin a new session</p>
            </div>
            <div className="flex flex-col items-center bg-white rounded-md p-4">
              <div className="p-2 bg-red-300 rounded-full">
                <HeartIcon />
              </div>
              <h4>Track Mood</h4>
              <p>How are you feeling?</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-md">
              <div className="p-2 bg-blue-300 rounded-full">
                <BrainIcon />
              </div>
              <h4>Check-in</h4>
              <p>Quick wellness check</p>
            </div>
          </div>
        </div>
        {/* overview  */}

        <div className="bg-gray-100 shadow p-6 rounded-xl">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          <p className="text-gray-600 text-base">Start your wellness journey</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500 p-4 rounded-lg text-white">
              <h4>Start Therapy</h4>
              <p className="text-gray-500">Begin a new session</p>
            </div>
            <div className="flex flex-col items-center bg-white rounded-md p-4">
              <div className="p-2 bg-red-300 rounded-full">
                <HeartIcon />
              </div>
              <h4>Track Mood</h4>
              <p>How are you feeling?</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-md">
              <div className="p-2 bg-blue-300 rounded-full">
                <BrainIcon />
              </div>
              <h4>Check-in</h4>
              <p>Quick wellness check</p>
            </div>
          </div>
        </div>

        {/* insights  */}
        <div className="bg-gray-100 shadow p-6 rounded-xl">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          <p className="text-gray-600 text-base">Start your wellness journey</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500 p-4 rounded-lg text-white">
              <h4>Start Therapy</h4>
              <p className="text-gray-500">Begin a new session</p>
            </div>
            <div className="flex flex-col items-center bg-white rounded-md p-4">
              <div className="p-2 bg-red-300 rounded-full">
                <HeartIcon />
              </div>
              <h4>Track Mood</h4>
              <p>How are you feeling?</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-md">
              <div className="p-2 bg-blue-300 rounded-full">
                <BrainIcon />
              </div>
              <h4>Check-in</h4>
              <p>Quick wellness check</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 shadow-2xl p-6 rounded-2xl">
        <h4 className="text-xl font-semibold">Anxiety Relief Activities</h4>
        <p className="text-sm text-gray-500">
          Interactive exercises to help reduce stress and anxiety
        </p>
        <ZenGarden />
      </div>
    </main>
  );
};

export default Dashboard;
