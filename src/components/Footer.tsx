export function Footer() {
  return (
    <footer className="bg-white text-[#1D1D1F] py-20 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-8">
          Experience Living Science.
        </h2>
        <p className="text-xl text-[#86868B] max-w-2xl mx-auto mb-12">
          Join the paradigm shift in recovery, performance, and clinical wellbeing.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button className="bg-[#1D1D1F] text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors w-full sm:w-auto">
            Request Clinical Dossier
          </button>
          <button className="bg-transparent border border-black/10 text-[#1D1D1F] px-8 py-4 rounded-full font-semibold hover:bg-black/5 transition-colors w-full sm:w-auto">
            Contact the Team
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-black/5 text-sm text-[#86868B]">
          <p>© {new Date().getFullYear()} AudioVitality. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#1D1D1F] transition-colors">Scientific Board</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
