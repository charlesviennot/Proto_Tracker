import React from 'react';

interface PainScaleProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export const PainScale: React.FC<PainScaleProps> = ({ value, onChange, label }) => {
  const getPainColor = (num: number, active: boolean) => {
    const baseClasses = "w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-sm sm:text-lg transition-all flex items-center justify-center cursor-pointer shrink-0";
    
    const colorMap: Record<number, { active: string, inactive: string }> = {
      0: { active: 'bg-green-500 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-green-500', inactive: 'bg-green-500/20 text-green-700 hover:bg-green-500/40' },
      1: { active: 'bg-green-400 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-green-400', inactive: 'bg-green-400/20 text-green-700 hover:bg-green-400/40' },
      2: { active: 'bg-lime-400 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-lime-400', inactive: 'bg-lime-400/20 text-lime-700 hover:bg-lime-400/40' },
      3: { active: 'bg-yellow-300 text-yellow-900 shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-yellow-300', inactive: 'bg-yellow-300/20 text-yellow-700 hover:bg-yellow-300/40' },
      4: { active: 'bg-yellow-400 text-yellow-900 shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-yellow-400', inactive: 'bg-yellow-400/20 text-yellow-700 hover:bg-yellow-400/40' },
      5: { active: 'bg-amber-400 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-amber-400', inactive: 'bg-amber-400/20 text-amber-700 hover:bg-amber-400/40' },
      6: { active: 'bg-orange-400 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-orange-400', inactive: 'bg-orange-400/20 text-orange-700 hover:bg-orange-400/40' },
      7: { active: 'bg-orange-500 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-orange-500', inactive: 'bg-orange-500/20 text-orange-700 hover:bg-orange-500/40' },
      8: { active: 'bg-red-400 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-red-400', inactive: 'bg-red-400/20 text-red-700 hover:bg-red-400/40' },
      9: { active: 'bg-red-500 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-red-500', inactive: 'bg-red-500/20 text-red-700 hover:bg-red-500/40' },
      10: { active: 'bg-red-600 text-white shadow-lg scale-110 z-10 ring-2 ring-offset-2 ring-red-600', inactive: 'bg-red-600/20 text-red-700 hover:bg-red-600/40' },
    };
  
    return `${baseClasses} ${active ? colorMap[num].active : colorMap[num].inactive}`;
  };

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-gray-400 uppercase mb-3">{label}</label>}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 mb-4 px-1 uppercase tracking-wider">
          <span>0 - Aucune</span>
          <span>10 - Insupportable</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={getPainColor(num, value === num)}
              style={{ minWidth: '2.5rem' }}
              type="button"
            >
              {num}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-2xl sm:text-3xl mt-5 px-2 opacity-80">
          <span title="Aucune douleur">😄</span>
          <span title="Douleur modérée">😐</span>
          <span title="Douleur insupportable">😭</span>
        </div>
      </div>
    </div>
  );
};
