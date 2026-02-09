import React, { useState, useRef, useEffect } from 'react';
import { Subject, Day0Data, Day1Data, Day2Data } from '../types';
import { Button } from './Button';
import { DropJumpTracker } from './DropJumpTracker';
import { Save, AlertCircle, Check, Activity, Droplets, Timer, ArrowRight, TrendingDown, TrendingUp, Lock, Upload, FileSpreadsheet, PlayCircle, X, ExternalLink, Calculator, Ruler, Video, Crosshair, Trash2, Rewind, FastForward, PauseCircle, RotateCcw, Zap, Film, FileText, PenTool } from 'lucide-react';

interface Props {
  subject: Subject;
  onUpdate: (updatedSubject: Subject) => void;
  fastTrack: boolean;
  onBack: () => void;
}

// --- CMJ MEASUREMENT MODULE ---
const CMJCalculatorModal = ({ onClose, onSave }: { onClose: () => void; onSave: (cm: number) => void }) => {
  const [mode, setMode] = useState<'FLIGHT_TIME' | 'VIDEO_LAB'>('VIDEO_LAB'); // Default to Video Lab for better UX discovery
  const [flightTime, setFlightTime] = useState<number>(0); // ms
  
  // Video Analysis State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Slow Motion Correction Factor (1 = Realtime, 8 = iPhone 240fps, 4 = 120fps)
  const [sloMoFactor, setSloMoFactor] = useState<number>(1); 

  const [takeoffTime, setTakeoffTime] = useState<number | null>(null);
  const [landingTime, setLandingTime] = useState<number | null>(null);
  
  // Physics: h = (g * t^2) / 8
  const calculateHeightFromMs = (ms: number) => {
    const seconds = ms / 1000;
    const g = 9.81;
    const heightMeters = (g * Math.pow(seconds, 2)) / 8;
    return heightMeters * 100; // cm
  };

  // Calculate Delta T based on marks and Slow Motion Factor
  const getCorrectedDeltaTime = () => {
      if (takeoffTime === null || landingTime === null) return 0;
      const rawDiff = landingTime - takeoffTime;
      return (rawDiff / sloMoFactor) * 1000; // Return in ms
  };

  const calculatedHeight = mode === 'FLIGHT_TIME' 
    ? calculateHeightFromMs(flightTime) 
    : (takeoffTime !== null && landingTime !== null) 
        ? calculateHeightFromMs(getCorrectedDeltaTime())
        : 0;

  // Video Handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setTakeoffTime(null);
      setLandingTime(null);
      setCurrentTime(0);
      setIsPlaying(false);
      // Reset factor to 1 on new upload to avoid confusion, user must select
      setSloMoFactor(1);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const togglePlaybackSpeed = () => {
    if (videoRef.current) {
        // Cycle speeds: 1.0 -> 0.5 -> 0.1 (Slow Mo) -> 1.0
        const newRate = playbackRate === 1.0 ? 0.5 : playbackRate === 0.5 ? 0.1 : 1.0;
        videoRef.current.playbackRate = newRate;
        setPlaybackRate(newRate);
    }
  };

  const markTime = (type: 'TAKEOFF' | 'LANDING') => {
      if (videoRef.current) {
          const t = videoRef.current.currentTime;
          if (type === 'TAKEOFF') setTakeoffTime(t);
          else setLandingTime(t);
      }
  };

  const frameStep = (seconds: number) => {
      if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
          videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (videoRef.current) {
          videoRef.current.currentTime = time;
          setCurrentTime(time);
      }
  };

  const resetMarks = () => {
      setTakeoffTime(null);
      setLandingTime(null);
  };

  // Sync state with video
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onTimeUpdate = () => setCurrentTime(vid.currentTime);
    const onLoadedMetadata = () => setDuration(vid.duration);
    const onEnded = () => setIsPlaying(false);

    vid.addEventListener('timeupdate', onTimeUpdate);
    vid.addEventListener('loadedmetadata', onLoadedMetadata);
    vid.addEventListener('ended', onEnded);

    return () => {
        vid.removeEventListener('timeupdate', onTimeUpdate);
        vid.removeEventListener('loadedmetadata', onLoadedMetadata);
        vid.removeEventListener('ended', onEnded);
    };
  }, [videoUrl]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
         {/* Header */}
         <div className="bg-medical-text p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white/10 rounded-xl">
                 <Ruler className="w-6 h-6 text-medical-bronze" />
               </div>
               <div>
                 <h3 className="font-bold text-lg">Labo Verticalité</h3>
                 <p className="text-xs text-gray-400">Analyse vidéo & Calculateur</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
               <X className="w-5 h-5" />
            </button>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-slate-100 shrink-0">
            <button 
              onClick={() => setMode('VIDEO_LAB')}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'VIDEO_LAB' ? 'text-medical-blue border-b-2 border-medical-blue bg-blue-50/50' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Video className="w-4 h-4 inline mr-2" /> Analyse Vidéo
            </button>
            <button 
              onClick={() => setMode('FLIGHT_TIME')}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'FLIGHT_TIME' ? 'text-medical-blue border-b-2 border-medical-blue bg-blue-50/50' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Timer className="w-4 h-4 inline mr-2" /> Saisie Manuelle
            </button>
         </div>

         {/* Body */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
            {mode === 'FLIGHT_TIME' ? (
              <div className="p-8 space-y-6">
                 <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <label className="block text-sm font-bold text-gray-500 mb-2">Temps de suspension (ms)</label>
                    <div className="flex items-center gap-3">
                        <input 
                        type="number" 
                        autoFocus
                        value={flightTime || ''}
                        onChange={e => setFlightTime(parseFloat(e.target.value))}
                        placeholder="Ex: 500"
                        className="w-full text-5xl font-bold text-medical-text border-b-2 border-gray-200 focus:border-medical-blue outline-none py-2 bg-transparent tabular-nums"
                        />
                        <span className="text-gray-400 font-bold text-xl">ms</span>
                    </div>
                 </div>
                 <p className="text-sm text-gray-500 bg-white p-4 rounded-2xl border border-gray-200 leading-relaxed">
                   <Activity className="w-4 h-4 inline mr-2 text-medical-bronze" />
                   Utilisez cette méthode si vous possédez déjà un <strong>tapis de contact</strong> (ex: JustJump, Optojump) ou une autre source de mesure fiable.
                 </p>
              </div>
            ) : (
               <div className="p-4 space-y-4">
                 {!videoUrl ? (
                    <div className="py-12 px-6 flex flex-col items-center text-center">
                        <label className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-medical-blue hover:shadow-lg transition-all group bg-slate-100">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-medical-blue" />
                            </div>
                            <h4 className="text-lg font-bold text-medical-text mb-1">Importer une vidéo</h4>
                            <p className="text-sm text-gray-400 px-8">Formats supportés: MP4, MOV. <br/>Ralenti iPhone (240fps) recommandé.</p>
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                        </label>
                    </div>
                 ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Slo-Mo Correction Selector */}
                        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-2xl border border-blue-100">
                             <div className="flex items-center gap-2 text-medical-blue">
                                <Film className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Correction Ralenti</span>
                             </div>
                             <select 
                                value={sloMoFactor} 
                                onChange={(e) => setSloMoFactor(Number(e.target.value))}
                                className="bg-white border border-blue-200 text-medical-text text-sm font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-medical-blue/30"
                             >
                                <option value={1}>Standard (1x)</option>
                                <option value={4}>Ralenti x4 (120fps)</option>
                                <option value={8}>iPhone Slo-Mo x8 (240fps)</option>
                                <option value={10}>Super Ralenti x10</option>
                             </select>
                        </div>

                        {/* Player Container */}
                        <div className="relative rounded-[1.5rem] overflow-hidden bg-black shadow-xl ring-4 ring-white">
                            <video 
                                ref={videoRef}
                                src={videoUrl}
                                className="w-full h-auto max-h-[40vh] object-contain mx-auto"
                                playsInline
                                // controls={false} // Custom controls below
                            />
                            
                            {/* Overlay Controls */}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={() => setVideoUrl(null)} className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-red-500/80 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute top-3 left-3">
                                 <button onClick={togglePlaybackSpeed} className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-bold rounded-full hover:bg-white/20 transition-colors border border-white/10">
                                    {playbackRate}x Playback
                                </button>
                            </div>
                        </div>

                        {/* Scrubber & Transports */}
                        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-2">
                                <button onClick={togglePlay} className="text-medical-text hover:text-medical-blue transition-colors">
                                    {isPlaying ? <PauseCircle className="w-10 h-10" /> : <PlayCircle className="w-10 h-10" />}
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={duration || 0} 
                                    step="0.001"
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-medical-blue"
                                />
                                <span className="text-xs font-mono font-bold text-gray-400 w-12 text-right">
                                    {currentTime.toFixed(2)}s
                                </span>
                            </div>
                            
                            <div className="flex justify-center gap-4 border-t border-slate-100 pt-3">
                                <button onClick={() => frameStep(-0.016)} className="flex flex-col items-center gap-1 group">
                                    <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-medical-blue group-hover:text-white transition-colors border border-slate-200">
                                        <Rewind className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">-1 Frame</span>
                                </button>
                                <button onClick={() => frameStep(0.016)} className="flex flex-col items-center gap-1 group">
                                    <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-medical-blue group-hover:text-white transition-colors border border-slate-200">
                                        <FastForward className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">+1 Frame</span>
                                </button>
                            </div>
                        </div>

                        {/* Marking Tools */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => markTime('TAKEOFF')}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${takeoffTime !== null ? 'bg-blue-50 border-medical-blue text-medical-blue' : 'bg-white border-slate-200 hover:border-medical-blue/50 text-gray-500'}`}
                            >
                                <div className="z-10 text-center">
                                    <span className="text-[10px] uppercase font-extrabold tracking-widest mb-1 block opacity-70">1. Décollage</span>
                                    <span className="text-xl font-mono font-bold">{takeoffTime ? takeoffTime.toFixed(3) : '--.---'}s</span>
                                </div>
                                {takeoffTime === null && <Crosshair className="w-16 h-16 absolute -bottom-4 -right-4 opacity-5" />}
                            </button>
                            <button 
                                onClick={() => markTime('LANDING')}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${landingTime !== null ? 'bg-blue-50 border-medical-blue text-medical-blue' : 'bg-white border-slate-200 hover:border-medical-blue/50 text-gray-500'}`}
                            >
                                <div className="z-10 text-center">
                                    <span className="text-[10px] uppercase font-extrabold tracking-widest mb-1 block opacity-70">2. Atterrissage</span>
                                    <span className="text-xl font-mono font-bold">{landingTime ? landingTime.toFixed(3) : '--.---'}s</span>
                                </div>
                                {landingTime === null && <Crosshair className="w-16 h-16 absolute -bottom-4 -right-4 opacity-5" />}
                            </button>
                        </div>
                        
                        {(takeoffTime !== null || landingTime !== null) && (
                            <button onClick={resetMarks} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-red-500 flex items-center justify-center gap-2 transition-colors">
                                <RotateCcw className="w-3 h-3" /> Réinitialiser les marqueurs
                            </button>
                        )}
                    </div>
                 )}
               </div>
            )}
         </div>

         {/* Footer / Result */}
         <div className="p-6 bg-white border-t border-slate-100 shrink-0">
            <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-slate-100">
               <div>
                   <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Résultat</span>
                   {mode === 'VIDEO_LAB' && takeoffTime && landingTime && (
                       <div className="flex flex-col">
                           <span className="text-xs font-mono text-medical-blue font-bold">
                               Δt Video: {((landingTime - takeoffTime) * 1000).toFixed(0)}ms
                           </span>
                           {sloMoFactor > 1 && (
                                <span className="text-xs font-mono text-medical-bronze font-bold">
                                    Δt Réel: {getCorrectedDeltaTime().toFixed(0)}ms
                                </span>
                           )}
                       </div>
                   )}
               </div>
               <div className="flex items-baseline gap-1 text-medical-bronze">
                  <span className="text-4xl font-bold tracking-tight">{calculatedHeight > 0 && isFinite(calculatedHeight) ? calculatedHeight.toFixed(1) : '0.0'}</span>
                  <span className="text-base font-bold">cm</span>
               </div>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              variant="bronze" 
              className="shadow-xl shadow-yellow-900/10 rounded-2xl"
              onClick={() => {
                if(calculatedHeight > 0 && isFinite(calculatedHeight)) onSave(parseFloat(calculatedHeight.toFixed(1)));
              }}
              disabled={calculatedHeight <= 0 || !isFinite(calculatedHeight)}
            >
              Appliquer la mesure
            </Button>
         </div>
      </div>
    </div>
  );
};

