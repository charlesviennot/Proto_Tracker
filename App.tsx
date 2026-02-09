import React, { useState, useEffect, useRef } from 'react';
import { Subject, AppState, Group } from './types';
import { INITIAL_DAY0, INITIAL_DAY1, INITIAL_DAY2 } from './constants';
import { SubjectList } from './components/SubjectList';
import { ProtocolWizard } from './components/ProtocolWizard';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/Button';
import { exportSubjectsToExcel } from './services/excelService';
import { LayoutDashboard, Users, Zap, Download, Stethoscope, Save, Upload } from 'lucide-react';

export default function App() {
  // --- State ---
  const [state, setState] = useState<AppState>(() => {
    // Load from local storage on init
    const saved = localStorage.getItem('audioVitalityApp');
    if (saved) {
      return JSON.parse(saved);
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
      day0: { ...INITIAL_DAY0, dropJumps: { ...INITIAL_DAY0.dropJumps, sets: Array(10).fill({ reps: 10, restTime: 60, completed: false }) } },
      day1: { ...INITIAL_DAY1 },
      day2: { ...INITIAL_DAY2 },
    };
    setState(prev => ({ ...prev, subjects: [newSubject, ...prev.subjects] }));
  };

  const updateSubject = (updated: Subject) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === updated.id ? updated : s)
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
        />
      );
    }

    if (state.view === 'DASHBOARD') {
      return <Dashboard subjects={state.subjects} />;
    }

    return (
      <SubjectList 
        subjects={state.subjects}
        onSelect={handleSelectSubject}
        onAdd={addSubject}
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
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Research Tracker</p>
              </div>
            </div>
            
            {/* Top Tools */}
            <div className="flex items-center space-x-2">
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