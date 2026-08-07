import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  rotation: number;
  symbol: string;
}

export const HeartCursor: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const symbols = ['❤️', '💖', '💕', '✨', '🌹', '🥰'];

    const handleClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      // Spawn 8-12 flying heart particles bursting outwards & upwards from click point
      const count = 10;
      const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
        const distance = Math.random() * 60 + 40;
        return {
          id: Date.now() + i + Math.random(),
          x: clickX,
          y: clickY,
          targetX: clickX + Math.cos(angle) * distance,
          targetY: clickY + Math.sin(angle) * distance - (Math.random() * 60 + 30), // Float upwards
          size: Math.random() * 14 + 14,
          rotation: (Math.random() - 0.5) * 60,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
        };
      });

      setParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
      }, 1000);
    };

    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Click Heart Flying Particles Burst */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.4, x: p.x - 10, y: p.y - 10, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: 1.5,
              x: p.targetX - 10,
              y: p.targetY - 10,
              rotate: p.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="fixed top-0 left-0 text-pink-400 drop-shadow-[0_0_10px_rgba(255,79,154,0.8)]"
          >
            <span style={{ fontSize: `${p.size}px` }}>{p.symbol}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
