import { useState } from 'react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
import { playDeepWoosh } from '../utils/sound';

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate bars for a more pronounced acoustic wave
  const bars = Array.from({ length: 40 });

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F5F5F7] transition-colors duration-300">
      {/* Premium Acoustic Vibration Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-40">
        <div className="flex items-center gap-1 md:gap-2 h-64">
          {bars.map((_, i) => {
            // Create a bell curve effect for the wave height
            const centerDist = Math.abs(i - bars.length / 2);
            const maxH = Math.max(20, 200 - centerDist * 10);
            
            return (
              <motion.div
                key={i}
                className="w-1 md:w-2 rounded-full bg-gradient-to-t from-blue-600 via-purple-500 to-orange-400"
                animate={{
                  height: ['20px', `${maxH}px`, '20px'],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Soft Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-orange-100/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-black mb-6 tracking-tighter transition-colors duration-300"
        >
          AudioVitality<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500">
            Scientific Evidence
          </span>
        </motion.h1>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-gray-600 mb-12 font-medium tracking-tight max-w-3xl mx-auto leading-snug transition-colors duration-300"
        >
          Science-backed low-frequency technology for recovery, performance, and wellbeing.
        </motion.h2>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => { playDeepWoosh(); setIsModalOpen(true); }}
          className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 hover:scale-105 transition-all shadow-lg shadow-black/10"
        >
          Deep Dive: The AudioVitality Heritage
        </motion.button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="The AudioVitality Heritage">
        <div className="space-y-4">
          <p><strong className="text-[#1D1D1F]">AudioVitality</strong> is a Swiss-developed technology platform that uses precision low-frequency sound vibrations to help the body recover faster, reduce stress, and improve sleep. Our mission is to make nervous-system recovery measurable, repeatable, and scalable across sport, corporate wellbeing, and longevity markets.</p>
          <p>Modern life creates a chronic recovery deficit. Athletes, executives, and high-performance individuals experience sustained stress, sleep disruption, and autonomic imbalance. While wearables can measure these problems, few technologies reliably improve them without medication.</p>
          <p>Our system delivers calibrated low-frequency vibroacoustic stimulation (40–80 Hz) in a controlled studio environment. During a 40-minute session, gentle sound vibrations stimulate sensory receptors in the body, activating vagal pathways that shift the nervous system from “fight-or-flight” into “rest-and-repair.” This shift is objectively measurable through Heart Rate Variability (HRV), a gold-standard biomarker of recovery readiness.</p>
        </div>
      </Modal>
    </section>
  );
}
