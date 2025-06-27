import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

export default function Events() {
  return (
    <div className="space-y-6">
      <EventCard
        title="Pathways to Mindfulness Seminar"
        details="Interactive training on mindfulness practices, breathing techniques, and guided meditation sessions."
        date="July 8, 2025"
        location="Online Webinar"
        image="https://blogimage.vantagefit.io/vfitimages/2023/10/A-girl-practicing-mindfulness-exercise.png"
      />

      <EventCard   
        title="Reclaiming Wellness Conference"
        details="BIPOC‑focused behavioral health conference with keynote speakers, resource fair, and cultural healing sessions."
        date="July 26, 2024"
        location="Prayagraj, India"
        image="https://lh3.googleusercontent.com/d1XkLWTkfdkoOK0WfW3G886pdhG7lU_lY3eawRNInORdwND4qSfx1D0lxXrQAdC9WC5f1kQvSxy-XaA2dES7smWpnuKxnDEFfhsA"
      />


    </div>
  );
}

function EventCard({ title, details, date, location, image }: {
  title: string;
  details: string;
  date: string;
  location: string;
  image: string;
}) {
  return (
    <motion.div whileHover={{ x: 5 }} className="bg-white rounded-xl shadow-lg overflow-hidden flex">
      <img src={image} alt={title} className="w-1/3 h-56 object-cover" />
      <div className="p-6 flex-1">
        <h3 className="text-xl font-bold text-[#4A90E2] mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{details}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
