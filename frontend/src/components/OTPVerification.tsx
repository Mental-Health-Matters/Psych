import { useState } from "react";
import axios from "axios";
import React from "react";

type OTPVerificationProps = {
  userId: string;
  setModalOpen: React.Dispatch<React.SetStateAction<"register" | "questionnaire" | "login" | "verification" | null>>;
};

export default function OTPVerification({ userId, setModalOpen }: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) setOtp(value);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("https://psych-9vpb.onrender.com/api/auth/verify-otp", 
      { userId, otp },
      { withCredentials: true });
      

      if (response.data.success) {
        setModalOpen("questionnaire");
        setOtp("");
      } else {
        setError(response.data.message || "OTP verification failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Enter the OTP</h2>
      <p className="text-gray-600 text-sm mb-4">Check your email for a 6-digit OTP code.</p>

      <input
        type="text"
        value={otp}
        onChange={handleChange}
        maxLength={6}
        className="w-full text-center tracking-widest text-2xl px-4 py-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
        placeholder="123456"
      />

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}
