import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const frequencyData = [
  { hz: 10, intensity: 20 },
  { hz: 20, intensity: 60 }, // Rubesa start
  { hz: 40, intensity: 100 }, // Peak
  { hz: 60, intensity: 80 },
  { hz: 80, intensity: 90 },
  { hz: 100, intensity: 50 },
  { hz: 120, intensity: 30 }, // Rubesa end
  { hz: 140, intensity: 10 },
];

export function Technology() {
  return (
    <section id="technology" className="py-24 bg-[#F5F5F7] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-black tracking-tight mb-6 transition-colors duration-300">The Rubesa™ Signature</h2>
          <p className="text-xl text-gray-600 transition-colors duration-300">A proprietary acoustic spectrum engineered for physiological resonance.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 transition-colors duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-black transition-colors duration-300">Targeted Low Frequencies</h3>
              <p className="text-gray-600 mb-6 leading-relaxed transition-colors duration-300">
                Unlike standard audio, the Rubesa™ sound matrix operates in a highly specific low-frequency bandwidth (typically 20Hz to 120Hz). These frequencies are not just heard; they are physically felt, creating a mechanical resonance that travels through bone, muscle, and fascia.
              </p>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">20Hz - 120Hz Range</div>
                <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Proprietary Waveforms</div>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={frequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hz" tick={{ fill: 'var(--chart-text)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}Hz`} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--tooltip-border)', backgroundColor: 'var(--tooltip-bg)', color: 'var(--tooltip-color)', boxShadow: 'var(--tooltip-shadow)' }}
                    formatter={(value: number) => [`Intensity`, 'Acoustic Power']}
                    labelFormatter={(label) => `${label} Hz`}
                  />
                  <Area type="monotone" dataKey="intensity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIntensity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
