"use client";
import { useRouter } from "next/navigation";

const StartTherapy = () => {
  const router = useRouter();
  const api = "http://localhost:3001";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdjOTM2ZjNiMTk0Mjc2NGIwNTc2ZDYiLCJpYXQiOjE3NzAxMzIwOTcsImV4cCI6MTc3MDIxODQ5N30.2HbedaIHRzK2o_emEo25l96-0J4qwaJGyqMRje4FQz0";
  async function handleTherapySesison() {
    try {
      const response = await fetch(`${api}/chat/sessions`, {
        method: "POST", // Specify the method
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Critical line for Bearer Auth
        },
        body: JSON.stringify({}), // Convert the JavaScript object to a JSON string
      });

      // Check if the request was successful (status in the 200 range)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json(); // Parse the JSON response
      router.push(`therapy/${result.sessionId}`);
    } catch (error) {
      console.error("Error:", error); // Handle network errors or HTTP errors
    }
  }

  return (
    <div
      onClick={handleTherapySesison}
      className="col-span-2 bg-green-500 p-4 rounded-lg text-white cursor-pointer"
    >
      <h4>Start Therapy</h4>
      <p className="text-gray-500">Begin a new session</p>
    </div>
  );
};

export default StartTherapy;
