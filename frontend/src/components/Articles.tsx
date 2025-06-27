import React from 'react';
import { motion } from 'framer-motion';
import { User, Clock, ArrowRight } from 'lucide-react';

export default function Articles() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <ArticleCard
        title="Understanding the Pillars of Mental Wellness"
        summary="Explore the core pillars—like emotional, physical, and social wellness—that sustain mental health and life balance."
        author="Dr. Priya Kapoor"
        date="Jun 5, 2025"
        image="https://thumbs.dreamstime.com/b/circular-wellness-wheel-seven-colored-segments-each-labeled-nonsensical-altered-terms-colors-range-red-orange-382404482.jpg"
      />
      <ArticleCard
        title="Pathways to Mental Wellness: Activity, Rest & Connection"
        summary="Discover four holistic strategies—creativity, nourishment, rest, and meaning—that support mental well-being every day."
        author="Emily Santos"
        date="May 20, 2025"
        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrzHbOWXAMQ13jiU_XEZXMpeQduRLLL6Penw&s"
      />

      <ArticleCard
        title="Building Resilience Through Everyday Mindfulness"
        summary="A practical guide to integrating mindfulness practices into daily routines to reduce stress and build emotional resilience."
        author="Aisha Khan"
        date="Jun 20, 2025"
        image="https://blogs.resiliencyprogram.com/wp-content/uploads/2024/07/8.-Mindfulness-and-meditation-1.jpg"
      />



    </div>
  );
}

function ArticleCard({ title, summary, author, date, image }: {
  title: string;
  summary: string;
  author: string;
  date: string;
  image: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-lg overflow-hidden group">
      <div className="h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#4A90E2] mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{summary}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <User size={16} />
            <span>{author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span>{date}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ x: 5 }}
          className="text-[#4A90E2] mt-4 flex items-center space-x-1 text-sm font-medium cursor-pointer"
        >
          <span>Read more</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
