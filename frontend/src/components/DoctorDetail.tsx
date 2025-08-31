import React, { useState } from 'react';
import axios from 'axios';

import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Languages, 
  MapPin, 
  MessageSquare, 
  Star, 
  X 
} from 'lucide-react';
import { Doctor } from './Types';
import AppointmentConfirmationModal from "./ConfirmationPage"; // adjust the path as needed



interface DoctorDetailProps {
  doctor: Doctor;
  onBack: () => void;
}

export default function DoctorDetail({ doctor, onBack }: DoctorDetailProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);


  const handleConfirmation = async () => {
    // Add your confirmation logic here
    setShowConfirmation(false)
    const data = {
      doctor,
      selectedDate,
      selectedTime
    }

    const res = await axios.post('https://psych-9vpb.onrender.com/api/appointments/confirmation', data, {
      withCredentials: true
    });

  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-[#4A90E2] mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to doctors</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 p-6 border-r border-gray-100">
            <img 
              src={doctor.image} 
              alt={doctor.name} 
              className="w-full h-64 object-cover rounded-lg"
            />
            <h2 className="text-2xl font-bold text-[#4A90E2] mt-4">{doctor.name}</h2>
            <p className="text-gray-600 font-medium">{doctor.specialization}</p>
            
            <div className="flex items-center space-x-2 mt-4">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{doctor.rating}</span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Award size={20} className="text-[#4A90E2]" />
                <span className="text-gray-600">{doctor.experience} experience</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-[#4A90E2]" />
                <span className="text-gray-600">{doctor.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Languages size={20} className="text-[#4A90E2]" />
                <span className="text-gray-600">{doctor.languages.join(", ")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare size={20} className="text-[#4A90E2]" />
                <span className="text-gray-600">Consultation fee: ${doctor.fee}</span>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">About</h3>
              <p className="text-gray-600">{doctor.about}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Education</h3>
              <ul className="space-y-2">
                {doctor.education.map((edu, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-gray-600">{edu}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Clinic Photos</h3>
              <div className="grid grid-cols-2 gap-4">
                {doctor.clinicPhotos.map((photo, index) => (
                  <img 
                    key={index}
                    src={photo} 
                    alt={`Clinic ${index + 1}`}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Book Appointment</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="p-2 border rounded-lg"
                >
                  <option value="">Select Date</option>
                  {Object.keys(doctor.availability).map((date) => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="p-2 border rounded-lg"
                  disabled={!selectedDate}
                >
                  <option value="">Select Time</option>
                  {selectedDate && doctor.availability[selectedDate].map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-3 bg-[#4A90E2] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <AppointmentConfirmationModal
          doctorName={doctor.name}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          fee={doctor.fee}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmation}
        />
      )}
    </div>
  );
}