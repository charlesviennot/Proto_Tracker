import React, { useState, useEffect } from 'react';
import { Play, SkipForward, CheckCircle, RotateCcw, Timer, Edit3 } from 'lucide-react';
import { DropJumpSession } from '../types';
import { Button } from './Button';

interface Props {
  data: DropJumpSession;
  onUpdate: (data: DropJumpSession) => void;
  onComplete: () => void;
}

export const DropJumpTracker: React.FC<Props> = ({ data, onUpdate, onComplete }) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  // Track total rest time for the current set to calculate progress percentage correctly
  const [totalRestTimeForSet, setTotalRestTimeForSet] = useState(60);

  useEffect(() => {
    const firstIncomplete = data.sets.findIndex(s => !s.completed);
    if (firstIncomplete !== -1) setCurrentSetIndex(firstIncomplete);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(seconds => seconds - 1);
      }, 1000);
    } else if (timeLeft === 0 && isResting) {
      setIsActive(false);
      setIsResting(false);
      if (currentSetIndex < data.sets.length - 1) {
        setCurrentSetIndex(prev => prev + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isResting, currentSetIndex, data.sets.length]);

  const handleCompleteSet = () => {
    const newSets = [...data.sets];
    newSets[currentSetIndex] = { ...newSets[currentSetIndex], completed: true };
    const totalJumps = newSets.reduce((acc, set) => set.completed ? acc + set.reps : acc, 0);
    
    onUpdate({ ...data, sets: newSets, totalJumps });

    if (currentSetIndex < data.sets.length - 1) {
      const nextSetRestTime = newSets[currentSetIndex].restTime;
      setTotalRestTimeForSet(nextSetRestTime);
      setIsResting(true);
      setTimeLeft(nextSetRestTime);
      setIsActive(true);
    } else {
      onUpdate({ ...data, sets: newSets, totalJumps, completed: true });
      onComplete();
    }
  };

  const handleUnlock = () => {
      onUpdate({ ...data, completed: false });
  };

  const currentSet = data.sets[currentSetIndex];
  
  // Calculate SVG Circle progress
  // Circumference = 2 * PI * r (r=88) => ~553
  const CIRCUMFERENCE = 553;
  const progress = totalRestTimeForSet > 0 ? timeLeft / totalRestTimeForSet : 0;
  const dashOffset = CIRCUMFERENCE - (CIRCUMFERENCE * progress);
  
  if (data.completed) {
      return (
          <div className="bg-green-50 rounded-[2rem] p-8 text-center border border-green-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-800">Induction Terminée</h3>
              <p className="text-green-600 mb-6">Total: {data.totalJumps} sauts validés.</p>
              
              <button 
                onClick={handleUnlock}
                className="text-xs font-bold text-green-600/50 hover:text-green-600 flex items-center gap-2 transition-colors"
              >
                  <Edit3 className="w-4 h-4" /> Rouvrir / Modifier
              </button>
          </div>
      )
  }

  return (
    <div className="bg-slate-50 rounded-[2rem] p-6 md:p-8 border border-slate-200">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h3 className="text-2xl font-bold text-medical-text">Série {currentSetIndex + 1} <span className="text-gray-400">/ {data.sets.length}</span></h3>
            <p className="text-sm text-gray-500 mt-1">Protocole : {currentSet.reps} sauts @ 60cm</p>
        </div>
        <div className="flex space-x-1">
            {data.sets.map((s, idx) => (
                <div key={idx} className={`w-2 h-8 rounded-full transition-all ${
                    idx < currentSetIndex ? 'bg-medical-bronze' : 
                    idx === currentSetIndex ? 'bg-medical-text scale-110' : 'bg-gray-200'
                }`} />
            ))}
        </div>
      </div>

      <div className="min-h-[250px] flex items-center justify-center">
        {isResting ? (
          <div className="text-center w-full">
             <div className="relative flex items-center justify-center w-48 h-48 mx-auto mb-6">
                <svg className="transform -rotate-90 w-48 h-48 drop-shadow-lg">
                  <circle cx="96" cy="96" r="88" stroke="#E2E8F0" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="96" cy="96" r="88" 
                    stroke="#C5A059" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-6xl font-bold text-medical-text tabular-nums">{timeLeft}</span>
                    <span className="text-sm text-gray-400 font-medium uppercase tracking-widest mt-1">Repos</span>
                </div>
             </div>
             <Button variant="secondary" onClick={() => setTimeLeft(0)} size="md" className="rounded-2xl">
               <SkipForward className="w-4 h-4 mr-2" /> Passer le repos
             </Button>
          </div>
        ) : (
          <div className="text-center w-full animate-in fade-in zoom-in duration-300">
             <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-medical-blue/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
                     <RotateCcw className="w-16 h-16 text-medical-blue" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                     <span className="block text-3xl font-bold text-medical-text">{currentSet.reps}</span>
                     <span className="text-xs text-gray-400 uppercase font-bold">Répétitions</span>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                     <span className="block text-3xl font-bold text-medical-text">60<small className="text-base">cm</small></span>
                     <span className="text-xs text-gray-400 uppercase font-bold">Hauteur</span>
                 </div>
             </div>

             <Button variant="primary" size="lg" onClick={handleCompleteSet} fullWidth className="h-16 text-lg rounded-2xl shadow-lg shadow-blue-500/20">
               <CheckCircle className="w-6 h-6 mr-2" /> Valider la Série
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};