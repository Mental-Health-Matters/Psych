// components/AppointmentConfirmationModal.tsx
import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MessageSquare, X } from "lucide-react";

interface ConfirmationPage {
  doctorName: string;
  selectedDate: string;
  selectedTime: string;
  fee: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmationPage({
  doctorName,
  selectedDate,
  selectedTime,
  fee,
  onClose,
  onConfirm,
}: ConfirmationPage) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">Confirm Appointment</h3>
          <button onClick={onClose}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            You're about to book an appointment with{" "}
            <span className="font-medium">{doctorName}</span>
          </p>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-[#4A90E2]" />
              <span>Date: {selectedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-[#4A90E2]" />
              <span>Time: {selectedTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare size={16} className="text-[#4A90E2]" />
              <span>Fee: ${fee}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
