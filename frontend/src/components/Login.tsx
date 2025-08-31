import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import React from "react";
import LoginButton from "./LoginButton"; // 👈 Google login button
type LoginProps = {
  setModalOpen: React.Dispatch<React.SetStateAction<"register" | "login" | null>>;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function Login({ setModalOpen, setIsLoggedIn, setUserId }: LoginProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log(formData)
      const res = await axios.post("https://psych-9vpb.onrender.com/api/auth/login", formData, {
        withCredentials: true,
      });

      const { username } = res.data.user
      // Save user ID
      setUserId(username);

      // Set logged-in state
      setIsLoggedIn(true);
      setModalOpen(null);
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-xl p-8 max-w-md w-full space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Login</h3>
            <button onClick={() => setModalOpen(null)}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
            </button>
          </div>

          <div className="flex items-center my-2">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">Login with email</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <LoginButton />
          </div>

          {/* Email/password form */}
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent outline-none"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#4A90E2] text-white py-3 rounded-lg hover:bg-[#357ABD] transition-all font-medium"
            onClick={handleSubmit}
          >
            Login
          </motion.button>

          <p className="text-center text-gray-600 text-sm mt-4">
            Don't have an account?{" "}
            <button
              onClick={() => setModalOpen("register")}
              className="text-[#4A90E2] hover:underline font-medium"
            >
              Register
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}