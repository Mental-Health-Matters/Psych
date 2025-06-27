import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Books() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <BookCard
        title="The Body Keeps the Score"
        overview="How trauma reshapes the body and brain—and what you can do to heal."
        author="Bessel van der Kolk"
        image="https://covers.openlibrary.org/b/isbn/9780143127741-M.jpg"
      />

      <BookCard
        title="Lost Connections"
        overview="Uncovering the real causes of depression—and the unexpected solutions."
        author="Johann Hari"
        image="https://covers.openlibrary.org/b/isbn/9781632868305-M.jpg"
      />

      <BookCard
        title="Feeling Good: The New Mood Therapy"
        overview="A groundbreaking self-help work that shows how to combat depression naturally."
        author="David D. Burns"
        image="https://covers.openlibrary.org/b/isbn/9780380810338-M.jpg"
      />
    </div>
  );
}

function BookCard({ title, overview, author, image }: {
  title: string;
  overview: string;
  author: string;
  image: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-lg overflow-hidden group">
      <div className="h-auto overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#4A90E2] mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{overview}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{author}</span>
          <motion.button
            whileHover={{ x: 5 }}
            className="text-[#4A90E2] flex items-center space-x-1 text-sm font-medium"
          >
            <span>Read more</span>
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