// Internal component for a data tile input
const MetricCard = ({ 
  label, 
  value, 
  onChange, 
  unit, 
  placeholder = "0", 
  subtitle,
  warning,
  delta,
  step,
  onImport,
  onMeasure
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  unit?: string; 
  placeholder?: string;
  subtitle?: string;
  warning?: { condition: boolean; message: string; type: 'error' | 'warning' };
  delta?: { value: number; label: string; invertColor?: boolean };
  step?: number;
  onImport?: () => void;
  onMeasure?: () => void;
}) => (
  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-medical-bronze/30 focus-within:border-medical-bronze/50 focus-within:ring-4 focus-within:ring-medical-bronze/5 transition-all duration-200 group relative">
    <div className="flex justify-between items-start mb-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="flex gap-2">
            {onMeasure && (
                <button 
                    onClick={onMeasure}
                    className="text-[10px] font-bold text-medical-blue bg-white border border-medical-blue/20 px-2 py-1 rounded-lg hover:bg-medical-blue hover:text-white transition-colors flex items-center gap-1 shadow-sm"
                    title="Assistant de mesure CMJ"
                >
                    <Ruler className="w-3 h-3" /> Mesurer
                </button>
            )}
            {onImport && (
                <button 
                    onClick={onImport}
                    className="text-[10px] font-bold text-medical-bronze bg-white border border-medical-bronze/20 px-2 py-1 rounded-lg hover:bg-medical-bronze hover:text-white transition-colors flex items-center gap-1 shadow-sm"
                    title="Importer depuis Elite HRV (CSV)"
                >
                    <FileSpreadsheet className="w-3 h-3" /> Elite HRV
                </button>
            )}
        </div>
    </div>
    <div className="flex items-baseline gap-2">
      <input 
        type="number" 
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full bg-transparent text-3xl font-bold text-medical-text placeholder-gray-300 outline-none p-0 border-none focus:ring-0"
        placeholder={placeholder}
        step={step}
      />
      {unit && <span className="text-gray-400 font-medium">{unit}</span>}
    </div>
    
    {/* Contextual Info */}
    <div className="mt-2 min-h-[20px]">
        {delta && value > 0 && (
            <div className={`flex items-center text-xs font-bold ${
                (delta.invertColor ? delta.value > 0 : delta.value < 0) ? 'text-green-600' : 'text-orange-500'
            }`}>
                {delta.value > 0 ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
                {delta.value > 0 ? '+' : ''}{delta.value.toFixed(1)}% {delta.label}
            </div>
        )}
        {warning && warning.condition && (
             <div className={`flex items-center text-xs font-bold ${warning.type === 'error' ? 'text-red-500' : 'text-orange-500'} animate-pulse`}>
                <AlertCircle className="w-3 h-3 mr-1" /> {warning.message}
             </div>
        )}
        {!delta && !warning?.condition && subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
        )}
    </div>
  </div>
);

