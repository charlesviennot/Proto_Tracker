import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';
import { Subject } from '../types';
import { TrendingUp, Users, Activity, Zap } from 'lucide-react';

interface Props {
  subjects: Subject[];
}

export const Dashboard: React.FC<Props> = ({ subjects }) => {
  // --- Data Preparation ---
  // We use all subjects that have at least started (have a baseline CMJ)
  const activeSubjects = subjects.filter(s => s.day0.cmjInitial > 0);
  const completedCount = subjects.filter(s => s.day0.completed && s.day2.completed).length;

  const controlGroup = activeSubjects.filter(s => s.group === 'CONTROL');
  const avGroup = activeSubjects.filter(s => s.group === 'AUDIOVITALITY');

  // Helper: Calculate Robust Average (ignores 0/missing values)
  const getAverage = (group: Subject[], accessor: (s: Subject) => number) => {
    const validValues = group
        .map(accessor)
        .filter(v => v !== 0 && isFinite(v) && !isNaN(v)); // Filter out 0 (missing)
    
    if (validValues.length === 0) return null;
    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / validValues.length).toFixed(1));
  };

  // Helper: Calculate SmO2 Gain (requires both Pre and Post to be > 0)
  const getSmo2Average = (group: Subject[]) => {
      const validValues = group
        .filter(s => s.day2.smo2Pre > 0 && s.day2.smo2Post > 0)
        .map(s => s.day2.smo2Post - s.day2.smo2Pre);
      
      if (validValues.length === 0) return null;
      return Number((validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1));
  };

  // Metrics
  const avRecoveryMean = getAverage(avGroup, s => (s.day2.cmjRecovery / s.day0.cmjInitial) * 100);
  const ctrlRecoveryMean = getAverage(controlGroup, s => (s.day2.cmjRecovery / s.day0.cmjInitial) * 100);
  
  const diffRecovery = (avRecoveryMean !== null && ctrlRecoveryMean !== null) 
    ? (avRecoveryMean - ctrlRecoveryMean).toFixed(1) 
    : null;

  const avSmo2Gain = getSmo2Average(avGroup);
  const ctrlSmo2Gain = getSmo2Average(controlGroup);
  const diffSmo2 = (avSmo2Gain !== null && ctrlSmo2Gain !== null) 
    ? (avSmo2Gain - ctrlSmo2Gain).toFixed(1) 
    : null;

  // 1. CMJ Recovery Profile (Comparison of Means)
  const cmjProfileData = [
    {
      stage: 'Base (J0)',
      Control: controlGroup.length > 0 ? 100 : null,
      AudioVitality: avGroup.length > 0 ? 100 : null
    },
    {
      stage: 'Fatigue (J0 Post)',
      Control: getAverage(controlGroup, s => (s.day0.cmjPost / s.day0.cmjInitial) * 100),
      AudioVitality: getAverage(avGroup, s => (s.day0.cmjPost / s.day0.cmjInitial) * 100)
    },
    {
      stage: 'Récup (J2)',
      Control: getAverage(controlGroup, s => (s.day2.cmjRecovery / s.day0.cmjInitial) * 100),
      AudioVitality: getAverage(avGroup, s => (s.day2.cmjRecovery / s.day0.cmjInitial) * 100)
    }
  ];

  // 2. SmO2 Gain Analysis
  const smo2GainData = [
    {
      name: 'Contrôle',
      gain: ctrlSmo2Gain || 0,
      fill: '#94A3B8' // Slate
    },
    {
      name: 'AudioVitality',
      gain: avSmo2Gain || 0,
      fill: '#C5A059' // Bronze
    }
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      
      {/* KPI Cards - Glassmorphic Medical Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Total Cohort */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute right-0 top-0 p-4 opacity-10 transform translate-x-2 -translate-y-2">
               <Users className="w-24 h-24 text-medical-blue" />
            </div>
            <div className="relative z-10">
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Cohorte Totale</p>
               <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-medical-text">{subjects.length}</span>
                  <span className="text-sm font-medium text-gray-500">sujets</span>
               </div>
               <div className="mt-4 flex items-center text-xs font-medium text-medical-blue bg-blue-50 px-3 py-1 rounded-full w-fit">
                  <Activity className="w-3 h-3 mr-1" /> {completedCount} complets
               </div>
            </div>
         </div>

         {/* AudioVitality Group */}
         <div className="bg-gradient-to-br from-[#F9F5EB] to-white p-6 rounded-[2rem] shadow-sm border border-[#E8DCC4] relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10 transform translate-x-2 -translate-y-2">
               <Zap className="w-24 h-24 text-medical-bronze" />
            </div>
            <div className="relative z-10">
               <p className="text-sm font-bold text-[#C5A059] uppercase tracking-widest mb-1">Groupe Traité</p>
               <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-medical-text">{avGroup.length}</span>
                  <span className="text-sm font-medium text-gray-500">sujets</span>
               </div>
               <div className="mt-4 text-xs font-bold text-[#9A7B3E]">
                  Protocole AudioVitality
               </div>
            </div>
         </div>

         {/* Recovery Delta KPI */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Différentiel Récup.</p>
            <div className="flex items-baseline space-x-2">
               <span className={`text-4xl font-bold ${diffRecovery && Number(diffRecovery) > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                 {diffRecovery ? (Number(diffRecovery) > 0 ? '+' : '') + diffRecovery + '%' : '—'}
               </span>
               <span className="text-sm font-medium text-gray-500">vs Contrôle</span>
            </div>
            <p className="mt-4 text-xs text-gray-400 leading-relaxed">
               Gain de récupération CMJ du groupe traité par rapport au groupe contrôle.
            </p>
         </div>

         {/* SmO2 Delta KPI */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Gain Oxygénation</p>
            <div className="flex items-baseline space-x-2">
               <span className="text-4xl font-bold text-medical-blue">
                 {avSmo2Gain !== null ? `+${avSmo2Gain}%` : '—'}
               </span>
               <span className="text-sm font-medium text-gray-500">moyen</span>
            </div>
             <div className="mt-4 flex items-center text-xs font-medium text-gray-500">
                  <TrendingUp className="w-3 h-3 mr-1 text-medical-bronze" /> 
                  <span className="text-medical-bronze font-bold mr-1">{diffSmo2 !== null ? diffSmo2 : '—'}%</span> sup. au contrôle
               </div>
         </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CMJ Chart - Scientific Look */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Cinétique de Performance (CMJ)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Évolution de la puissance normalisée (% Baseline)</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2">
               <div className="flex items-center text-xs font-bold text-gray-500 mb-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> Contrôle
               </div>
               <div className="flex items-center text-xs font-bold text-medical-bronze">
                  <span className="w-2 h-2 rounded-full bg-medical-bronze mr-2"></span> AudioVitality
               </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={cmjProfileData}>
                  <defs>
                     <linearGradient id="colorAv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C5A059" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorCtrl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                     dataKey="stage" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} 
                     dy={15} 
                  />
                  <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     domain={['auto', 'auto']}
                     tick={{fill: '#94A3B8', fontSize: 12}} 
                     unit="%"
                     dx={-10}
                     padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     itemStyle={{ padding: 0 }}
                     formatter={(value: number) => [value ? `${value.toFixed(1)}%` : 'N/A', '']}
                  />
                  
                  <Area 
                     type="monotone" 
                     dataKey="Control" 
                     name="Groupe Contrôle" 
                     stroke="#94A3B8" 
                     strokeWidth={3} 
                     fillOpacity={1} 
                     fill="url(#colorCtrl)" 
                     dot={{r: 4, fill: '#94A3B8', strokeWidth: 0}}
                     connectNulls
                  />
                  <Area 
                     type="monotone" 
                     dataKey="AudioVitality" 
                     name="AudioVitality" 
                     stroke="#C5A059" 
                     strokeWidth={4} 
                     fillOpacity={1} 
                     fill="url(#colorAv)" 
                     dot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}}
                     connectNulls
                  />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* SmO2 Chart - Bar Comparison */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-medical-text">Gain d'Oxygénation Tissulaire</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Différence SmO2 (Post - Pré) lors de la session J2</p>
          </div>
          
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={smo2GainData} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#475569', fontSize: 13, fontWeight: 600}} 
                     dy={15} 
                  />
                  <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#94A3B8', fontSize: 12}} 
                     unit="%" 
                  />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Gain']}
                  />
                  <Bar dataKey="gain" name="Gain Moyen (%)" radius={[16, 16, 16, 16]}>
                    {smo2GainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};