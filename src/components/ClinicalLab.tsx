import { useState } from 'react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, LineChart, Line } from 'recharts';
import { playSubtleWoosh, playCloseSound } from '../utils/sound';

// Data from Page 10 of the PDF
const comparisonData = [
  { name: 'Cryotherapy', value: 5, fill: '#86868B' },
  { name: 'Massage', value: 15, fill: '#86868B' },
  { name: 'Active Recovery', value: 10, fill: '#86868B' },
  { name: 'Cold Water', value: 35, fill: '#86868B' },
  { name: 'AudioVitality', value: 43, fill: 'url(#colorGradient)' },
];

// Data from Page 14 of the PDF
const studiesData = [
  { name: 'RCT CHUV', value: 43 },
  { name: 'Lausanne Sport 24', value: 31.3 },
  { name: 'Yverdon Sport', value: 25 },
  { name: 'LS 25/26', value: 37 },
  { name: 'Airline Pilot', value: 21 },
];

const sleepData = [
  { metric: 'Deep Sleep', baseline: 15, audioVitality: 22 },
  { metric: 'REM Sleep', baseline: 20, audioVitality: 25 },
  { metric: 'Awakenings', baseline: 4, audioVitality: 1 },
];

const medicalData = [
  { week: 'Week 0', painScore: 8.2 },
  { week: 'Week 1', painScore: 6.5 },
  { week: 'Week 2', painScore: 5.0 },
  { week: 'Week 3', painScore: 4.1 },
  { week: 'Week 4', painScore: 2.8 },
];

