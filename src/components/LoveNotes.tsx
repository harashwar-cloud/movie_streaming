import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, Sparkles, StickyNote } from 'lucide-react';
import { getUsername } from '../services/api';

interface LoveNote {
  id: string;
  author: string;
  content: string;
  date: string;
  color: string;
  emoji: string;
}

export const LoveNotes: React.FC = () => {
  const username = getUsername() || 'Harashwar';
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');

  const emojis = ['❤️', '💖', '💕', '🥰', '😘', '🌹', '✨', '👑'];
  const colors = [
    'from-pink-950/60 to-pink-900/40 border-pink-500/30 text-pink-200',
    'from-purple-950/60 to-purple-900/40 border-purple-500/30 text-purple-200',
    'from-rose-950/60 to-rose-900/40 border-rose-500/30 text-rose-200',
  ];

  useEffect(() => {
    const saved = localStorage.getItem('love_stream_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default initial notes
      const initial: LoveNote[] = [
        {
          id: '1',
          author: 'Harashwar',
          content: 'Dharunya, watching movies with you is my absolute favorite place to be. You make every frame feel magical! ❤️',
          date: 'August 7, 2026',
          color: colors[0],
          emoji: '❤️',
        },
        {
          id: '2',
          author: 'Dharunya',
          content: 'Harashwar, thank you for building this whole world for us! I love you more and more every single day. 🥰',
          date: 'August 7, 2026',
          color: colors[1],
          emoji: '🥰',
        },
      ];
      setNotes(initial);
      localStorage.setItem('love_stream_notes', JSON.stringify(initial));
    }
  }, []);

  const saveNotes = (updated: LoveNote[]) => {
    setNotes(updated);
    localStorage.setItem('love_stream_notes', JSON.stringify(updated));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote: LoveNote = {
      id: Date.now().toString(),
      author: username,
      content: newNoteContent.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: selectedEmoji,
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    setNewNoteContent('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-pink-950/20 border border-pink-500/20 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 font-['Outfit']">
            <StickyNote className="w-6 h-6 text-pink-400" />
            Love Notes & Diary 💌
          </h2>
          <p className="text-xs text-pink-200/70 mt-1">
            Leave sweet secret notes for each other to discover anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-pink-500/10 px-4 py-2 rounded-2xl border border-pink-500/20 text-pink-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Only visible to Harashwar & Dharunya</span>
        </div>
      </div>

      {/* Note Creator Form */}
      <form onSubmit={handleAddNote} className="glass-love p-6 rounded-3xl space-y-4 shadow-xl">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder={`Write something sweet for ${username.toLowerCase().includes('dharunya') ? 'Harashwar' : 'Dharunya'}... ❤️`}
          className="w-full p-4 bg-[#09060F]/80 border border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl text-sm text-white placeholder-pink-300/40 outline-none resize-none h-28 transition-all"
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-pink-300/70 font-medium mr-2">Stamp Emoji:</span>
            {emojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setSelectedEmoji(em)}
                className={`p-1.5 rounded-xl text-lg transition-transform ${
                  selectedEmoji === em ? 'bg-pink-500/30 scale-125 ring-1 ring-pink-400' : 'hover:scale-110 opacity-70'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!newNoteContent.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-600/30 transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
            Post Love Note
          </button>
        </div>
      </form>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-3xl bg-gradient-to-br ${note.color} border shadow-xl backdrop-blur-md relative flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{note.emoji}</span>
                    <span className="text-xs font-extrabold tracking-wider uppercase text-white font-['Outfit']">
                      From {note.author}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-pink-300/40 hover:text-red-400 hover:bg-pink-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-white font-medium italic">
                  "{note.content}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-pink-200/60 font-mono">
                <span>With Endless Love</span>
                <span>{note.date}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
