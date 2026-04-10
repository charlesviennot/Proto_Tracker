import { useState } from 'react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
import { Activity, Brain, Heart, Waves } from 'lucide-react';
import { playSubtleWoosh, playCloseSound } from '../utils/sound';

const points = [
  { id: 'freq', icon: Waves, label: '40–80 Hz', title: 'Mechanical Stimulation', content: '40–80 Hz vibrations activate somatosensory receptors within skin and soft tissue. Over 15+ years of research and development in Switzerland, AudioVitality Sounds® technology has been engineered to deliver targeted low-frequency vibroacoustic stimulation in a controlled and reproducible manner.' },
  { id: 'receptors', icon: Activity, label: 'Receptors', title: 'Sensory Receptors', content: 'Low-frequency vibration activates cutaneous mechanoreceptors (including Meissner and Merkel corpuscles). This mechanical input is translated into measurable parasympathetic activation.' },
  { id: 'vagus', icon: Brain, label: 'Vagus Nerve', title: 'Neural Transmission', content: 'Signals propagate via spinal pathways to the brainstem and cortical structures. Vagal activation promotes parasympathetic dominance.' },
  { id: 'hrv', icon: Heart, label: 'HRV', title: 'Physiological Outcome', content: 'Increased HRV, reduced sympathetic tone, and enhanced recovery markers. Reflected by increases in Heart Rate Variability (HRV), a recognized biomarker of autonomic balance and recovery readiness.' },
];

export function Mechanism() {
  const [activePoint, setActivePoint] = useState<any>(null);

  return (
    <section id="mechanism" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] tracking-tight mb-4">Mechanism of Action</h2>
          <p className="text-xl text-[#86868B] max-w-2xl mx-auto">A precise interaction between sound and human physiology.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: Clean Abstract Visual */}
          <div className="relative aspect-square w-full max-w-md mx-auto bg-[#F5F5F7] rounded-[3rem] shadow-[inset_0_0_50px_rgba(0,0,0,0.02)] flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-[3rem] pointer-events-none" />
            
            <div className="grid grid-cols-2 gap-6 w-full h-full relative z-10">
              {points.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.button
                    key={point.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: '#ffffff' }}
                    onClick={() => {
                      playSubtleWoosh();
                      setActivePoint(point);
                    }}
                    className="bg-white/60 backdrop-blur-md border border-white shadow-sm rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-[#1D1D1F] hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <span className="font-medium tracking-tight">{point.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right: Contextual Info */}
          <div className="flex flex-col justify-center">
            <h3 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] mb-6">
              From vibration to recovery.
            </h3>
            <p className="text-[#424245] text-lg leading-relaxed mb-8">
              Our system delivers calibrated low-frequency vibroacoustic stimulation (40–80 Hz) in a controlled environment. Click the elements to explore the science behind each step.
            </p>
            <div className="bg-[#F5F5F7] rounded-3xl p-8 border border-black/5">
              <p className="text-[#86868B] text-sm font-medium uppercase tracking-widest mb-2">Did You Know?</p>
              <p className="text-[#1D1D1F] font-medium">
                The shift to the parasympathetic nervous system is objectively measurable through Heart Rate Variability (HRV), a gold-standard biomarker.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!activePoint} onClose={() => {
        playCloseSound();
        setActivePoint(null);
      }} title={activePoint?.title}>
        <div className="space-y-4 text-[#424245] leading-relaxed">
          <p className="text-lg text-[#1D1D1F]">{activePoint?.content}</p>
          {activePoint?.id === 'freq' && (
            <>
              <p><strong className="text-[#1D1D1F]">Acoustic Mechanotransduction:</strong> Low-frequency sound waves (20-120Hz) possess unique physical properties that allow them to penetrate deep into human tissue, bypassing the limitations of superficial thermal or manual therapies.</p>
              <p>When these specific frequencies enter the body, they convert acoustic energy into mechanical cellular signaling. This process, known as mechanotransduction, triggers a cascade of biochemical responses at the cellular level, promoting vasodilation, reducing localized inflammation, and accelerating the clearance of metabolic waste.</p>
            </>
          )}
          {activePoint?.id === 'receptors' && (
            <>
              <p><strong className="text-[#1D1D1F]">Targeting Mechanoreceptors:</strong> The human body is equipped with specialized sensory receptors designed to detect vibration and pressure. AudioVitality specifically targets <em className="text-[#1D1D1F]">Pacinian corpuscles</em> (sensitive to 20-400Hz) and <em className="text-[#1D1D1F]">Meissner's corpuscles</em> (sensitive to 10-50Hz).</p>
              <p>By delivering precise acoustic signatures that match the resonant frequencies of these receptors, the technology efficiently depolarizes the nerve endings. This generates afferent signals that travel to the central nervous system, effectively "overriding" nociceptive (pain) signals and inducing profound muscular relaxation.</p>
            </>
          )}
          {activePoint?.id === 'vagus' && (
            <>
              <p><strong className="text-[#1D1D1F]">Autonomic Neuromodulation:</strong> The Vagus Nerve (Cranial Nerve X) is the primary superhighway of the parasympathetic nervous system, responsible for the "rest and digest" state.</p>
              <p>Acoustic vibrations applied to the torso and specific neural pathways stimulate the afferent fibers of the vagus nerve. This stimulation travels to the brainstem (Nucleus Tractus Solitarius), which in turn downregulates sympathetic ("fight or flight") overdrive. The result is a rapid reduction in systemic stress markers, lowered cortisol levels, and a shift towards an anabolic, recovery-focused physiological state.</p>
            </>
          )}
          {activePoint?.id === 'hrv' && (
            <>
              <p><strong className="text-[#1D1D1F]">The Ultimate Biomarker:</strong> Heart Rate Variability (HRV) measures the variation in time between consecutive heartbeats. It is the gold standard, non-invasive metric for assessing the balance of the Autonomic Nervous System.</p>
              <p>A high HRV indicates a resilient, adaptable system dominated by parasympathetic activity. Clinical trials demonstrate that AudioVitality sessions consistently produce acute and sustained increases in HRV. By mechanically stimulating the vagal tone, the therapy forces the body out of stress-induced sympathetic lock, optimizing the cardiovascular system for recovery and peak performance.</p>
            </>
          )}
        </div>
      </Modal>
    </section>
  );
}
