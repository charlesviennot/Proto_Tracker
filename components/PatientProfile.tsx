import React from 'react';
import { Subject, Language } from '../types';
import { Button } from './Button';
import { ArrowLeft, Printer, Activity, Droplets, Zap, HeartPulse, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  subject: Subject;
  onBack: () => void;
  language: Language;
  blindMode: boolean;
}

export const PatientProfile: React.FC<Props> = ({ subject, onBack, language, blindMode }) => {
  const handlePrint = () => {
    window.print();
  };

  // Prepare data for charts
  const cmjData = [
    { phase: 'J0 Base', value: subject.day0.t0?.cmj || 0 },
    { phase: 'J0 Fatigue', value: subject.day0.t1?.cmj || 0 },
    { phase: 'J2 Pre', value: subject.day2.t2?.cmj || 0 },
    { phase: 'J2 Post', value: subject.day2.t3?.cmj || 0 },
    { phase: 'J3 FollowUp', value: subject.followUp?.t72h?.cmj || 0 },
  ].filter(d => d.value > 0);

  const moxyData = [
    { phase: 'J0 Base', smo2: subject.day0.t0?.nirs || 0, thb: subject.day0.t0?.thb || 0 },
    { phase: 'J0 Fatigue', smo2: subject.day0.t1?.nirs || 0, thb: subject.day0.t1?.thb || 0 },
    { phase: 'J2 Pre', smo2: subject.day2.t2?.nirs || 0, thb: subject.day2.t2?.thb || 0 },
    { phase: 'J2 Post', smo2: subject.day2.t3?.nirs || 0, thb: subject.day2.t3?.thb || 0 },
    { phase: 'J3 FollowUp', smo2: subject.followUp?.t72h?.nirs || 0, thb: subject.followUp?.t72h?.thb || 0 },
  ].filter(d => d.smo2 > 0 || d.thb > 0);

  const hrvData = [
    { phase: 'J0 Base', rmssd: subject.day0.t0?.hrvRmssd || 0 },
    { phase: 'J2 Pre', rmssd: subject.day2.t2?.hrvRmssd || 0 },
    { phase: 'J2 Post', rmssd: subject.day2.t3?.hrvRmssd || 0 },
    { phase: 'J3 FollowUp', rmssd: subject.followUp?.t72h?.hrvRmssd || 0 },
  ].filter(d => d.rmssd > 0);

  const stiffnessData = [
    { phase: 'J0 Base', distance: subject.day0.quadricepsStiffnessInitial || 0 },
    { phase: 'J2 Pre', distance: subject.day2.quadricepsStiffnessPre || 0 },
    { phase: 'J2 Post', distance: subject.day2.quadricepsStiffnessPost || 0 },
    { phase: 'J3 FollowUp', distance: subject.followUp?.quadricepsStiffnessT4 || 0 },
  ].filter(d => d.distance > 0);

  const biaData = [
    { phase: 'J0 Base', re: subject.day0.biaInitial.re || subject.day0.biaInitial.r || 0, pha: subject.day0.biaInitial.pha || 0 },
    { phase: 'J2 Pre', re: subject.day2.biaPre?.re || subject.day2.biaPre?.r || 0, pha: subject.day2.biaPre?.pha || 0 },
    { phase: 'J2 Post', re: subject.day2.biaPost?.re || subject.day2.biaPost?.r || 0, pha: subject.day2.biaPost?.pha || 0 },
    { phase: 'J3 FollowUp', re: subject.followUp?.biaT4?.re || subject.followUp?.biaT4?.r || 0, pha: subject.followUp?.biaT4?.pha || 0 },
  ].filter(d => d.pha > 0 || d.re > 0);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 print:p-0 print:max-w-none">
      
      {/* Header - Hidden in print, replaced by print header */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <Button variant="primary" onClick={handlePrint} className="shadow-lg shadow-medical-blue/20">
          <Printer className="w-4 h-4 mr-2" /> Générer PDF / Imprimer
        </Button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b-2 border-medical-blue pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-medical-text">Rapport Clinique Individuel</h1>
            <p className="text-gray-500">Étude AudioVitality - Suivi Longitudinal</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 print:shadow-none print:border-gray-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center text-medical-blue font-bold text-2xl">
            {subject.code.replace('SUB-', '')}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-medical-text">
              {blindMode ? 'Sujet Anonymisé' : subject.name}
            </h2>
            <div className="flex items-center gap-3 text-gray-500 mt-1">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">{subject.code}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-sm font-bold ${subject.group === 'AUDIOVITALITY' ? 'bg-medical-blue/10 text-medical-blue' : 'bg-gray-100 text-gray-600'}`}>
                Groupe {subject.group}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">Âge</div>
            <div className="font-medium">{subject.demographics.age || '-'} ans</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Poids / Taille</div>
            <div className="font-medium">{subject.demographics.weight || '-'} kg / {subject.demographics.height || '-'} cm</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Sexe</div>
            <div className="font-medium">{subject.demographics.gender === 'M' ? 'Homme' : subject.demographics.gender === 'F' ? 'Femme' : '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Date d'inclusion</div>
            <div className="font-medium">{new Date(subject.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
        
        {/* CMJ Evolution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-medical-text mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Évolution CMJ (Détente Verticale)
          </h3>
          {cmjData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmjData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="CMJ (cm)" barSize={40} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">Données insuffisantes</div>
          )}
        </div>

        {/* Moxy Evolution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-medical-text mb-6 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-medical-blue" />
            Oxygénation Musculaire (Moxy)
          </h3>
          {moxyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moxyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0ea5e9' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#f43f5e' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="smo2" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} name="SmO2 (%)" isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="thb" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} name="THb (g/dL)" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">Données insuffisantes</div>
          )}
        </div>

        {/* HRV Evolution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-medical-text mb-6 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            Variabilité Fréquence Cardiaque (HRV)
          </h3>
          {hrvData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hrvData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="rmssd" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} name="RMSSD (ms)" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">Données insuffisantes</div>
          )}
        </div>

        {/* Stiffness Evolution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-medical-text mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Raideur Quadriceps (Distance)
          </h3>
          {stiffnessData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stiffnessData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} reversed />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="distance" fill="#f59e0b" radius={[0, 0, 4, 4]} name="Distance (cm)" barSize={40} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center text-xs text-gray-400 mt-2">Note: Une distance plus faible indique une meilleure souplesse (axe inversé).</div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">Données insuffisantes</div>
          )}
        </div>

        {/* Bio-Impedance Evolution (BIS) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-medical-text mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Bio-Impédance (Re & PhA)
          </h3>
          {biaData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={biaData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis yAxisId="left" reversed axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0ea5e9' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6366f1' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="re" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} name="Re (Ω) [Inversé: Œdème↑]" isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="pha" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} name="PhA (°)" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-center text-xs text-gray-400 mt-2">Re évalue indirectement l'oedème (axe inversé, plus petit = plus d'eau), PhA évalue l'intégrité cellulaire.</div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">Données insuffisantes</div>
          )}
        </div>
      </div>

      {/* Treatment Moxy Summary (if available) */}
      {subject.day2.treatmentMoxy && (
        <div className="mt-8 bg-medical-blue/5 p-6 rounded-2xl border border-medical-blue/20 print:bg-white print:border-gray-300 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-medical-text mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-medical-blue" />
            Résumé Traitement 40 min (Moxy)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Δ THb (Fin - Début)</div>
              <div className={`text-2xl font-bold ${subject.day2.treatmentMoxy.deltaTHb >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {subject.day2.treatmentMoxy.deltaTHb > 0 ? '+' : ''}{subject.day2.treatmentMoxy.deltaTHb} <span className="text-sm font-normal text-gray-400">g/dL</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Pente THb</div>
              <div className="text-2xl font-bold text-medical-text">
                {subject.day2.treatmentMoxy.slopeTHb} <span className="text-sm font-normal text-gray-400">/min</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Δ SmO2 (Fin - Début)</div>
              <div className={`text-2xl font-bold ${subject.day2.treatmentMoxy.deltaSmO2 >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {subject.day2.treatmentMoxy.deltaSmO2 > 0 ? '+' : ''}{subject.day2.treatmentMoxy.deltaSmO2} <span className="text-sm font-normal text-gray-400">%</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Pente SmO2</div>
              <div className="text-2xl font-bold text-medical-text">
                {subject.day2.treatmentMoxy.slopeSmO2} <span className="text-sm font-normal text-gray-400">/min</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Notes */}
      {subject.notes && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-medical-text mb-4">Notes Cliniques</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{subject.notes}</p>
        </div>
      )}

    </div>
  );
};
