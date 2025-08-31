import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import React from 'react';

type RegisterProps = {
  setModalOpen: React.Dispatch<React.SetStateAction<"register" | "questionnaire" | "login" | "verification" | null>>;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
};

export default function Register({ setModalOpen, setUserId }: RegisterProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null as File | null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Image compression function
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files?.[0] ?? null;
      if (file) {
        const validFormats = ['image/jpeg', 'image/png'];
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (!validFormats.includes(file.type)) {
          alert('Please upload an image in JPEG or PNG format.');
          return;
        }
        if (file.size > maxSize) {
          alert('The file size must be less than 2MB.');
          return;
        }
        
        // Compress image before setting
        const compressedFile = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          profilePicture: compressedFile,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          profilePicture: null,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress(0);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    // prepare form data for multipart upload
    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('username', formData.username);
    if (formData.profilePicture) {
      data.append('profilePicture', formData.profilePicture);
    }

    try {
      const res = await axios.post(
        "https://psych-9vpb.onrender.com/api/auth/register",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // 30 second timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          }
        }
      );

      const userId = res.data.userId;
      setUserId(userId);
      setModalOpen("verification");
      console.log("Registration successful:", res.data);
    } catch (err: any) {
      console.error("Registration error:", err.response?.data || err.message);
      if (err.code === 'ECONNABORTED') {
        alert("Request timed out. Please try again.");
      } else {
        alert(err.response?.data?.message || "Registration failed.");
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) setModalOpen(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white p-8 max-w-md w-full max-h-[93vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <br />
            <h3 className="text-2xl font-bold">Create Account</h3>
            <button
              onClick={() => !isLoading && setModalOpen(null)}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-800" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Profile Picture (JPEG/PNG, Max 2MB)
              </label>
              <input
                type="file"
                name="profilePicture"
                accept="image/jpeg,image/png"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Progress bar */}
            {isLoading && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account? {' '}<button
                type="button"
                onClick={() => !isLoading && setModalOpen("login")}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}