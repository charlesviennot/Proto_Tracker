import React, { useState, useEffect, useRef } from 'react';
import { Subject, AppState, Group, Language } from './types';
import { INITIAL_DAY0, INITIAL_DAY1, INITIAL_DAY2, INITIAL_SCREENING, INITIAL_FOLLOW_UP, INITIAL_DEMOGRAPHICS } from './constants';
import { SubjectList } from './components/SubjectList';
import { ProtocolWizard } from './components/ProtocolWizard';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { DataHub } from './components/DataHub';
import { PatientProfile } from './components/PatientProfile';
import { ProjectTimeline } from './components/ProjectTimeline';
import { Button } from './components/Button';
import { exportSubjectsToExcel } from './services/excelService';
import { LayoutDashboard, Users, Zap, Download, Stethoscope, Save, Upload, Wand2, Globe, Loader2, Calendar as CalendarIcon, Database, GitCommit, LogOut } from 'lucide-react';
import { t } from './i18n';
import { db, auth, googleProvider } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  // --- State ---
  const [state, setState] = useState<AppState>(() => {
    // Load UI preferences from local storage on init
    const savedPrefs = localStorage.getItem('audioVitalityPrefs');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        return {
          subjects: [], // Will be loaded from Firebase
          currentSubjectId: null,
          view: 'LIST',
          fastTrackMode: parsed.fastTrackMode || false,
          language: parsed.language || 'fr'
        };
      } catch (e) {
        console.error("Failed to parse saved prefs", e);
      }
    }
    return {
      subjects: [],
      currentSubjectId: null,
      view: 'LIST',
      fastTrackMode: false,
      language: 'fr'
    };
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Auth ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Persistence ---
  // Save UI preferences to localStorage
  useEffect(() => {
    localStorage.setItem('audioVitalityPrefs', JSON.stringify({
      fastTrackMode: state.fastTrackMode,
      language: state.language
    }));
  }, [state.fastTrackMode, state.language]);

  // Fetch subjects from Firebase when user is logged in
  useEffect(() => {
    if (!user) return;
    const fetchSubjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        const loadedSubjects: Subject[] = [];
        querySnapshot.forEach((doc) => {
          loadedSubjects.push(doc.data() as Subject);
        });

        // One-time migration from old localStorage to Firebase
        if (loadedSubjects.length === 0) {
           const savedOld = localStorage.getItem('audioVitalityApp');
           if (savedOld) {
             try {
               const parsedOld = JSON.parse(savedOld);
               if (parsedOld.subjects && Array.isArray(parsedOld.subjects) && parsedOld.subjects.length > 0) {
                  console.log("Migrating local subjects to Firebase...");
                  for (const s of parsedOld.subjects) {
                     await setDoc(doc(db, "subjects", s.id), s);
                     loadedSubjects.push(s);
                  }
               }
             } catch (e) {
               console.error("Error migrating old local data", e);
             }
           }
        }

        // Sort by createdAt desc
        loadedSubjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Migrate old data structure to new ClinicalMetrics
        const migratedSubjects = loadedSubjects.map((s: any) => {
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
          } else if (!s.followUp.t72h) {
            s.followUp.t72h = { ...INITIAL_FOLLOW_UP.t72h };
          }
          return s;
        });

        setState(prev => ({ ...prev, subjects: migratedSubjects }));
      } catch (error) {
        console.error("Error fetching subjects from Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, [user]);

  // --- Actions ---
  const addSubject = async (name: string, group: Group, schedule?: { day0Date: string, day0Time: string, day1Date: string, day1Time: string, day2Date: string, day2Time: string }) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      code: `SUB-${String(state.subjects.length + 1).padStart(3, '0')}`,
      name,
      group,
      createdAt: new Date().toISOString(),
      notes: '',
      demographics: { ...INITIAL_DEMOGRAPHICS },
      screening: { ...INITIAL_SCREENING },
      day0: { ...INITIAL_DAY0, date: schedule?.day0Date || '', time: schedule?.day0Time || '', dropJumps: { ...INITIAL_DAY0.dropJumps, sets: Array(10).fill({ reps: 10, restTime: 60, completed: false }) } },
      day1: { ...INITIAL_DAY1, date: schedule?.day1Date || '', time: schedule?.day1Time || '' },
      day2: { ...INITIAL_DAY2, date: schedule?.day2Date || '', time: schedule?.day2Time || '' },
      followUp: { ...INITIAL_FOLLOW_UP },
    };
    
    try {
      await setDoc(doc(db, "subjects", newSubject.id), newSubject);
      setState(prev => ({ ...prev, subjects: [newSubject, ...prev.subjects] }));
    } catch (error) {
      console.error("Error adding subject to Firebase:", error);
      alert("Erreur lors de la création du sujet dans la base de données.");
    }
  };

  const updateSubject = async (updated: Subject) => {
    try {
      await setDoc(doc(db, "subjects", updated.id), updated);
      setState(prev => ({
        ...prev,
        subjects: prev.subjects.map(s => s.id === updated.id ? updated : s)
      }));
    } catch (error) {
      console.error("Error updating subject in Firebase:", error);
      alert("Erreur lors de la mise à jour du sujet.");
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "subjects", id));
      setState(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s.id !== id),
        // If we are currently viewing the deleted subject, go back to list
        currentSubjectId: prev.currentSubjectId === id ? null : prev.currentSubjectId,
        view: prev.currentSubjectId === id ? 'LIST' : prev.view
      }));
    } catch (error) {
      console.error("Error deleting subject from Firebase:", error);
      alert("Erreur lors de la suppression du sujet.");
    }
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

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.subjects && Array.isArray(json.subjects)) {
          if (confirm("Attention : Cette action va importer les données du fichier de sauvegarde vers la base de données. Continuer ?")) {
             setIsLoading(true);
             try {
               for (const subject of json.subjects) {
                 await setDoc(doc(db, "subjects", subject.id), subject);
               }
               setState(prev => ({ ...prev, subjects: json.subjects }));
               alert("Restauration réussie vers Firebase !");
             } catch (error) {
               console.error("Error restoring to Firebase:", error);
               alert("Erreur lors de la restauration vers Firebase.");
             } finally {
               setIsLoading(false);
             }
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

  const loadExampleData = async () => {
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

    setIsLoading(true);
    try {
      for (const subject of examples) {
        await setDoc(doc(db, "subjects", subject.id), subject);
      }
      setState(prev => ({ ...prev, subjects: [...examples, ...prev.subjects] }));
      alert("Données d'exemple chargées avec succès dans Firebase !");
    } catch (error) {
      console.error("Error saving examples to Firebase:", error);
      alert("Erreur lors du chargement des exemples.");
    } finally {
      setIsLoading(false);
    }
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

    if (state.view === 'CALENDAR') {
      return (
        <Calendar 
          subjects={state.subjects} 
          onSelectSubject={(id) => setState(prev => ({ ...prev, currentSubjectId: id, view: 'PROTOCOL' }))}
          language={state.language || 'fr'}
        />
      );
    }

    if (state.view === 'DATA_HUB') {
      return (
        <DataHub 
          subjects={state.subjects}
          language={state.language || 'fr'}
        />
      );
    }

    if (state.view === 'TIMELINE') {
      return (
        <ProjectTimeline 
          language={state.language || 'fr'}
        />
      );
    }

    if (state.view === 'PROFILE' && state.currentSubjectId) {
      const subject = state.subjects.find(s => s.id === state.currentSubjectId);
      if (subject) {
        return (
          <PatientProfile 
            subject={subject}
            onBack={() => setState(prev => ({ ...prev, view: 'LIST', currentSubjectId: null }))}
            language={state.language || 'fr'}
          />
        );
      }
    }

    return (
      <SubjectList 
        subjects={state.subjects}
        onSelect={handleSelectSubject}
        onViewProfile={(id) => setState(prev => ({ ...prev, currentSubjectId: id, view: 'PROFILE' }))}
        onAdd={addSubject}
        onDelete={deleteSubject}
        onUpdateSubject={updateSubject}
        onLoadExampleData={loadExampleData}
        language={state.language || 'fr'}
      />
    );
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-medical-bg flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-medical-blue animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-medical-bg flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="flex flex-col items-center justify-center mb-8 gap-4">
            <img src="/AVI_Logo_Black.png" alt="AudioVitality Logo" className="h-16 md:h-20 object-contain" referrerPolicy="no-referrer" />
          </div>
          <p className="text-gray-500 mb-8 mt-4 text-center">Veuillez vous connecter pour accéder à l'application clinique.</p>
          
          <button
            onClick={() => signInWithPopup(auth, googleProvider)}
            className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue flex items-center justify-center gap-3 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medical-bg flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-medical-blue animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Chargement des données...</p>
      </div>
    );
  }

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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] print:hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Brand Logo Area */}
            <div className="flex items-center cursor-pointer group" onClick={() => setState(p => ({...p, view: 'LIST', currentSubjectId: null}))}>
              <img src="/WMiniLogo.png" alt="Logo" className="w-10 h-10 mr-4 group-hover:scale-105 transition-transform duration-300 object-contain" referrerPolicy="no-referrer" />
              <div className="flex flex-col items-start justify-center">
                 <img src="/AVI_Logo_Black.png" alt="AudioVitality" className="h-6 md:h-7 object-contain mb-1" referrerPolicy="no-referrer" />
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

              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              <button 
                onClick={() => signOut(auth)} 
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300"
                title="Se déconnecter"
              >
                 <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        {renderContent()}
      </main>

      {/* Mobile Navigation (Floating Pill) */}
      {state.view !== 'PROTOCOL' && state.view !== 'PROFILE' && (
        <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-lg rounded-full shadow-2xl shadow-slate-200 border border-white/50 p-2 flex items-center gap-1 z-40 transition-transform animate-in slide-in-from-bottom-10 duration-500 print:hidden">
           <button 
             onClick={() => setState(p => ({...p, view: 'LIST'}))}
             className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${state.view === 'LIST' ? 'bg-medical-text text-white shadow-lg shadow-slate-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
           >
             <Users className="w-4 h-4 mr-2" /> Sujets
           </button>
           <button 
             onClick={() => setState(p => ({...p, view: 'CALENDAR'}))}
             className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${state.view === 'CALENDAR' ? 'bg-medical-blue text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
           >
             <CalendarIcon className="w-4 h-4 mr-2" /> Planning
           </button>
           <button 
             onClick={() => setState(p => ({...p, view: 'DASHBOARD'}))}
             className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${state.view === 'DASHBOARD' ? 'bg-medical-blue text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
           >
             <LayoutDashboard className="w-4 h-4 mr-2" /> Statistiques
           </button>
           <button 
             onClick={() => setState(p => ({...p, view: 'DATA_HUB'}))}
             className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${state.view === 'DATA_HUB' ? 'bg-medical-bronze text-white shadow-lg shadow-yellow-900/30' : 'text-gray-500 hover:bg-yellow-50 hover:text-medical-bronze'}`}
           >
             <Database className="w-4 h-4 mr-2" /> Data Hub
           </button>
           <button 
             onClick={() => setState(p => ({...p, view: 'TIMELINE'}))}
             className={`flex items-center px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${state.view === 'TIMELINE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'}`}
           >
             <GitCommit className="w-4 h-4 mr-2" /> Timeline
           </button>
        </nav>
      )}
    </div>
  );
}