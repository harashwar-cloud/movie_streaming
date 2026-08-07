import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, Camera } from 'lucide-react';
import { LOVE_IMAGES } from '../assets/loveImages';

interface MemoryItem {
  id: number;
  image: string;
  title: string;
  date: string;
  location: string;
  caption: string;
  tag: string;
}

export const MemoriesGallery: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const memories: MemoryItem[] = [
    {
      id: 1,
      image: LOVE_IMAGES.kissing,
      title: 'Our Precious Kiss ❤️',
      date: 'August 7, 2026',
      location: 'Our Special Place',
      caption: 'The moment time stood still. My heart will forever belong to you.',
      tag: 'Love Story',
    },
    {
      id: 2,
      image: LOVE_IMAGES.handHolding,
      title: 'Holding Your Hand Forever 🤝',
      date: 'July 14, 2026',
      location: 'Sunset Walk',
      caption: 'In your hands, I found my safe haven. Never letting go.',
      tag: 'Romance',
    },
    {
      id: 3,
      image: LOVE_IMAGES.landscape,
      title: 'Watching Sunsets Together 🌅',
      date: 'June 28, 2026',
      location: 'Lakeside View',
      caption: 'Every sunset is prettier when I am standing next to you.',
      tag: 'Travel',
    },
    {
      id: 4,
      image: LOVE_IMAGES.coupleMoment,
      title: 'Cozy Movie Night 🍿',
      date: 'May 19, 2026',
      location: 'LoveStream Theater',
      caption: 'Wrapped in blankets, sharing popcorn and endless laughter.',
      tag: 'Movie Night',
    },
    {
      id: 5,
      image: LOVE_IMAGES.man,
      title: 'Harashwar ❤️',
      date: 'Forever & Always',
      location: 'In Dharunya’s Heart',
      caption: 'The king of my heart and the protector of my happiness.',
      tag: 'Profiles',
    },
    {
      id: 6,
      image: LOVE_IMAGES.girl,
      title: 'Dharunya ❤️',
      date: 'Forever & Always',
      location: 'In Harashwar’s Heart',
      caption: 'The queen of my world and the sweetest smile ever created.',
      tag: 'Profiles',
    },
  ];

  const filters = ['All', 'Love Story', 'Romance', 'Movie Night', 'Profiles'];

  const filteredMemories = activeFilter === 'All' 
    ? memories 
    : memories.filter((m) => m.tag === activeFilter);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 border border-pink-500/20 shadow-2xl">
        <img
          src={LOVE_IMAGES.landscape}
          alt="Love Memories Banner"
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09060F] via-[#09060F]/80 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-4">
            <Camera className="w-3.5 h-3.5" />
            Harashwar ❤️ Dharunya Memory Wall
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            Our Digital Love Diary ✨
          </h2>
          <p className="text-sm text-pink-200/80 mt-2 leading-relaxed">
            Every photo holds a thousand unwritten love letters. Capturing every laughter, kiss, and synchronized movie party we share.
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-105'
                : 'bg-pink-950/30 border border-pink-500/15 text-pink-300/70 hover:text-white hover:border-pink-500/30'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid of Polaroid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="group relative bg-[#140C20]/90 border border-pink-500/20 rounded-3xl p-4 shadow-xl hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 transition-all hover:-translate-y-2 flex flex-col justify-between"
          >
            {/* Polaroid Frame Image Container */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-pink-950/40">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Heart Badge */}
              <div className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-pink-500/30 text-pink-400 group-hover:bg-pink-600 group-hover:text-white transition-all">
                <Heart className="w-4 h-4 fill-current" />
              </div>

              {/* Tag Pill */}
              <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-pink-600/80 backdrop-blur-md text-white">
                {item.tag}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors font-['Outfit']">
                {item.title}
              </h3>
              <p className="text-xs text-pink-200/70 line-clamp-2 leading-relaxed italic">
                "{item.caption}"
              </p>

              <div className="pt-3 border-t border-pink-500/10 flex items-center justify-between text-[11px] text-pink-300/60 font-mono">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
