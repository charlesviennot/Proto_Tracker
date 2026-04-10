import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { Technology } from './components/Technology';
import { Mechanism } from './components/Mechanism';
import { ClinicalLab } from './components/ClinicalLab';
import { Studio3D } from './components/Studio3D';
import { Safety } from './components/Safety';
import { Ecosystem } from './components/Ecosystem';
import { References } from './components/References';
import { Roadmap } from './components/Roadmap';
import { Footer } from './components/Footer';
import { motion } from 'motion/react';

function Navigation() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-6 px-4 pointer-events-none"
    >
      <div className="bg-[#E5E5EA]/80 backdrop-blur-xl border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto">
        <div className="font-semibold tracking-tight text-[#1D1D1F] mr-4">AudioVitality</div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#86868B]">
          <a href="#hero" className="hover:text-[#1D1D1F] transition-colors">Home</a>
          <a href="#introduction" className="hover:text-[#1D1D1F] transition-colors">Paradigm</a>
          <a href="#technology" className="hover:text-[#1D1D1F] transition-colors">Technology</a>
          <a href="#mechanism" className="hover:text-[#1D1D1F] transition-colors">Mechanism</a>
          <a href="#lab" className="hover:text-[#1D1D1F] transition-colors">Evidence</a>
          <a href="#studio" className="hover:text-[#1D1D1F] transition-colors">The Pod</a>
          <a href="#safety" className="hover:text-[#1D1D1F] transition-colors">Safety</a>
          <a href="#roadmap" className="hover:text-[#1D1D1F] transition-colors">Roadmap</a>
        </div>
      </div>
    </motion.nav>
  );
}

export default function App() {
  return (
    <div className="bg-[#F5F5F7] min-h-screen text-[#1D1D1F] font-sans selection:bg-[#1D1D1F] selection:text-white">
      <Navigation />
      <main>
        <Hero />
        <Introduction />
        <Technology />
        <Mechanism />
        <ClinicalLab />
        <Studio3D />
        <Ecosystem />
        <Safety />
        <References />
        <Roadmap />
      </main>
      <Footer />
    </div>
  );
}
