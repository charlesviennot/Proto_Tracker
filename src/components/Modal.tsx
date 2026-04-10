import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title?: string, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] bg-white/95 backdrop-blur-2xl border border-black/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-8 pb-4">
              <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">{title}</h3>
              <button 
                onClick={onClose} 
                className="p-2 text-[#86868B] bg-black/5 hover:bg-black/10 hover:text-[#1D1D1F] transition-colors rounded-full"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-8 pt-4 overflow-y-auto max-w-none text-[#424245]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
