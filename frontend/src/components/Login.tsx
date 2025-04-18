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
      const res = await axios.post("http://localhost:3000/api/auth/login", formData, {
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
export const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "atharwatp@gmail.com",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800",
    specialization: "Clinical Psychiatrist",
    experience: "15 years",
    location: "Manhattan Medical Center, NY",
    rating: 4.8,
    homeVisit: true,
    onlineConsult: true,
    languages: ["English", "Spanish"],
    fee: 200,
    nextAvailable: "Today",
    education: [
      "MD in Psychiatry, Harvard Medical School",
      "Fellowship in Child Psychiatry, Johns Hopkins"
    ],
    about: "Dr. Johnson specializes in anxiety, depression, and trauma therapy. With 15 years of experience, she takes a holistic approach to mental health treatment.",
    clinicPhotos: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800"
    ],
    availability: {
      "Monday": ["09:00 AM", "11:00 AM", "02:00 PM"],
      "Tuesday": ["10:00 AM", "03:00 PM", "04:00 PM"],
      "Wednesday": ["09:00 AM", "01:00 PM", "05:00 PM"]
    }
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    email: "atharwatp@gmail.com",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800",
    specialization: "Child Psychiatrist",
    experience: "12 years",
    location: "Wellness Center, Boston",
    rating: 4.9,
    homeVisit: false,
    onlineConsult: true,
    languages: ["English", "Mandarin"],
    fee: 180,
    nextAvailable: "Tomorrow",
    education: [
      "MD in Psychiatry, Stanford University",
      "Specialization in Child Psychology, UCLA"
    ],
    about: "Dr. Chen is a leading child psychiatrist with expertise in ADHD, autism spectrum disorders, and developmental challenges.",
    clinicPhotos: [
      "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1631217868274-e5b90bb7e133?auto=format&fit=crop&w=800"
    ],
    availability: {
      "Monday": ["10:00 AM", "02:00 PM"],
      "Wednesday": ["09:00 AM", "03:00 PM"],
      "Friday": ["11:00 AM", "04:00 PM"]
    }
  }
];
