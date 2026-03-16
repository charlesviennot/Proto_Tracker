import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface PainScaleProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export const PainScale: React.FC<PainScaleProps> = ({ value, onChange, label }) => {
  // Internal value from 0 to 100 (representing the 100mm scale)
  const [internalValue, setInternalValue] = useState(value * 10 || 0);
  const [hasChanged, setHasChanged] = useState(false);
  const [isValidated, setIsValidated] = useState(true);

  useEffect(() => {
    setInternalValue(value * 10 || 0);
    setHasChanged(false);
    setIsValidated(true);
  }, [value]);

  const handleValidate = () => {
    onChange(internalValue / 10);
    setHasChanged(false);
    setIsValidated(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(parseInt(e.target.value));
    setHasChanged(true);
    setIsValidated(false);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-gray-400 uppercase mb-3">{label}</label>}
      <div className={`bg-white p-6 rounded-3xl border transition-colors ${hasChanged ? 'border-amber-300 shadow-md' : 'border-gray-100 shadow-sm'}`}>
        
        <div className="relative pt-2 pb-6">
          <div className="flex justify-between text-sm font-bold text-gray-600 mb-8 px-1">
            <span className="flex items-center gap-2">😄 0 - Aucune douleur</span>
            <span className="flex items-center gap-2">10 - Insupportable 😭</span>
          </div>
          
          {/* The 100mm scale representation */}
          <div className="relative w-full h-8 flex items-center">
            {/* Track background */}
            <div className="absolute w-full h-4 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 shadow-inner" />
            
            {/* Ruler ticks */}
            <div className="absolute w-full h-full flex justify-between px-0 pointer-events-none">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tick => (
                <div key={tick} className="h-full flex flex-col justify-center items-center relative">
                  <div className="w-0.5 h-6 bg-white/60 absolute"></div>
                </div>
              ))}
            </div>

            <input 
              type="range" 
              min="0" 
              max="100" 
              value={internalValue}
              onChange={handleChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {/* Custom thumb */}
            <div 
              className="absolute w-10 h-10 bg-white border-4 border-gray-800 rounded-full shadow-lg pointer-events-none transition-transform duration-75 flex items-center justify-center"
              style={{ left: `calc(${internalValue}% - 20px)` }}
            >
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
            </div>
          </div>
          
          {/* Tick labels */}
          <div className="flex justify-between px-1 mt-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tick => (
              <div key={tick} className="flex flex-col items-center w-4">
                <span className="text-sm text-gray-400 font-bold">{tick}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-6 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Mesure (mm)</span>
            <div className="text-4xl font-bold text-gray-800">
              {internalValue} <span className="text-xl text-gray-400 font-medium">/ 100</span>
            </div>
            <div className="text-sm font-bold text-medical-blue mt-1">
              Score EVA : {(internalValue / 10).toFixed(1)} / 10
            </div>
          </div>
          
          <button
            onClick={handleValidate}
            disabled={!hasChanged}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              hasChanged 
                ? 'bg-medical-blue text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:scale-105 active:scale-95' 
                : isValidated 
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-6 h-6" />
            {isValidated && !hasChanged ? 'Validé' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
};