export const ProtocolWizard: React.FC<Props> = ({ subject, onUpdate, fastTrack, onBack }) => {
  const [activeTab, setActiveTab] = useState<'day0' | 'day1' | 'day2'>('day0');
  const [showVideo, setShowVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetFieldForImport, setTargetFieldForImport] = useState<string | null>(null);

  // CMJ Tool State
  const [showCMJTool, setShowCMJTool] = useState(false);
  const [targetCMJField, setTargetCMJField] = useState<'day0_initial' | 'day0_post' | 'day2_pre' | 'day2_recovery' | null>(null);

  // Helpers
  const updateDay0 = (data: Partial<Day0Data>) => onUpdate({ ...subject, day0: { ...subject.day0, ...data } });
  const updateDay1 = (data: Partial<Day1Data>) => onUpdate({ ...subject, day1: { ...subject.day1, ...data } });
  const updateDay2 = (data: Partial<Day2Data>) => onUpdate({ ...subject, day2: { ...subject.day2, ...data } });

  // Navigation Logic
  const finishDay0 = () => { updateDay0({ completed: true, date: new Date().toISOString() }); setActiveTab('day1'); };
  const finishDay1 = () => { updateDay1({ completed: true, date: new Date().toISOString() }); setActiveTab('day2'); };
  const finishDay2 = () => { updateDay2({ completed: true, date: new Date().toISOString() }); onBack(); };

  // Locks
  const isDay1Locked = !subject.day0.completed && !fastTrack;
  const isDay2Locked = (!subject.day1.completed || !subject.day0.completed) && !fastTrack;

  // Calculators
  const cmjDecline = subject.day0.cmjInitial > 0 ? ((subject.day0.cmjPost - subject.day0.cmjInitial) / subject.day0.cmjInitial * 100) : 0;
  const smo2Delta = subject.day2.smo2Post - subject.day2.smo2Pre;
  const hrvDelta = subject.day2.hrvRmssdFinal - (subject.day2.hrvPre || 0);

  // --- IMPORT LOGIC ---
  const handleImportClick = (fieldKey: string) => {
    setTargetFieldForImport(fieldKey);
    fileInputRef.current?.click();
  };

  const processFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetFieldForImport) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Simple CSV Parser for Elite HRV exports
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) {
        alert("Fichier vide ou format invalide.");
        return;
      }

      const headerRow = lines[0];
      const delimiters = [',', ';', '\t'];
      let delimiter = ',';
      
      for (const d of delimiters) {
        if (headerRow.split(d).length > 1) {
          delimiter = d;
          break;
        }
      }

      const headers = headerRow.split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const rmssdIndex = headers.findIndex(h => h.includes('rmssd'));

      if (rmssdIndex === -1) {
        alert("Colonne 'RMSSD' introuvable dans ce fichier CSV.");
        return;
      }

      const lastLine = lines[lines.length - 1];
      const values = lastLine.split(delimiter).map(v => v.trim().replace(/"/g, ''));
      const rmssdValue = parseFloat(values[rmssdIndex]);

      if (!isNaN(rmssdValue)) {
        if (targetFieldForImport === 'hrvBaseline') updateDay0({ hrvBaseline: rmssdValue });
        if (targetFieldForImport === 'hrvPre') updateDay2({ hrvPre: rmssdValue });
        if (targetFieldForImport === 'hrvRmssdFinal') updateDay2({ hrvRmssdFinal: rmssdValue });
      } else {
        alert("Valeur RMSSD invalide ou illisible.");
      }
      e.target.value = ''; 
    };
    reader.readAsText(file);
  };

  // --- CMJ MEASURE HANDLERS ---
  const openCMJTool = (field: 'day0_initial' | 'day0_post' | 'day2_pre' | 'day2_recovery') => {
    setTargetCMJField(field);
    setShowCMJTool(true);
  };

  const handleCMJSave = (cm: number) => {
    if (targetCMJField === 'day0_initial') updateDay0({ cmjInitial: cm });
    if (targetCMJField === 'day0_post') updateDay0({ cmjPost: cm });
    if (targetCMJField === 'day2_pre') updateDay2({ cmjPreSession: cm });
    if (targetCMJField === 'day2_recovery') updateDay2({ cmjRecovery: cm });
    setShowCMJTool(false);
    setTargetCMJField(null);
  };

  const renderDay0 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Data Entry */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Section 1: Baseline */}
        <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-medical-blue rounded-2xl">
                <Droplets className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-lg text-medical-text">Mesures de Base</h3>
                <p className="text-sm text-gray-400">À effectuer au repos complet.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <MetricCard 
                label="HRV (RMSSD)" 
                value={subject.day0.hrvBaseline} 
                onChange={(v) => updateDay0({ hrvBaseline: v })} 
                unit="ms"
                subtitle="Cible repos: > 20ms"
                onImport={() => handleImportClick('hrvBaseline')}
             />
             <MetricCard 
                label="SmO2 Base" 
                value={subject.day0.smo2Baseline} 
                onChange={(v) => updateDay0({ smo2Baseline: v })} 
                unit="%"
                subtitle="Saturation musculaire"
             />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
               onClick={() => updateDay0({ hydrationCheck: !subject.day0.hydrationCheck })}>
             <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${subject.day0.hydrationCheck ? 'bg-medical-blue border-medical-blue text-white' : 'border-gray-300'}`}>
                    {subject.day0.hydrationCheck && <Check className="w-4 h-4" />}
                </div>
                <span className={`font-bold ${subject.day0.hydrationCheck ? 'text-medical-blue' : 'text-gray-500'}`}>
                    Hydratation 500ml validée
                </span>
             </div>
             {subject.day0.hydrationCheck && <span className="text-xs font-bold text-medical-blue bg-blue-100 px-2 py-1 rounded-lg">OK</span>}
          </div>
        </section>

        {/* Section 2: Induction */}
        <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
             {/* Decorative Background Element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-medical-bronze/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9F5EB] text-medical-bronze rounded-2xl">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-medical-text">Induction Fatigue (Drop Jumps)</h3>
                        <p className="text-sm text-gray-400">Protocole: 10 séries x 10 sauts (60cm).</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowVideo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-medical-bronze/20 text-medical-bronze rounded-2xl text-sm font-bold hover:bg-medical-bronze hover:text-white transition-all shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" />
                    <span className="hidden md:inline">Voir démo</span>
                </button>
             </div>

             <DropJumpTracker 
                data={subject.day0.dropJumps} 
                onUpdate={(dj) => updateDay0({ dropJumps: dj })} 
                onComplete={() => {}}
             />
        </section>

        {/* Section 3: Post-Effort (Conditional) */}
        {subject.day0.dropJumps.completed && (
            <section className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-bottom duration-500 ring-2 ring-medical-bronze/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-medical-text">Post-Effort Immédiat</h3>
                        <p className="text-sm text-gray-400">Objectif: baisse de performance significative.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard 
                        label="RPE (Borg 0-10)" 
                        value={subject.day0.rpePost} 
                        onChange={(v) => updateDay0({ rpePost: v })} 
                        placeholder="0-10"
                        warning={{ condition: subject.day0.rpePost > 0 && subject.day0.rpePost < 8, message: "Effort insuffisant (<8)", type: 'warning' }}
                    />
                    <MetricCard 
                        label="T1 - CMJ Fatigue" 
                        value={subject.day0.cmjPost} 
                        onChange={(v) => updateDay0({ cmjPost: v })} 
                        unit="cm"
                        subtitle="2-5 min post-effort"
                        delta={{ value: cmjDecline, label: "vs Baseline", invertColor: false }}
                        onMeasure={() => openCMJTool('day0_post')}
                    />
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                    <Button onClick={finishDay0} variant="bronze" size="lg" className="shadow-xl shadow-yellow-900/10">
                        Valider et Clôturer J0 <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </section>
        )}
      </div>

      {/* Right Column: Reference Data (CMJ Initial kept visible) */}
      <div className="lg:col-span-5 space-y-6">
         <div className="sticky top-28 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">Performance Référence</h4>
                <div className="space-y-6 relative z-10">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                           <label className="text-sm text-gray-400 block">T0 - Baseline (Avant Effort)</label>
                           <button onClick={() => openCMJTool('day0_initial')} className="text-xs font-bold text-medical-bronze hover:text-white transition-colors flex items-center gap-1">
                              <Ruler className="w-3 h-3" /> Mesurer
                           </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                value={subject.day0.cmjInitial || ''}
                                onChange={(e) => updateDay0({ cmjInitial: parseFloat(e.target.value) })}
                                className="bg-transparent text-5xl font-bold text-white outline-none w-32 placeholder-gray-600"
                                placeholder="0"
                            />
                            <span className="text-xl text-gray-500 font-medium">cm</span>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full"></div>
                    <div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Cette valeur servira de base de référence (100%) pour calculer la fatigue aigüe (J0) et la récupération à 48h (J2).
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h4 className="font-bold text-medical-text">Notes Cliniques</h4>
                </div>
                <div className="relative">
                    <textarea 
                        className="w-full h-48 p-4 bg-gray-50 rounded-2xl border border-gray-100 resize-none outline-none focus:ring-2 focus:ring-medical-bronze/30 text-sm text-gray-700"
                        placeholder="Observations, douleurs spécifiques, incidents..."
                        value={subject.notes}
                        onChange={(e) => onUpdate({ ...subject, notes: e.target.value })}
                    />
                    <div className="absolute bottom-4 right-4 text-gray-300">
                        <PenTool className="w-4 h-4" />
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderDay1 = () => (
    <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
            <div className="w-20 h-20 bg-blue-50 text-medical-blue rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Timer className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-3xl text-medical-text mb-2">Suivi à 24 Heures</h3>
            <p className="text-gray-500 mb-10 text-lg">Évaluation subjective de la douleur au pic inflammatoire théorique.</p>
            
            <div className="bg-slate-50 p-8 rounded-[2rem] mb-10">
                <div className="flex justify-between items-end mb-4">
                     <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">EVA Douleur (0-10)</label>
                     <span className="text-4xl font-bold text-medical-bronze">{subject.day1.evaPain}</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="10" 
                    step="0.5"
                    value={subject.day1.evaPain}
                    onChange={(e) => updateDay1({ evaPain: Number(e.target.value) })}
                    className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer accent-medical-bronze hover:accent-[#B08D4C] transition-all"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium px-1">
                    <span>Aucune douleur</span>
                    <span>Douleur insupportable</span>
                </div>
            </div>

            <Button fullWidth onClick={finishDay1} size="lg" variant="bronze" className="h-16 text-lg rounded-2xl shadow-xl shadow-yellow-900/10">
                Enregistrer le J1
            </Button>
        </div>
    </div>
  );

  const renderDay2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Pre-requisites */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <div className={`p-4 rounded-2xl transition-colors ${subject.day2.urineDensity > 0 && subject.day2.urineDensity <= 1.025 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-gray-400'}`}>
                    <Droplets className="w-8 h-8" />
                </div>
                <div className="flex-1 w-full">
                    <h3 className="font-bold text-lg text-medical-text mb-2">Validation Hydrique</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <MetricCard 
                            label="Densité Urinaire" 
                            value={subject.day2.urineDensity} 
                            onChange={(v) => updateDay2({ urineDensity: v })} 
                            step={0.001}
                            placeholder="1.0xx"
                            warning={{ condition: subject.day2.urineDensity > 1.025, message: "Densité trop élevée (>1.025)", type: 'error' }}
                        />
                         {subject.day2.urineDensity > 0 && subject.day2.urineDensity <= 1.025 && (
                             <div className="text-green-600 font-bold flex items-center bg-green-50 px-4 py-3 rounded-2xl">
                                 <Check className="w-5 h-5 mr-2" /> Sujet éligible
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {(subject.day2.urineDensity > 0 && subject.day2.urineDensity <= 1.025) || fastTrack ? (
                <>
                    {/* Step 2: Pre-Session Measures */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-medical-text">Mesures Pré-Session (T2)</h3>
                            <p className="text-sm text-gray-400">Avant le traitement. Évaluation DOMS.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <MetricCard 
                                label="T2 - CMJ État Inflammatoire" 
                                value={subject.day2.cmjPreSession} 
                                onChange={(v) => updateDay2({ cmjPreSession: v })} 
                                unit="cm"
                                subtitle="Impact des courbatures"
                                onMeasure={() => openCMJTool('day2_pre')}
                            />
                             <MetricCard 
                                label="Douleur Squat" 
                                value={subject.day2.painSquatPre} 
                                onChange={(v) => updateDay2({ painSquatPre: v })} 
                                placeholder="0-10"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <MetricCard 
                                label="HRV Pré (RMSSD)" 
                                value={subject.day2.hrvPre} 
                                onChange={(v) => updateDay2({ hrvPre: v })} 
                                unit="ms"
                                onImport={() => handleImportClick('hrvPre')}
                            />
                            <MetricCard 
                                label="SmO2 Pré" 
                                value={subject.day2.smo2Pre} 
                                onChange={(v) => updateDay2({ smo2Pre: v })} 
                                unit="%"
                            />
                        </div>
                    </div>

                    {/* Step 3: The Session (Visual Break) */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-medical-blue to-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-500/20">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/2"></div>
                         <div className="relative z-10 flex justify-between items-center">
                             <div>
                                 <h3 className="font-bold text-2xl mb-1">
                                     {subject.group === 'AUDIOVITALITY' ? 'Traitement AudioVitality' : 'Session Contrôle'}
                                 </h3>
                                 <p className="text-blue-100 font-medium">Durée protocolaire : {subject.day2.sessionDuration} minutes</p>
                             </div>
                             <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                 <Timer className="w-8 h-8 text-white" />
                             </div>
                         </div>
                    </div>

                    {/* Step 4: Post-Session Measures */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 ring-2 ring-medical-bronze/10">
                         <div className="mb-6">
                            <h3 className="font-bold text-lg text-medical-text">Mesures Post-Session (T3)</h3>
                            <p className="text-sm text-gray-400">Évaluation immédiate des gains (Rebond).</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MetricCard 
                                label="T3 - CMJ Récup. Aiguë" 
                                value={subject.day2.cmjRecovery} 
                                onChange={(v) => updateDay2({ cmjRecovery: v })} 
                                unit="cm"
                                subtitle="Critère principal"
                                onMeasure={() => openCMJTool('day2_recovery')}
                            />
                            <MetricCard 
                                label="SmO2 Post" 
                                value={subject.day2.smo2Post} 
                                onChange={(v) => updateDay2({ smo2Post: v })} 
                                unit="%"
                                delta={{ value: smo2Delta, label: "Gain", invertColor: true }}
                            />
                            <MetricCard 
                                label="HRV Final" 
                                value={subject.day2.hrvRmssdFinal} 
                                onChange={(v) => updateDay2({ hrvRmssdFinal: v })} 
                                unit="ms"
                                delta={subject.day2.hrvPre > 0 ? { value: hrvDelta, label: "Delta", invertColor: true } : undefined}
                                onImport={() => handleImportClick('hrvRmssdFinal')}
                            />
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                             <Button onClick={finishDay2} variant="bronze" size="lg" className="shadow-xl shadow-yellow-900/10">
                                <Save className="w-5 h-5 mr-2" /> Finaliser le Protocole
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-12 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Les étapes suivantes sont verrouillées en attente de la validation hydrique.</p>
                </div>
            )}
        </div>

        {/* Right Column: Context */}
        <div className="lg:col-span-4 space-y-6">
             <div className="sticky top-28 space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                    <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-6">Rappel J0</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">T0 - Baseline</span>
                            <span className="font-bold text-medical-text">{subject.day0.cmjInitial} cm</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">T1 - Fatigue</span>
                            <span className="font-bold text-red-500">{subject.day0.cmjPost} cm</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">SmO2 Base</span>
                            <span className="font-bold text-medical-text">{subject.day0.smo2Baseline}%</span>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h4 className="font-bold text-medical-text">Notes Cliniques</h4>
                    </div>
                    <div className="relative">
                        <textarea 
                            className="w-full h-48 p-4 bg-gray-50 rounded-2xl border border-gray-100 resize-none outline-none focus:ring-2 focus:ring-medical-bronze/30 text-sm text-gray-700"
                            placeholder="Observations, douleurs spécifiques, incidents..."
                            value={subject.notes}
                            onChange={(e) => onUpdate({ ...subject, notes: e.target.value })}
                        />
                        <div className="absolute bottom-4 right-4 text-gray-300">
                            <PenTool className="w-4 h-4" />
                        </div>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={onBack} variant="secondary" className="rounded-full w-12 h-12 p-0 flex items-center justify-center">
             <ArrowRight className="w-5 h-5 rotate-180" />
        </Button>
        <div>
             <h2 className="text-3xl font-bold text-medical-text">{subject.name}</h2>
             <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                 <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-bold">{subject.code}</span>
                 <span className="text-gray-300">|</span>
                 <span className={`font-bold flex items-center gap-1 ${subject.group === 'AUDIOVITALITY' ? 'text-medical-bronze' : 'text-medical-blue'}`}>
                     {subject.group === 'AUDIOVITALITY' ? <Zap className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                     {subject.group === 'AUDIOVITALITY' ? 'Groupe Traité (AudioVitality)' : 'Groupe Contrôle'}
                 </span>
             </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {[
              { id: 'day0', label: 'Induction J0', step: 'Étape 1', completed: subject.day0.completed, locked: false },
              { id: 'day1', label: 'Suivi J1', step: 'Étape 2', completed: subject.day1.completed, locked: isDay1Locked },
              { id: 'day2', label: 'Récupération J2', step: 'Étape 3', completed: subject.day2.completed, locked: isDay2Locked },
          ].map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => !tab.locked && setActiveTab(tab.id as any)}
                  disabled={tab.locked}
                  className={`
                      relative flex-1 min-w-[160px] p-5 rounded-[1.5rem] border-2 text-left transition-all duration-300 group
                      ${activeTab === tab.id 
                          ? 'bg-white border-medical-text shadow-lg shadow-slate-200/50 scale-[1.02]' 
                          : tab.locked 
                              ? 'bg-slate-50 border-transparent opacity-50 cursor-not-allowed' 
                              : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'}
                  `}
              >
                  <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tab.step}</span>
                      {tab.locked ? <Lock className="w-4 h-4 text-gray-300" /> : tab.completed && <div className="bg-green-100 text-green-600 p-1 rounded-full"><Check className="w-3 h-3" /></div>}
                  </div>
                  <span className={`font-bold text-lg block ${activeTab === tab.id ? 'text-medical-text' : 'text-gray-500'}`}>
                      {tab.label}
                  </span>
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-medical-text rounded-b-[1.3rem] opacity-10"></div>}
              </button>
          ))}
      </div>

      <div className="min-h-[600px]">
          {activeTab === 'day0' && renderDay0()}
          {activeTab === 'day1' && renderDay1()}
          {activeTab === 'day2' && renderDay2()}
      </div>
      
      {/* Modals */}
      {showCMJTool && (
        <CMJCalculatorModal 
           onClose={() => setShowCMJTool(false)} 
           onSave={handleCMJSave} 
        />
      )}
    </div>
  );
};