export function ClinicalLab() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="lab" className="py-32 bg-[#F5F5F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] tracking-tight mb-4">The Lab</h2>
          <p className="text-xl text-[#86868B] max-w-2xl mx-auto">Clinical evidence and physiological data.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Chart 1: HRV Response by Recovery Modality */}
          <motion.div 
            className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-2">HRV Response by Recovery Modality</h3>
            <p className="text-[#86868B] text-sm font-medium mb-8">Single-Session Comparison (vs. Baseline %)</p>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="50%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5EA" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1D1D1F', fontSize: 12, fontWeight: 500 }} width={100} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`+${value}%`, 'HRV Improvement']}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="right" formatter={(val: number) => `+${val}%`} fill="#1D1D1F" fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 2: HRV Improvement Across Completed Studies */}
          <motion.div 
            className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-2">Consistent Signal</h3>
            <p className="text-[#86868B] text-sm font-medium mb-8">HRV Improvement Across Completed Studies</p>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studiesData} margin={{ top: 20, right: 5, left: -20, bottom: 25 }}>
                  <defs>
                    <linearGradient id="colorGradientVertical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 11 }} angle={-25} textAnchor="end" dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: '#F5F5F7'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`+${value}%`, 'HRV Improvement']}
                  />
                  <Bar dataKey="value" fill="url(#colorGradientVertical)" radius={[8, 8, 0, 0]} barSize={40}>
                    <LabelList dataKey="value" position="top" formatter={(val: number) => `+${val}%`} fill="#1D1D1F" fontSize={12} fontWeight={600} dy={-5} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sport Card */}
          <motion.div 
            className="bg-white rounded-[2rem] p-8 relative overflow-hidden group cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02] flex flex-col"
            onClick={() => {
              playSubtleWoosh();
              setActiveModal('sport');
            }}
          >
            <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-1">Sport Performance</h3>
            <p className="text-[#86868B] text-sm font-medium mb-auto">CHUV RCT Study</p>
            
            <div className="h-32 flex items-center justify-center my-6">
              <div className="text-center">
                <div className="text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 tracking-tighter">+43%</div>
                <div className="text-sm font-medium text-[#86868B] uppercase tracking-wider">Global HRV</div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button className="text-sm font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-4 py-2 rounded-full group-hover:bg-[#E5E5EA] transition-colors">
                Deep Dive
              </button>
            </div>
          </motion.div>

          {/* Sleep Card */}
          <motion.div 
            className="bg-white rounded-[2rem] p-8 group cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02] flex flex-col"
            onClick={() => {
              playSubtleWoosh();
              setActiveModal('sleep');
            }}
          >
            <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-1">Sleep Optimization</h3>
            <p className="text-[#86868B] text-sm font-medium mb-auto">Airline Pilot Study</p>
            
            <div className="h-48 flex items-center justify-center my-8">
              <div className="text-center">
                <div className="text-7xl font-light text-[#1D1D1F] mb-2 tracking-tighter">-38%</div>
                <div className="text-sm font-medium text-[#86868B] uppercase tracking-wider">Nocturnal Awakenings</div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="text-sm font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-4 py-2 rounded-full group-hover:bg-[#E5E5EA] transition-colors">
                Deep Dive
              </button>
            </div>
          </motion.div>

          {/* Medical Card */}
          <motion.div 
            className="bg-white rounded-[2rem] p-8 group cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02] flex flex-col"
            onClick={() => {
              playSubtleWoosh();
              setActiveModal('medical');
            }}
          >
            <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight mb-1">Medical Translation</h3>
            <p className="text-[#86868B] text-sm font-medium mb-auto">Long COVID & Tinnitus</p>
            
            <div className="h-48 flex items-center justify-center my-8">
              <div className="text-center">
                <div className="text-7xl font-light text-[#1D1D1F] mb-2 tracking-tighter">191</div>
                <div className="text-sm font-medium text-[#86868B] uppercase tracking-wider">Patients Treated</div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="text-sm font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-4 py-2 rounded-full group-hover:bg-[#E5E5EA] transition-colors">
                Deep Dive
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'sport'} onClose={() => {
        playCloseSound();
        setActiveModal(null);
      }} title="CHUV RCT Study Data">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-[#1D1D1F] mb-2">Randomised Controlled Trial (CHUV / UNIL) – Published</h4>
            <p>In collaboration with CHUV (Lausanne University Hospital) and UNIL (University of Lausanne), we conducted the first randomized controlled trial on our technology. Results published in Frontiers in Sports and Active Living (June 2025) demonstrate exceptional parasympathetic activation after a single 40-minute session.</p>
          </div>
          <div className="bg-[#F5F5F7] p-6 rounded-2xl text-[#424245]">
            <h5 className="font-semibold text-[#1D1D1F] mb-3">Study Design</h5>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li><strong className="text-[#1D1D1F]">Design:</strong> Randomised, within-subject crossover</li>
              <li><strong className="text-[#1D1D1F]">N:</strong> 27 healthy, physically active men (18–40 years)</li>
              <li><strong className="text-[#1D1D1F]">Intervention:</strong> 40-minute LFV session (40–80 Hz fundamentals + harmonics)</li>
              <li><strong className="text-[#1D1D1F]">Control:</strong> no-vibration (silence) condition in identical environment</li>
              <li><strong className="text-[#1D1D1F]">Measurements:</strong> Polar H10 + Kubios HRV analysis at 6 time points</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-[#1D1D1F] mb-3">Key Results</h5>
            <ul className="space-y-2 list-disc list-inside">
              <li>+166% (LF+HF)/HR increase at 30 min post-LFV vs. +121% after no-vibration.</li>
              <li>+43% global HRV score improvement in LFV condition.</li>
              <li>Controlled autonomic challenge: LFV produced an acute drop in LnRMSSD during session, followed by a stronger vagal recovery response.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'sleep'} onClose={() => {
        playCloseSound();
        setActiveModal(null);
      }} title="Airline Pilot Sleep Study">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-[#1D1D1F] mb-2">Long-term App effects</h4>
            <p>To evaluate the effects of low-frequency sound stimulation on sleep quality improvement following jet lag in an airline pilot.</p>
          </div>
          <div className="bg-[#F5F5F7] p-6 rounded-2xl text-[#424245]">
            <h5 className="font-semibold text-[#1D1D1F] mb-3">Method</h5>
            <p className="text-sm">During a 4-day baseline, sleep data and HRV were continuously monitored using a Whoop device. A first 32-day phase followed, during which the pilot completed 7 flights with an average time-zone shift of 6 hours. The pilot listened to low-frequency sounds through the AudioVitality App, averaging 187 minutes per week. A second 32-day phase was then conducted under identical conditions but without the use of AudioVitality sounds.</p>
          </div>
          <div>
            <h5 className="font-semibold text-[#1D1D1F] mb-3">Results</h5>
            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                  <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="baseline" name="Baseline" fill="#E5E5EA" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="audioVitality" name="With AudioVitality" fill="#9333ea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-[#1D1D1F]">21%</strong> improvement in HRV</li>
              <li><strong className="text-[#1D1D1F]">38%</strong> reduction in night-time awakenings</li>
              <li><strong className="text-[#1D1D1F]">15%</strong> increase in sleep efficiency</li>
              <li><strong className="text-[#1D1D1F]">12%</strong> improvement in recovery index</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'medical'} onClose={() => {
        playCloseSound();
        setActiveModal(null);
      }} title="Medical Translation Studies">
        <div className="space-y-8">
          <div>
            <h4 className="text-lg font-semibold text-[#1D1D1F] mb-2">Long COVID Study</h4>
            <p>Post-COVID Dysautonomia: Restoring Autonomic Balance.</p>
            <ul className="mt-3 space-y-2 text-sm bg-[#F5F5F7] p-4 rounded-xl text-[#424245] list-disc list-inside">
              <li><strong className="text-[#1D1D1F]">N = 20</strong> participants with confirmed Long COVID (&gt;12 weeks post-infection).</li>
              <li><strong className="text-[#1D1D1F]">Intervention:</strong> 10 sessions over 5 weeks.</li>
              <li><strong className="text-[#1D1D1F]">Primary endpoints:</strong> HRV metrics (RMSSD, LF/HF ratio).</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-[#1D1D1F] mb-2">Pain Reduction Trajectory</h4>
            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={medicalData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="painScore" name="VAS Pain Score" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm mt-4 text-gray-500"><em>Visual Analog Scale (VAS) pain scores tracked over a 4-week protocol (2 sessions/week). Average pain reduction from 8.2 (Severe) to 2.8 (Mild).</em></p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-[#1D1D1F] mb-2">Tinnitus Clinical Experience</h4>
            <p>191 patients treated (observational data). Outcomes tracked: THI + subjective improvement scales.</p>
            <div className="mt-3 bg-[#F5F5F7] p-4 rounded-xl text-[#424245]">
              <p className="font-medium text-[#1D1D1F] mb-2 text-sm">Mechanism hypothesis: LFV may...</p>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>Modulate auditory processing via cross-modal sensory integration.</li>
                <li>Reduce central hyperactivity associated with tinnitus.</li>
                <li>Activate parasympathetic pathways.</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
}
