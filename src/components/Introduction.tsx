import { motion } from 'motion/react';

export function Introduction() {
  return (
    <section id="introduction" className="py-24 bg-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-black tracking-tight mb-6 transition-colors duration-300">The Paradigm Shift</h2>
          <p className="text-xl text-gray-600 transition-colors duration-300">Moving beyond traditional chemical and thermal recovery methods.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#F5F5F7] p-10 rounded-[2rem] transition-colors duration-300"
          >
            <h3 className="text-2xl font-semibold mb-4 text-black transition-colors duration-300">Traditional Limits</h3>
            <ul className="space-y-4 text-gray-600 transition-colors duration-300">
              <li className="flex items-start"><span className="mr-3 text-orange-500">✕</span> Chemical interventions carry systemic side effects.</li>
              <li className="flex items-start"><span className="mr-3 text-orange-500">✕</span> Thermal therapies (cryo/heat) offer superficial penetration.</li>
              <li className="flex items-start"><span className="mr-3 text-orange-500">✕</span> Massage therapy is highly operator-dependent.</li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2rem] text-black border border-black/5 shadow-xl transition-colors duration-300"
          >
            <h3 className="text-2xl font-semibold mb-4 transition-colors duration-300">Acoustic Mechanotransduction</h3>
            <ul className="space-y-4 text-gray-600 transition-colors duration-300">
              <li className="flex items-start"><span className="mr-3 text-blue-400">✓</span> Deep cellular penetration via low-frequency sound waves.</li>
              <li className="flex items-start"><span className="mr-3 text-blue-400">✓</span> Direct stimulation of the Autonomic Nervous System.</li>
              <li className="flex items-start"><span className="mr-3 text-blue-400">✓</span> 100% reproducible, non-invasive, and operator-independent.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
