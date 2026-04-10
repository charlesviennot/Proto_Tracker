import { motion } from 'motion/react';
import { BookOpen, Award, Building2 } from 'lucide-react';

export function References() {
  return (
    <section id="references" className="py-32 bg-[#F5F5F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] tracking-tight mb-4">Academic & Clinical Excellence</h2>
          <p className="text-xl text-[#86868B] max-w-2xl mx-auto">Backed by leading institutions and peer-reviewed science.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Partners */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2rem] shadow-xl border border-black/5"
          >
            <div className="flex items-center gap-4 mb-8">
              <Building2 className="w-8 h-8 text-[#1D1D1F]" />
              <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Clinical & Sport Partners</h3>
            </div>
            <ul className="space-y-6">
              <li className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="text-lg font-medium text-[#1D1D1F]">CHUV</span>
                <span className="text-sm text-[#86868B]">Lausanne University Hospital</span>
              </li>
              <li className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="text-lg font-medium text-[#1D1D1F]">UNIL</span>
                <span className="text-sm text-[#86868B]">University of Lausanne</span>
              </li>
              <li className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="text-lg font-medium text-[#1D1D1F]">Lausanne Sport</span>
                <span className="text-sm text-[#86868B]">Elite Football Club</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-lg font-medium text-[#1D1D1F]">Yverdon Sport</span>
                <span className="text-sm text-[#86868B]">Elite Football Club</span>
              </li>
            </ul>
          </motion.div>

          {/* Publications */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[2rem] shadow-xl text-[#1D1D1F] border border-black/5"
          >
            <div className="flex items-center gap-4 mb-8">
              <BookOpen className="w-8 h-8 text-[#1D1D1F]" />
              <h3 className="text-2xl font-semibold tracking-tight">Key Publications</h3>
            </div>
            
            <div className="bg-[#F5F5F7] p-6 rounded-2xl border border-black/5 hover:bg-gray-50 transition-colors cursor-default">
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-medium mb-2 leading-snug">Randomised Controlled Trial on Low-Frequency Vibroacoustic Stimulation</h4>
                  <p className="text-gray-500 text-sm mb-4">Frontiers in Sports and Active Living • June 2025</p>
                  <p className="text-sm text-[#424245] leading-relaxed">
                    Demonstrated a statistically significant 43% increase in global HRV and a 35% reduction in perceived muscle soreness (DOMS) at 24h post-exercise in elite athletes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
