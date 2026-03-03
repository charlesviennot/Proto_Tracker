import React, { useState, useEffect, useRef } from 'react';
import { Subject, AppState, Group, Language } from './types';
import { INITIAL_DAY0, INITIAL_DAY1, INITIAL_DAY2, INITIAL_SCREENING, INITIAL_FOLLOW_UP, INITIAL_DEMOGRAPHICS } from './constants';
import { SubjectList } from './components/SubjectList';
import { ProtocolWizard } from './components/ProtocolWizard';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/Button';
import { exportSubjectsToExcel } from './services/excelService';
import { LayoutDashboard, Users, Zap, Download, Stethoscope, Save, Upload, Wand2, Globe } from 'lucide-react';
import { t } from './i18n';

export default function App() {
  // --- State ---
  const [state, setState] = useState<AppState>(() => {
    // Load from local storage on init
    const saved = localStorage.getItem('audioVitalityApp');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old data structure to new ClinicalMetrics
        if (parsed.subjects && Array.isArray(parsed.subjects)) {
          parsed.subjects = parsed.subjects.map((s: any) => {
            if (!s.day0.t0) {
              s.day0.t0 = { nirs: s.day0.smo2Baseline || 0, thb: 0, hrvRmssd: s.day0.hrvBaseline || 0, hrvSdnn: 0, cmj: s.day0.cmjInitial || 0 };
              s.day0.t1 = { nirs: 0, thb: 0, hrvRmssd: 0, hrvSdnn: 0, cmj: s.day0.cmjPost || 0 };
            }
            if (!s.day2.t2) {
              s.day2.t2 = { nirs: s.day2.smo2Pre || 0, thb: 0, hrvRmssd: s.day2.hrvPre || 0, hrvSdnn: 0, cmj: s.day2.cmjPreSession || 0 };
              s.day2.t3 = { nirs: s.day2.smo2Post || 0, thb: 0, hrvRmssd: s.day2.hrvRmssdFinal || 0, hrvSdnn: 0, cmj: s.day2.cmjRecovery || 0 };
            }
            if (!s.screening) {
              s.screening = { ...INITIAL_SCREENING };
            }
            if (!s.followUp) {
              s.followUp = { ...INITIAL_FOLLOW_UP };
            }
            return s;
          });
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      subjects: [],
      currentSubjectId: null,
      view: 'LIST',
      fastTrackMode: false,
    };
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('audioVitalityApp', JSON.stringify(state));
  }, [state]);

  // --- Actions ---
  const addSubject = (name: string, group: Group) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      code: `SUB-${String(state.subjects.length + 1).padStart(3, '0')}`,
      name,
      group,
      createdAt: new Date().toISOString(),
      notes: '',
      demographics: { ...INITIAL_DEMOGRAPHICS },
      screening: { ...INITIAL_SCREENING },
      day0: { ...INITIAL_DAY0, dropJumps: { ...INITIAL_DAY0.dropJumps, sets: Array(10).fill({ reps: 10, restTime: 60, completed: false }) } },
      day1: { ...INITIAL_DAY1 },
      day2: { ...INITIAL_DAY2 },
      followUp: { ...INITIAL_FOLLOW_UP },
    };
    setState(prev => ({ ...prev, subjects: [newSubject, ...prev.subjects] }));
  };

  const updateSubject = (updated: Subject) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === updated.id ? updated : s)
    }));
  };

  const deleteSubject = (id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      // If we are currently viewing the deleted subject, go back to list
      currentSubjectId: prev.currentSubjectId === id ? null : prev.currentSubjectId,
      view: prev.currentSubjectId === id ? 'LIST' : prev.view
    }));
  };

  const handleSelectSubject = (id: string) => {
    setState(prev => ({ ...prev, currentSubjectId: id, view: 'PROTOCOL' }));
  };

  const handleExcelExport = () => {
    exportSubjectsToExcel(state.subjects);
  };

  const handleBackup = () => {
    const dataStr = JSON.stringify(state);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `AudioVitality_BACKUP_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.subjects && Array.isArray(json.subjects)) {
          if (confirm("Attention : Cette action va remplacer toutes les données actuelles par celles du fichier de sauvegarde. Continuer ?")) {
             setState(json);
             alert("Restauration réussie !");
          }
        } else {
          alert("Format de fichier invalide.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier.");
      }
      e.target.value = ''; // Reset
    };
    reader.readAsText(file);
  };

  const loadExampleData = () => {
    const examples: Subject[] = [];
    
    // AudioVitality Subjects
    for (let i = 1; i <= 3; i++) {
      examples.push({
        id: crypto.randomUUID(),
        code: `SUB-AV0${i}`,
        name: `Sujet AV ${i}`,
        group: 'AUDIOVITALITY',
        createdAt: new Date().toISOString(),
        notes: 'Exemple généré',
        demographics: { age: 30 + i, weight: 75 + i, height: 175 + i, gender: i % 2 === 0 ? 'F' : 'M' },
        screening: { ageValid: true, noRecentInjuries: true, noChronicPathology: true, noPacemaker: true, noAntiInflammatory: true, consentSigned: true },
        day0: {
          ...INITIAL_DAY0,
          completed: true,
          date: new Date().toISOString().split('T')[0],
          hydrationCheck: true,
          t0: { nirs: 65, thb: 12.1, hrvRmssd: 45, hrvSdnn: 50, cmj: 42 + Math.random() * 4, mvic: 600 + Math.random() * 50 },
          t1: { nirs: 55, thb: 11.8, hrvRmssd: 30, hrvSdnn: 35, cmj: 32 + Math.random() * 3, mvic: 450 + Math.random() * 40 },
          biaInitial: { r: 520 + Math.random() * 20, xc: 60, pha: 6.5 },
          rpePost: 8
        },
        day1: {
          ...INITIAL_DAY1,
          completed: true,
          date: new Date().toISOString().split('T')[0],
          evaPain: 6,
          sleepQuality: 5 + Math.floor(Math.random() * 3)
        },
        day2: {
          ...INITIAL_DAY2,
          completed: true,
          date: new Date().toISOString().split('T')[0],
          sleepQuality: 6 + Math.floor(Math.random() * 3),
          t2: { nirs: 58, thb: 11.9, hrvRmssd: 35, hrvSdnn: 40, cmj: 33 + Math.random() * 3, mvic: 480 + Math.random() * 40 },
          t3: { nirs: 72 + Math.random() * 5, thb: 12.5, hrvRmssd: 50, hrvSdnn: 55, cmj: 40 + Math.random() * 4, mvic: 580 + Math.random() * 40 },
          biaPre: { r: 470 + Math.random() * 20, xc: 55, pha: 6.0 },
          biaPost: { r: 510 + Math.random() * 20, xc: 62, pha: 6.8 },
          painSquatPre: 5
        },
        followUp: { painResolvedDays: 2 + Math.floor(Math.random() * 2), notes: '' }
      });
    }

    // Control Subjects
    for (let i = 1; i <= 3; i++) {
      examples.push({
        id: crypto.randomUUID(),
        code: `SUB-CT0${i}`,
        name: `Sujet Control ${i}`,
        group: 'CONTROL',
        createdAt: new Date().toISOString(),
        notes: 'Exemple généré',
        demographics: { age: 25 + i, weight: 70 + i, height: 170 + i, gender: i % 2 === 0 ? 'M' : 'F' },
        screening: { ageValid: true, noRecentInjuries: true, noChronicPathology: true, noPacemaker: true, noAntiInflammatory: true, consentSigned: true },
        day0: {
          ...INITIAL_DAY0,
          completed: true,
          date: new Date().toISOString().split('T')[0],
          hydrationCheck: true,
          t0: { nirs: 65, thb: 12.0, hrvRmssd: 45, hrvSdnn: 50, cmj: 42 + Math.random() * 4, mvic: 600 + Math.random() * 50 },
          t1: { nirs: 55, thb: 11.7, hrvRmssd: 30, hrvSdnn: 35, cmj: 32 + Math.random() * 3, mvic: 450 + Math.random() * 40 },
          biaInitial: { r: 520 + Math.random() * 20, xc: 60, pha: 6.5 },
          rpePost: 8
        },
        day1: {
          ...INITIAL_DAY1,
          completed: true,
          date: new Date().toISOString().split('T')[0],
          evaPain: 7,
          sleepQuality: 4 + Math.floor(Math.random() * 3)
        },
        day2: {
          ...INITIAL_DAY2,
          completed: true,
          date: new Date().toISOString().split('T')[0],
          sleepQuality: 4 + Math.floor(Math.random() * 3),
          t2: { nirs: 58, thb: 11.8, hrvRmssd: 35, hrvSdnn: 40, cmj: 33 + Math.random() * 3, mvic: 480 + Math.random() * 40 },
          t3: { nirs: 60 + Math.random() * 3, thb: 11.9, hrvRmssd: 38, hrvSdnn: 42, cmj: 34 + Math.random() * 3, mvic: 490 + Math.random() * 40 },
          biaPre: { r: 470 + Math.random() * 20, xc: 55, pha: 6.0 },
          biaPost: { r: 475 + Math.random() * 20, xc: 56, pha: 6.1 },
          painSquatPre: 6
        },
        followUp: { painResolvedDays: 4 + Math.floor(Math.random() * 3), notes: '' }
      });
    }

    setState(prev => ({ ...prev, subjects: [...examples, ...prev.subjects] }));
  };

  // --- Render View ---
  const renderContent = () => {
    if (state.view === 'PROTOCOL' && state.currentSubjectId) {
      const subject = state.subjects.find(s => s.id === state.currentSubjectId);
      if (!subject) return <div>Erreur: Sujet introuvable</div>;
      
      return (
        <ProtocolWizard 
          subject={subject}
          onUpdate={updateSubject}
          fastTrack={state.fastTrackMode}
          onBack={() => setState(prev => ({ ...prev, view: 'LIST', currentSubjectId: null }))}
          onDelete={deleteSubject}
          language={state.language || 'fr'}
        />
      );
    }

    if (state.view === 'DASHBOARD') {
      return <Dashboard subjects={state.subjects} language={state.language || 'fr'} />;
    }

    return (
      <SubjectList 
        subjects={state.subjects}
        onSelect={handleSelectSubject}
        onAdd={addSubject}
        onDelete={deleteSubject}
        onLoadExampleData={loadExampleData}
        language={state.language || 'fr'}
      />
    );
  };

  return (
    <div className="min-h-screen bg-medical-bg font-sans text-medical-text selection:bg-medical-bronze/20">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleRestoreFile} 
        accept=".json" 
        className="hidden" 
      />
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Brand Logo Area */}
            <div className="flex items-center cursor-pointer group" onClick={() => setState(p => ({...p, view: 'LIST', currentSubjectId: null}))}>
              <div className="bg-gradient-to-br from-medical-text to-slate-700 text-white p-3 rounded-2xl mr-4 shadow-lg shadow-slate-900/10 group-hover:scale-105 transition-transform duration-300">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-2xl font-bold tracking-tight text-medical-text leading-tight">
                   AudioVitality<span className="text-medical-bronze">.</span>
                 </h1>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{t('appTitle', state.language || 'fr')}</p>
              </div>
            </div>
            
            {/* Top Tools */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setState(p => ({...p, language: p.language === 'en' ? 'fr' : 'en'}))}
                className="p-3 text-gray-400 hover:text-medical-blue hover:bg-blue-50 rounded-2xl transition-all duration-300 flex items-center gap-2 font-bold"
                title="Changer de langue / Change language"
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs uppercase">{state.language === 'en' ? 'EN' : 'FR'}</span>
              </button>

              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              <button 
                onClick={() => setState(p => ({...p, fastTrackMode: !p.fastTrackMode}))}
                className={`p-3 rounded-2xl transition-all duration-300 ${state.fastTrackMode ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200' : 'text-gray-300 hover:bg-gray-50'}`}
                title="Mode Démonstration (Fast Track)"
              >
                <Zap className="w-5 h-5" />
              </button>
              
              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              <button 
                onClick={handleBackup} 
                className="p-3 text-medical-text hover:text-medical-bronze hover:bg-orange-50 rounded-2xl transition-all duration-300 flex items-center gap-2"
                title="Sauvegarder les données (JSON)"
              >
                 <Save className="w-5 h-5" />
                 <span className="hidden md:inline text-xs font-bold">Sauvegarder</span>
              </button>
              
               <button 
                onClick={handleRestoreClick} 
                className="p-3 text-gray-400 hover:text-medical-blue hover:bg-blue-50 rounded-2xl transition-all duration-300"
                title="Importer une sauvegarde"
              >
                 <Upload className="w-5 h-5" />
              </button>
              
              <button 
                onClick={loadExampleData} 
                className="p-3 text-gray-400 hover:text-medical-bronze hover:bg-yellow-50 rounded-2xl transition-all duration-300"
                title="Charger des données d'exemple"
              >
                 <Wand2 className="w-5 h-5" />
              </button>
              
               <div className="h-8 w-px bg-gray-200 mx-2"></div>

              <button 
                onClick={handleExcelExport} 
                className="p-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-2xl transition-all duration-300 shadow-sm border border-green-200"
                title="Exporter pour Excel"
              >
                 <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        {renderContent()}
      </main>

      {/* Mobile Navigation (Floating Pill) */}
      {state.view !== 'PROTOCOL' && (
        <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-lg rounded-full shadow-2xl shadow-slate-200 border border-white/50 p-2 flex items-center gap-1 z-40 transition-transform animate-in slide-in-from-bottom-10 duration-500">
           <button 
             onClick={() => setState(p => ({...p, view: 'LIST'}))}
             className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${state.view === 'LIST' ? 'bg-medical-text text-white shadow-lg shadow-slate-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
           >
             <Users className="w-4 h-4 mr-2" /> Sujets
           </button>
           <button 
             onClick={() => setState(p => ({...p, view: 'DASHBOARD'}))}
             className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${state.view === 'DASHBOARD' ? 'bg-medical-blue text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
           >
             <LayoutDashboard className="w-4 h-4 mr-2" /> Analyse
           </button>
        </nav>
      )}
    </div>
  );
}