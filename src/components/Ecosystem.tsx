import { motion } from 'motion/react';
import { Smartphone, Box, Cpu } from 'lucide-react';

const ecosystemParts = [
  {
    icon: Box,
    title: "The Clinical Pod & Room",
    description: "A controlled, immersive environment engineered to deliver targeted low-frequency vibroacoustic stimulation (40–80 Hz) with absolute precision. Deployed in longevity clinics and elite sports franchises."
  },
  {
    icon: Smartphone,
    title: "The AudioVitality App",
    description: "Continuous care and sleep optimization at home or during travel. Used in our Airline Pilot studies to deliver personalized acoustic profiles that improve HRV and reduce nocturnal awakenings."
  },
  {
    icon: Cpu,
    title: "Proprietary Algorithm",
    description: "The core intelligence generating the Rubesa™ Sounds. It adapts the acoustic matrix to the user's physiological feedback, ensuring optimal mechanoreceptor activation."
  }
];

export function Ecosystem() {
  return (
    <section id="ecosystem" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] tracking-tight mb-4">The Ecosystem</h2>
          <p className="text-xl text-[#86868B] max-w-2xl mx-auto">Hardware and software working in perfect synergy.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ecosystemParts.map((part, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#F5F5F7] p-10 rounded-[2rem] border border-black/5 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-black/5">
                <part.icon className="w-7 h-7 text-[#1D1D1F]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-4 tracking-tight">{part.title}</h3>
              <p className="text-[#424245] leading-relaxed">{part.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
