import React from 'react';
import DoctorCard from './DoctorCard';
import { Doctor } from './Types';
import { motion } from 'framer-motion';
import { doctors } from './DoctorsData';

interface DoctorsListProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

export default function DoctorsList({ onSelectDoctor }: DoctorsListProps) {
  return (
    <>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-[#4A90E2] mb-2 text-center"
      >
        Book an Appointment
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 text-center mb-12"
      >
        Find and book appointments with top psychiatrists
      </motion.p>

      <div className="grid md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} onSelect={onSelectDoctor} />
        ))}
      </div>
    </>
  );
}