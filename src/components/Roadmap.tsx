import { useState } from 'react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
import { ArrowRight } from 'lucide-react';
import { playDeepWoosh } from '../utils/sound';

export function Roadmap() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <section id="roadmap" className="py-32 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-24 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] tracking-tight mb-4">Dual-Track Strategy</h2>
          <p className="text-xl text-[#86868B] max-w-2xl mx-auto">Balancing immediate deployment with long-term clinical validation.</p>
        </motion.div>

        <div className="relative border-l-2 border-black/10 ml-4 md:ml-[50%] space-y-20">
          {/* Performance Track */}
          <div className="relative pl-8 md:pl-0">
            <div className="md:w-1/2 md:pr-16 md:text-right md:absolute md:left-0 md:top-0 md:-translate-x-full">
              <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Performance & Wellbeing</h3>
              <p className="text-[#86868B] font-medium mt-1">Immediate Market Deployment</p>
            </div>
            <div className="absolute left-[-9px] top-2 w-4 h-4 bg-white border-4 border-[#1D1D1F] rounded-full" />
            <div className="md:w-1/2 md:pl-16">
              <div 
                className="bg-[#F5F5F7] p-8 rounded-[2rem] cursor-pointer hover:bg-white border border-black/5 transition-colors group shadow-sm hover:shadow-xl"
                onClick={() => { playDeepWoosh(); setActiveModal('performance'); }}
              >
                <p className="text-[#424245] leading-relaxed">Deployed in longevity clinics, elite sport organizations, and hospitality settings.</p>
                <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] group-hover:translate-x-1 transition-transform">
                  Deep Dive <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Medical Track */}
          <div className="relative pl-8 md:pl-0">
            <div className="md:w-1/2 md:pr-16 md:text-right md:absolute md:left-0 md:top-0 md:-translate-x-full">
              <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Translational Research</h3>
              <p className="text-[#86868B] font-medium mt-1">Regulated Medical Indications</p>
            </div>
            <div className="absolute left-[-9px] top-2 w-4 h-4 bg-white border-4 border-gray-400 rounded-full" />
            <div className="md:w-1/2 md:pl-16">
              <div 
                className="bg-[#F5F5F7] p-8 rounded-[2rem] cursor-pointer hover:bg-white border border-black/5 transition-colors group shadow-sm hover:shadow-xl"
                onClick={() => { playDeepWoosh(); setActiveModal('medical'); }}
              >
                <p className="text-[#424245] leading-relaxed">Investigating tinnitus, Long COVID, stress, and inflammatory conditions.</p>
                <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] group-hover:translate-x-1 transition-transform">
                  Deep Dive <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Regulatory Track */}
          <div className="relative pl-8 md:pl-0">
            <div className="md:w-1/2 md:pr-16 md:text-right md:absolute md:left-0 md:top-0 md:-translate-x-full">
              <h3 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Regulatory Pathways</h3>
              <p className="text-[#86868B] font-medium mt-1">MDR & FDA 510(k)</p>
            </div>
            <div className="absolute left-[-9px] top-2 w-4 h-4 bg-white border-4 border-gray-300 rounded-full" />
            <div className="md:w-1/2 md:pl-16">
              <div 
                className="bg-[#F5F5F7] p-8 rounded-[2rem] cursor-pointer hover:bg-white border border-black/5 transition-colors group shadow-sm hover:shadow-xl"
                onClick={() => { playDeepWoosh(); setActiveModal('regulatory'); }}
              >
                <p className="text-[#424245] leading-relaxed">Pursuing regulatory approval for specific medical indications.</p>
                <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] group-hover:translate-x-1 transition-transform">
                  Deep Dive <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={activeModal === 'performance'} onClose={() => setActiveModal(null)} title="Immediate Market Deployment">
        <div className="space-y-4">
          <p>The AudioVitality platform is currently deployed in environments focused on physiological recovery and autonomic regulation, including longevity clinics, elite sport organizations, and hospitality settings.</p>
          <p>Operating within these markets allows the company to:</p>
          <ul className="bg-black/5 p-6 rounded-2xl list-disc list-inside space-y-2">
            <li>Generate commercial revenue</li>
            <li>Refine stimulation protocols across diverse user populations</li>
            <li>Collect large-scale physiological and usage datasets</li>
            <li>Continuously improve the platform through real-world evidence</li>
          </ul>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'medical'} onClose={() => setActiveModal(null)} title="Translational Clinical Research">
        <div className="space-y-4">
          <p>In parallel, AudioVitality collaborates with academic and clinical partners to investigate potential medical applications where autonomic dysregulation and sensory processing disturbances play a central role.</p>
          <p className="font-medium text-[#1D1D1F] mt-6">Research programs currently explore areas such as:</p>
          <ul className="bg-black/5 p-6 rounded-2xl list-disc list-inside space-y-2">
            <li>Tinnitus and auditory pathway dysregulation</li>
            <li>Post-viral dysautonomia including Long COVID</li>
            <li>Stress and burnout in corporate populations</li>
            <li>Sleep optimization and recovery physiology</li>
            <li>Microcirculatory and inflammatory conditions</li>
          </ul>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'regulatory'} onClose={() => setActiveModal(null)} title="Indication-Specific Regulatory Pathways">
        <div className="space-y-4">
          <p>Where sufficient clinical evidence emerges, AudioVitality may pursue regulatory approval for specific medical indications through established frameworks such as:</p>
          <ul className="bg-black/5 p-6 rounded-2xl list-disc list-inside space-y-2">
            <li>European Medical Device Regulation (MDR)</li>
            <li>U.S. FDA 510(k) or De Novo pathways</li>
          </ul>
          <p>Regulatory certification would apply to specific therapeutic claims, while the broader platform can continue operating within performance and wellbeing markets.</p>
          <p>This layered regulatory approach enables AudioVitality to scale commercially today while progressively unlocking higher-value clinical applications as evidence accumulates.</p>
        </div>
      </Modal>
    </section>
  );
}
