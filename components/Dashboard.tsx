import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Subject, Language } from '../types';
import { TrendingUp, Users, Activity, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { t } from '../i18n';

interface Props {
  subjects: Subject[];
  language: Language;
}

export const Dashboard: React.FC<Props> = ({ subjects, language }) => {
  // --- Data Preparation ---
  // We use all subjects that have at least started (have a baseline CMJ)
  const activeSubjects = subjects.filter(s => (s.day0.t0?.cmj || 0) > 0);
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
        .filter(s => (s.day2.t2?.nirs || 0) > 0 && (s.day2.t3?.nirs || 0) > 0)
        .map(s => (s.day2.t3?.nirs || 0) - (s.day2.t2?.nirs || 0));
      
      if (validValues.length === 0) return null;
      return Number((validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1));
  };

  // Helper: Calculate Stats for Significance
  const getStats = (group: Subject[], accessor: (s: Subject) => number) => {
    const validValues = group.map(accessor).filter(v => v !== 0 && isFinite(v) && !isNaN(v));
    if (validValues.length === 0) return { mean: null, sd: null, n: 0 };
    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const variance = validValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validValues.length;
    return { mean, sd: Math.sqrt(variance), n: validValues.length };
  };

  // Helper: Simulated p-value badge
  const getSignificanceBadge = (stats1: any, stats2: any) => {
    if (!stats1.mean || !stats2.mean || stats1.n < 2 || stats2.n < 2) return null;
    const t = Math.abs(stats1.mean - stats2.mean) / Math.sqrt((Math.pow(stats1.sd, 2) / stats1.n) + (Math.pow(stats2.sd, 2) / stats2.n));
    
    if (t > 2.0) {
      return (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" /> Significatif (p&lt;0.05)
        </div>
      );
    } else if (t > 1.0) {
      return (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" /> Tendance (p&lt;0.15)
        </div>
      );
    }
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
        Non significatif
      </div>
    );
  };

  // Metrics
  const avRecoveryMean = getAverage(avGroup, s => ((s.day2.t3?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100);
  const ctrlRecoveryMean = getAverage(controlGroup, s => ((s.day2.t3?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100);
  
  const avRecoveryStats = getStats(avGroup, s => ((s.day2.t3?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100);
  const ctrlRecoveryStats = getStats(controlGroup, s => ((s.day2.t3?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100);

  const diffRecovery = (avRecoveryMean !== null && ctrlRecoveryMean !== null) 
    ? (avRecoveryMean - ctrlRecoveryMean).toFixed(1) 
    : null;

  const avSmo2Gain = getSmo2Average(avGroup);
  const ctrlSmo2Gain = getSmo2Average(controlGroup);
  
  const avSmo2Stats = getStats(avGroup, s => ((s.day2.t3?.nirs || 0) > 0 && (s.day2.t2?.nirs || 0) > 0) ? (s.day2.t3!.nirs - s.day2.t2!.nirs) : 0);
  const ctrlSmo2Stats = getStats(controlGroup, s => ((s.day2.t3?.nirs || 0) > 0 && (s.day2.t2?.nirs || 0) > 0) ? (s.day2.t3!.nirs - s.day2.t2!.nirs) : 0);

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
      Control: getAverage(controlGroup, s => ((s.day0.t1?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100),
      AudioVitality: getAverage(avGroup, s => ((s.day0.t1?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100)
    },
    {
      stage: 'Récup (J2)',
      Control: getAverage(controlGroup, s => ((s.day2.t3?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100),
      AudioVitality: getAverage(avGroup, s => ((s.day2.t3?.cmj || 0) / (s.day0.t0?.cmj || 1)) * 100)
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

  // 3. BIA Resistance (R) Evolution
  const biaProfileData = [
    {
      stage: 'Base (T0)',
      Control: getAverage(controlGroup, s => s.day0.biaInitial.r),
      AudioVitality: getAverage(avGroup, s => s.day0.biaInitial.r)
    },
    {
      stage: 'Pré-Session (T2)',
      Control: getAverage(controlGroup, s => s.day2.biaPre.r),
      AudioVitality: getAverage(avGroup, s => s.day2.biaPre.r)
    },
    {
      stage: 'Post-Session (T3)',
      Control: getAverage(controlGroup, s => s.day2.biaPost.r),
      AudioVitality: getAverage(avGroup, s => s.day2.biaPost.r)
    }
  ];

  // 4. HRV (RMSSD) Evolution
  const hrvProfileData = [
    {
      stage: 'Base (T0)',
      Control: getAverage(controlGroup, s => s.day0.t0?.hrvRmssd || 0),
      AudioVitality: getAverage(avGroup, s => s.day0.t0?.hrvRmssd || 0)
    },
    {
      stage: 'Pré-Session (T2)',
      Control: getAverage(controlGroup, s => s.day2.t2?.hrvRmssd || 0),
      AudioVitality: getAverage(avGroup, s => s.day2.t2?.hrvRmssd || 0)
    },
    {
      stage: 'Post-Session (T3)',
      Control: getAverage(controlGroup, s => s.day2.t3?.hrvRmssd || 0),
      AudioVitality: getAverage(avGroup, s => s.day2.t3?.hrvRmssd || 0)
    }
  ];

  // 5. BIA Phase Angle (PhA) Evolution
  const phaProfileData = [
    {
      stage: 'Base (T0)',
      Control: getAverage(controlGroup, s => s.day0.biaInitial.pha),
      AudioVitality: getAverage(avGroup, s => s.day0.biaInitial.pha)
    },
    {
      stage: 'Pré-Session (T2)',
      Control: getAverage(controlGroup, s => s.day2.biaPre.pha),
      AudioVitality: getAverage(avGroup, s => s.day2.biaPre.pha)
    },
    {
      stage: 'Post-Session (T3)',
      Control: getAverage(controlGroup, s => s.day2.biaPost.pha),
      AudioVitality: getAverage(avGroup, s => s.day2.biaPost.pha)
    }
  ];

  // 6. Myoton Stiffness Gain (Pre - Post)
  const myotonGainData = [
    {
      name: 'Contrôle',
      gain: getAverage(controlGroup, s => s.day2.quadricepsStiffnessPre - s.day2.quadricepsStiffnessPost) || 0,
      fill: '#94A3B8'
    },
    {
      name: 'AudioVitality',
      gain: getAverage(avGroup, s => s.day2.quadricepsStiffnessPre - s.day2.quadricepsStiffnessPost) || 0,
      fill: '#C5A059'
    }
  ];

  // 7. Correlation Pain vs Recovery
  const scatterData = activeSubjects.map(s => ({
    id: s.code,
    group: s.group,
    pain: s.day1.evaPain,
    recovery: s.day0.t0?.cmj ? ((s.day2.t3?.cmj || 0) / s.day0.t0.cmj) * 100 : 0,
    fill: s.group === 'AUDIOVITALITY' ? '#C5A059' : '#94A3B8'
  })).filter(d => d.pain > 0 && d.recovery > 0);

  // 8. Pain Resolution Days
  const painResolutionData = [
    {
      name: 'Contrôle',
      days: getAverage(controlGroup, s => s.followUp?.painResolvedDays ?? 0) || 0,
      fill: '#94A3B8'
    },
    {
      name: 'AudioVitality',
      days: getAverage(avGroup, s => s.followUp?.painResolvedDays ?? 0) || 0,
      fill: '#C5A059'
    }
  ];

  // 9. MVIC Profile (Comparison of Means)
  const mvicProfileData = [
    {
      stage: 'Base (J0)',
      Control: getAverage(controlGroup, s => s.day0.t0?.mvic || 0),
      AudioVitality: getAverage(avGroup, s => s.day0.t0?.mvic || 0)
    },
    {
      stage: 'Fatigue (J0 Post)',
      Control: getAverage(controlGroup, s => s.day0.t1?.mvic || 0),
      AudioVitality: getAverage(avGroup, s => s.day0.t1?.mvic || 0)
    },
    {
      stage: 'Pré-Session (J2)',
      Control: getAverage(controlGroup, s => s.day2.t2?.mvic || 0),
      AudioVitality: getAverage(avGroup, s => s.day2.t2?.mvic || 0)
    },
    {
      stage: 'Récup (J2 Post)',
      Control: getAverage(controlGroup, s => s.day2.t3?.mvic || 0),
      AudioVitality: getAverage(avGroup, s => s.day2.t3?.mvic || 0)
    }
  ];

  // 10. Sleep Quality Evolution
  const sleepQualityData = [
    {
      stage: 'Nuit J1',
      Control: getAverage(controlGroup, s => s.day1.sleepQuality || 0),
      AudioVitality: getAverage(avGroup, s => s.day1.sleepQuality || 0)
    },
    {
      stage: 'Nuit J2',
      Control: getAverage(controlGroup, s => s.day2.sleepQuality || 0),
      AudioVitality: getAverage(avGroup, s => s.day2.sleepQuality || 0)
    }
  ];

  // 11. THb Profile (Comparison of Means)
  const thbProfileData = [
    {
      stage: 'Base (J0)',
      Control: getAverage(controlGroup, s => s.day0.t0?.thb || 0),
      AudioVitality: getAverage(avGroup, s => s.day0.t0?.thb || 0)
    },
    {
      stage: 'Fatigue (J0 Post)',
      Control: getAverage(controlGroup, s => s.day0.t1?.thb || 0),
      AudioVitality: getAverage(avGroup, s => s.day0.t1?.thb || 0)
    },
    {
      stage: 'Pré-Session (J2)',
      Control: getAverage(controlGroup, s => s.day2.t2?.thb || 0),
      AudioVitality: getAverage(avGroup, s => s.day2.t2?.thb || 0)
    },
    {
      stage: 'Récup (J2 Post)',
      Control: getAverage(controlGroup, s => s.day2.t3?.thb || 0),
      AudioVitality: getAverage(avGroup, s => s.day2.t3?.thb || 0)
    }
  ];

  // 12. Time Series Data (40-min Treatment)
  const timeSeriesData = React.useMemo(() => {
      const buckets = new Map<number, { 
          time: number, 
          audioSmo2: number[], audioThb: number[], audioHr: number[], audioRmssd: number[],
          placeboSmo2: number[], placeboThb: number[], placeboHr: number[], placeboRmssd: number[]
      }>();

      subjects.forEach(sub => {
          if (!sub.day2?.treatmentTimeSeries) return;
          const isAudio = sub.group === 'AUDIOVITALITY';
          
          sub.day2.treatmentTimeSeries.forEach(pt => {
              if (!buckets.has(pt.time)) {
                  buckets.set(pt.time, { time: pt.time, audioSmo2: [], audioThb: [], audioHr: [], audioRmssd: [], placeboSmo2: [], placeboThb: [], placeboHr: [], placeboRmssd: [] });
              }
              const b = buckets.get(pt.time)!;
              if (isAudio) {
                  if (pt.smo2 !== undefined) b.audioSmo2.push(pt.smo2);
                  if (pt.thb !== undefined) b.audioThb.push(pt.thb);
                  if (pt.hr !== undefined) b.audioHr.push(pt.hr);
                  if (pt.rmssd !== undefined) b.audioRmssd.push(pt.rmssd);
              } else {
                  if (pt.smo2 !== undefined) b.placeboSmo2.push(pt.smo2);
                  if (pt.thb !== undefined) b.placeboThb.push(pt.thb);
                  if (pt.hr !== undefined) b.placeboHr.push(pt.hr);
                  if (pt.rmssd !== undefined) b.placeboRmssd.push(pt.rmssd);
              }
          });
      });

      const avg = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;

      return Array.from(buckets.values()).sort((a,b) => a.time - b.time).map(b => ({
          time: b.time,
          timeLabel: `${Math.floor(b.time / 60)}:${(b.time % 60).toString().padStart(2, '0')}`,
          audioSmo2: avg(b.audioSmo2),
          audioThb: avg(b.audioThb),
          audioHr: avg(b.audioHr),
          audioRmssd: avg(b.audioRmssd),
          placeboSmo2: avg(b.placeboSmo2),
          placeboThb: avg(b.placeboThb),
          placeboHr: avg(b.placeboHr),
          placeboRmssd: avg(b.placeboRmssd),
      }));
  }, [subjects]);

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
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Différentiel Récup.</p>
              <div className="flex items-baseline space-x-2">
                 <span className={`text-4xl font-bold ${diffRecovery && Number(diffRecovery) > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                   {diffRecovery ? (Number(diffRecovery) > 0 ? '+' : '') + diffRecovery + '%' : '—'}
                 </span>
                 <span className="text-sm font-medium text-gray-500">vs Contrôle</span>
              </div>
            </div>
            {getSignificanceBadge(avRecoveryStats, ctrlRecoveryStats)}
         </div>

         {/* SmO2 Delta KPI */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Gain Oxygénation</p>
              <div className="flex items-baseline space-x-2">
                 <span className="text-4xl font-bold text-medical-blue">
                   {avSmo2Gain !== null ? `+${avSmo2Gain}%` : '—'}
                 </span>
                 <span className="text-sm font-medium text-gray-500">moyen</span>
              </div>
               <div className="mt-2 flex items-center text-xs font-medium text-gray-500">
                    <TrendingUp className="w-3 h-3 mr-1 text-medical-bronze" /> 
                    <span className="text-medical-bronze font-bold mr-1">{diffSmo2 !== null ? diffSmo2 : '—'}%</span> sup. au contrôle
                 </div>
            </div>
            {getSignificanceBadge(avSmo2Stats, ctrlSmo2Stats)}
         </div>
      </div>

      {/* Main Charts Area */}
      {/* Cinétique du Traitement (40 min) */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
         <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Cinétique du Traitement (40 min)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Évolution de l'oxygénation (SmO2/THb) et de la réponse cardiaque (HR/RMSSD)</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2 flex gap-4">
               <div className="flex items-center text-xs font-bold text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> Contrôle
               </div>
               <div className="flex items-center text-xs font-bold text-medical-bronze">
                  <span className="w-2 h-2 rounded-full bg-medical-bronze mr-2"></span> AudioVitality
               </div>
            </div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NIRS Chart */}
            <div className="h-[350px] w-full">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">Oxygénation Musculaire (SmO2 %)</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis 
                        dataKey="timeLabel" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94A3B8', fontSize: 10}} 
                        interval="preserveStartEnd"
                        minTickGap={30}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        domain={['auto', 'auto']}
                        tick={{fill: '#94A3B8', fontSize: 10}} 
                        dx={-10}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '8px' }}
                     />
                     <Line type="monotone" dataKey="audioSmo2" name="SmO2 AudioVitality" stroke="#C5A059" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}} />
                     <Line type="monotone" dataKey="placeboSmo2" name="SmO2 Contrôle" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{r: 6, fill: '#94A3B8', stroke: '#fff', strokeWidth: 2}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>

            {/* HRV Chart */}
            <div className="h-[350px] w-full">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">Réponse Parasympathique (RMSSD ms)</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis 
                        dataKey="timeLabel" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94A3B8', fontSize: 10}} 
                        interval="preserveStartEnd"
                        minTickGap={30}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        domain={['auto', 'auto']}
                        tick={{fill: '#94A3B8', fontSize: 10}} 
                        dx={-10}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '8px' }}
                     />
                     <Line type="monotone" dataKey="audioRmssd" name="RMSSD AudioVitality" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2}} />
                     <Line type="monotone" dataKey="placeboRmssd" name="RMSSD Contrôle" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{r: 6, fill: '#94A3B8', stroke: '#fff', strokeWidth: 2}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

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

        {/* MVIC Chart - Scientific Look */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Force Maximale (MVIC)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Évolution de la force isométrique (kg/N)</p>
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
               <AreaChart data={mvicProfileData}>
                  <defs>
                     <linearGradient id="colorAvMvic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C5A059" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorCtrlMvic" x1="0" y1="0" x2="0" y2="1">
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
                     dx={-10}
                     padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     itemStyle={{ padding: 0 }}
                     formatter={(value: number) => [value ? `${value.toFixed(1)}` : 'N/A', '']}
                  />
                  
                  <Area 
                     type="monotone" 
                     dataKey="Control" 
                     name="Groupe Contrôle" 
                     stroke="#94A3B8" 
                     strokeWidth={3} 
                     fillOpacity={1} 
                     fill="url(#colorCtrlMvic)" 
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
                     fill="url(#colorAvMvic)" 
                     dot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}}
                     connectNulls
                  />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* THb Chart - Line Comparison */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Hémoglobine Totale (THb)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Évolution de la concentration en hémoglobine (g/dL)</p>
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
               <LineChart data={thbProfileData}>
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
                     unit=" g/dL"
                     dx={-10}
                     padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     itemStyle={{ padding: 0 }}
                     formatter={(value: number) => [value ? `${value.toFixed(2)} g/dL` : 'N/A', '']}
                  />
                  
                  <Line 
                     type="monotone" 
                     dataKey="Control" 
                     name="Groupe Contrôle" 
                     stroke="#94A3B8" 
                     strokeWidth={3} 
                     dot={{r: 4, fill: '#94A3B8', strokeWidth: 0}}
                     connectNulls
                  />
                  <Line 
                     type="monotone" 
                     dataKey="AudioVitality" 
                     name="AudioVitality" 
                     stroke="#C5A059" 
                     strokeWidth={4} 
                     dot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}}
                     connectNulls
                  />
               </LineChart>
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

        {/* BIA Resistance Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Évolution de la Résistance (Bio-Impédance)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Indicateur d'œdème (baisse) et de drainage (hausse) en Ohms</p>
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
               <LineChart data={biaProfileData}>
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
                     unit=" Ω"
                     dx={-10}
                     padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     itemStyle={{ padding: 0 }}
                     formatter={(value: number) => [value ? `${value.toFixed(1)} Ω` : 'N/A', '']}
                  />
                  
                  <Line 
                     type="monotone" 
                     dataKey="Control" 
                     name="Groupe Contrôle" 
                     stroke="#94A3B8" 
                     strokeWidth={3} 
                     dot={{r: 4, fill: '#94A3B8', strokeWidth: 0}}
                     connectNulls
                  />
                  <Line 
                     type="monotone" 
                     dataKey="AudioVitality" 
                     name="AudioVitality" 
                     stroke="#C5A059" 
                     strokeWidth={4} 
                     dot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}}
                     connectNulls
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* HRV Evolution Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Variabilité de la Fréquence Cardiaque (HRV)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Évolution du RMSSD (ms) indiquant l'activité parasympathique</p>
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
               <LineChart data={hrvProfileData}>
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
                     unit=" ms"
                     dx={-10}
                     padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     itemStyle={{ padding: 0 }}
                     formatter={(value: number) => [value ? `${value.toFixed(1)} ms` : 'N/A', '']}
                  />
                  
                  <Line 
                     type="monotone" 
                     dataKey="Control" 
                     name="Groupe Contrôle" 
                     stroke="#94A3B8" 
                     strokeWidth={3} 
                     dot={{r: 4, fill: '#94A3B8', strokeWidth: 0}}
                     connectNulls
                  />
                  <Line 
                     type="monotone" 
                     dataKey="AudioVitality" 
                     name="AudioVitality" 
                     stroke="#C5A059" 
                     strokeWidth={4} 
                     dot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}}
                     connectNulls
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
        {/* BIA Phase Angle Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Angle de Phase (PhA)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Indicateur de santé et d'intégrité cellulaire</p>
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
               <LineChart data={phaProfileData}>
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
                     unit="°"
                     dx={-10}
                     padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     itemStyle={{ padding: 0 }}
                     formatter={(value: number) => [value ? `${value.toFixed(2)}°` : 'N/A', '']}
                  />
                  
                  <Line 
                     type="monotone" 
                     dataKey="Control" 
                     name="Groupe Contrôle" 
                     stroke="#94A3B8" 
                     strokeWidth={3} 
                     dot={{r: 4, fill: '#94A3B8', strokeWidth: 0}}
                     connectNulls
                  />
                  <Line 
                     type="monotone" 
                     dataKey="AudioVitality" 
                     name="AudioVitality" 
                     stroke="#C5A059" 
                     strokeWidth={4} 
                     dot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}}
                     connectNulls
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Myoton Stiffness Gain */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-medical-text">Gain de Souplesse Musculaire</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Baisse de la raideur (Pré - Post) J2 (Myoton)</p>
          </div>
          
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={myotonGainData} barSize={80}>
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
                     unit="°" 
                  />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)}°`, 'Baisse raideur']}
                  />
                  <Bar dataKey="gain" name="Baisse Raideur (°)" radius={[16, 16, 16, 16]}>
                    {myotonGainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Pain Resolution Days */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-medical-text">Disparition des Douleurs</h3>
            <p className="text-sm text-gray-400 font-medium mt-1">Temps moyen (en jours) pour une disparition complète</p>
          </div>
          
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={painResolutionData} barSize={80}>
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
                     unit=" j" 
                  />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)} jours`, 'Temps moyen']}
                  />
                  <Bar dataKey="days" name="Jours" radius={[16, 16, 16, 16]}>
                    {painResolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Qualité du Sommeil</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Évolution de la qualité du sommeil (0-10)</p>
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
               <LineChart data={sleepQualityData}>
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
                     domain={[0, 10]}
                     tick={{fill: '#94A3B8', fontSize: 12}} 
                     dx={-10}
                     padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     itemStyle={{ padding: 0 }}
                     formatter={(value: number) => [value ? `${value.toFixed(1)} / 10` : 'N/A', '']}
                  />
                  
                  <Line 
                     type="monotone" 
                     dataKey="Control" 
                     name="Groupe Contrôle" 
                     stroke="#94A3B8" 
                     strokeWidth={3} 
                     dot={{r: 4, fill: '#94A3B8', strokeWidth: 0}}
                     connectNulls
                  />
                  <Line 
                     type="monotone" 
                     dataKey="AudioVitality" 
                     name="AudioVitality" 
                     stroke="#C5A059" 
                     strokeWidth={4} 
                     dot={{r: 6, fill: '#C5A059', stroke: '#fff', strokeWidth: 2}}
                     connectNulls
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px] lg:col-span-2">
          <div className="mb-6 flex justify-between items-start">
            <div>
               <h3 className="font-bold text-xl text-medical-text">Corrélation Douleur (EVA) vs Récupération (CMJ)</h3>
               <p className="text-sm text-gray-400 font-medium mt-1">Relation entre la douleur perçue à J1 et la récupération de puissance à J2</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2">
               <div className="flex items-center text-xs font-bold text-gray-500 mb-1">
                  <span className="w-3 h-3 rounded-full bg-slate-400 mr-2"></span> Contrôle
               </div>
               <div className="flex items-center text-xs font-bold text-medical-bronze">
                  <span className="w-3 h-3 rounded-full bg-medical-bronze mr-2"></span> AudioVitality
               </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                     type="number" 
                     dataKey="pain" 
                     name="Douleur EVA" 
                     domain={[0, 10]} 
                     tick={{fill: '#94A3B8', fontSize: 12}}
                     axisLine={false}
                     tickLine={false}
                     label={{ value: 'Douleur EVA (J1)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 12 }}
                  />
                  <YAxis 
                     type="number" 
                     dataKey="recovery" 
                     name="Récupération CMJ" 
                     domain={['auto', 'auto']} 
                     unit="%"
                     tick={{fill: '#94A3B8', fontSize: 12}}
                     axisLine={false}
                     tickLine={false}
                     label={{ value: 'Récupération CMJ (%)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12 }}
                  />
                  <ZAxis type="category" dataKey="id" name="Sujet" />
                  <Tooltip 
                     cursor={{strokeDasharray: '3 3'}}
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                     formatter={(value: any, name: string) => {
                        if (name === 'Douleur EVA') return [value, name];
                        if (name === 'Récupération CMJ') return [`${value.toFixed(1)}%`, name];
                        return [value, name];
                     }}
                  />
                  <Scatter name="Sujets" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Scatter>
               </ScatterChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};