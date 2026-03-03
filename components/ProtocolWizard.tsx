
import React, { useState, useRef, useEffect } from 'react';
import { Subject, Day0Data, Day1Data, Day2Data, BiaData, ClinicalMetrics, ScreeningData, FollowUpData, Language, Demographics, TreatmentMoxyData } from '../types';
import { Button } from './Button';
import { DropJumpTracker } from './DropJumpTracker';
import { Save, AlertCircle, Check, Activity, Droplets, Timer, ArrowRight, TrendingDown, TrendingUp, Lock, Upload, FileSpreadsheet, PlayCircle, X, ExternalLink, Calculator, Ruler, Video, Crosshair, Trash2, Rewind, FastForward, PauseCircle, RotateCcw, Zap, Film, FileText, PenTool, Plus, ChevronLeft, Calendar, MoveDiagonal, CheckCircle2, FileUp } from 'lucide-react';
import { t } from '../i18n';

interface Props {
  subject: Subject;
  onUpdate: (updatedSubject: Subject) => void;
  fastTrack: boolean;
  onBack: () => void;
  onDelete?: (id: string) => void;
  language: Language;
}

// --- MOXY CSV PARSER (Punctual - Last 2 mins) ---
const parseMoxyCSV = (csvText: string): { smo2: number | null, thb: number | null } => {
    try {
        const lines = csvText.split('\n');
        const dataPoints: { time: number, smo2: number, thb: number }[] = [];

        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Moxy CSV uses semicolon separator
            const columns = line.split(';');
            
            if (columns.length >= 4) {
                // Try to parse Time from column 1 (standard) or 0
                let timeStr = columns[1]?.replace(',', '.');
                let timeVal = parseFloat(timeStr);
                if (isNaN(timeVal)) {
                    timeStr = columns[0]?.replace(',', '.');
                    timeVal = parseFloat(timeStr);
                }

                const smo2Str = columns[2]?.replace(',', '.');
                const thbStr = columns[3]?.replace(',', '.');
                
                const smo2Val = parseFloat(smo2Str);
                const thbVal = parseFloat(thbStr);
                
                if (!isNaN(smo2Val) && !isNaN(thbVal) && !isNaN(timeVal)) {
                    dataPoints.push({ time: timeVal, smo2: smo2Val, thb: thbVal });
                }
            }
        }

        if (dataPoints.length > 0) {
            // Find max time to know the end of the recording
            const maxTime = Math.max(...dataPoints.map(dp => dp.time));
            
            // Filter only the last 120 seconds (2 minutes)
            const last2Mins = dataPoints.filter(dp => dp.time >= maxTime - 120);
            
            if (last2Mins.length > 0) {
                const smo2Sum = last2Mins.reduce((sum, dp) => sum + dp.smo2, 0);
                const thbSum = last2Mins.reduce((sum, dp) => sum + dp.thb, 0);
                const count = last2Mins.length;

                return {
                    smo2: Math.round((smo2Sum / count) * 10) / 10,
                    thb: Math.round((thbSum / count) * 100) / 100
                };
            }
        }
        return { smo2: null, thb: null };
    } catch (error) {
        console.error("Error parsing Moxy CSV:", error);
        return { smo2: null, thb: null };
    }
};

// --- MOXY CSV PARSER (40-min Treatment) ---
const parseTreatmentMoxyCSV = (csvText: string): TreatmentMoxyData | null => {
    try {
        const lines = csvText.split('\n');
        const dataPoints: { time: number, smo2: number, thb: number }[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const columns = line.split(';');
            if (columns.length >= 4) {
                let timeStr = columns[1]?.replace(',', '.');
                let timeVal = parseFloat(timeStr);
                if (isNaN(timeVal)) {
                    timeStr = columns[0]?.replace(',', '.');
                    timeVal = parseFloat(timeStr);
                }
                const smo2Str = columns[2]?.replace(',', '.');
                const thbStr = columns[3]?.replace(',', '.');
                const smo2Val = parseFloat(smo2Str);
                const thbVal = parseFloat(thbStr);
                
                if (!isNaN(smo2Val) && !isNaN(thbVal) && !isNaN(timeVal)) {
                    dataPoints.push({ time: timeVal, smo2: smo2Val, thb: thbVal });
                }
            }
        }

        if (dataPoints.length > 0) {
            // Step A: Baseline (0 to 120s)
            const startData = dataPoints.filter(dp => dp.time >= 0 && dp.time <= 120);
            // Step B: End (2280 to 2400s) - 38 to 40 mins
            const endData = dataPoints.filter(dp => dp.time >= 2280 && dp.time <= 2400);

            if (startData.length > 0 && endData.length > 0) {
                const avgStartTHb = startData.reduce((sum, dp) => sum + dp.thb, 0) / startData.length;
                const avgEndTHb = endData.reduce((sum, dp) => sum + dp.thb, 0) / endData.length;
                const avgStartSmO2 = startData.reduce((sum, dp) => sum + dp.smo2, 0) / startData.length;
                const avgEndSmO2 = endData.reduce((sum, dp) => sum + dp.smo2, 0) / endData.length;

                const deltaTHb = avgEndTHb - avgStartTHb;
                const slopeTHb = deltaTHb / 40; // per minute

                const deltaSmO2 = avgEndSmO2 - avgStartSmO2;
                const slopeSmO2 = deltaSmO2 / 40; // per minute

                return {
                    avgStartTHb: Math.round(avgStartTHb * 100) / 100,
                    avgEndTHb: Math.round(avgEndTHb * 100) / 100,
                    deltaTHb: Math.round(deltaTHb * 100) / 100,
                    slopeTHb: Math.round(slopeTHb * 1000) / 1000,
                    avgStartSmO2: Math.round(avgStartSmO2 * 10) / 10,
                    avgEndSmO2: Math.round(avgEndSmO2 * 10) / 10,
                    deltaSmO2: Math.round(deltaSmO2 * 10) / 10,
                    slopeSmO2: Math.round(slopeSmO2 * 100) / 100,
                };
            }
        }
        return null;
    } catch (error) {
        console.error("Error parsing Treatment Moxy CSV:", error);
        return null;
    }
};

// --- METRICS COMPONENT ---
interface MetricsInputProps {
    metrics: ClinicalMetrics;
    onChange: (metrics: ClinicalMetrics) => void;
    label: string;
    onMeasureCMJ: () => void;
    language: Language;
}

const MetricsInputGroup: React.FC<MetricsInputProps> = ({ metrics, onChange, label, onMeasureCMJ, language }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { smo2, thb } = parseMoxyCSV(text);
            
            if (smo2 !== null && thb !== null) {
                onChange({ ...metrics, nirs: smo2, thb: thb });
            } else {
                alert("Impossible de lire les données SmO2/THb du fichier. Vérifiez le format Moxy.");
            }
        };
        reader.readAsText(file);
        
        // Reset input so the same file can be uploaded again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Activity className="w-3 h-3 text-medical-blue" /> {label}
                </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* NIRS */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 block">NIRS (SmO2 %)</label>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[10px] text-medical-blue hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded"
                            title="Importer fichier Moxy (.csv)"
                        >
                            <FileUp className="w-3 h-3" /> Moxy
                        </button>
                        <input 
                            type="file" 
                            accept=".csv" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload}
                        />
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={metrics.nirs || ''}
                            onChange={e => onChange({ ...metrics, nirs: parseFloat(e.target.value) })}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-medical-blue outline-none"
                            placeholder="SmO2 %"
                            step="0.1"
                        />
                        <input 
                            type="number" 
                            value={metrics.thb || ''}
                            onChange={e => onChange({ ...metrics, thb: parseFloat(e.target.value) })}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-medical-blue outline-none"
                            placeholder="THb g/dL"
                            step="0.01"
                        />
                    </div>
                </div>

                {/* CMJ */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">CMJ (cm)</label>
                    <div className="flex gap-1">
                        <input 
                            type="number" 
                            value={metrics.cmj || ''}
                            onChange={e => onChange({ ...metrics, cmj: parseFloat(e.target.value) })}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-medical-blue outline-none"
                            placeholder="0"
                        />
                        <button 
                            onClick={onMeasureCMJ}
                            className="p-1.5 bg-blue-50 text-medical-blue rounded-lg hover:bg-blue-100 transition-colors"
                            title="Mesurer CMJ"
                        >
                            <Calculator className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* MVIC */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Force (MVIC - kg/N)</label>
                    <input 
                        type="number" 
                        value={metrics.mvic || ''}
                        onChange={e => onChange({ ...metrics, mvic: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-medical-blue outline-none"
                        placeholder="0"
                    />
                </div>

                {/* RMSSD */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">HRV RMSSD (ms)</label>
                    <input 
                        type="number" 
                        value={metrics.hrvRmssd || ''}
                        onChange={e => onChange({ ...metrics, hrvRmssd: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-medical-blue outline-none"
                        placeholder="0"
                    />
                </div>

                {/* SDNN */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">HRV SDNN (ms)</label>
                    <input 
                        type="number" 
                        value={metrics.hrvSdnn || ''}
                        onChange={e => onChange({ ...metrics, hrvSdnn: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-medical-blue outline-none"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
};


// --- BIA COMPONENT ---
interface BiaInputProps {
    data: BiaData;
    onChange: (data: BiaData) => void;
    label: string;
    prevR?: number;
    interpretation?: 'EDEMA' | 'DRAINAGE'; // Context for visual hints
}

const BiaInputGroup: React.FC<BiaInputProps> = ({ data, onChange, label, prevR, interpretation }) => {
    // Helper to calculate diff visual
    const getDiff = (current: number, prev: number | undefined, inverse: boolean = false) => {
        if (!prev || !current) return null;
        const diff = current - prev;
        const color = inverse 
            ? (diff < 0 ? 'text-red-500' : 'text-green-500') 
            : (diff > 0 ? 'text-green-500' : 'text-red-500');
        
        return (
            <span className={`text-[10px] font-bold ml-1 ${color}`}>
                {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(0)}
            </span>
        );
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" /> {label}
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">50 kHz</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                {/* Resistance */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">R (Ohms)</label>
                    <input 
                        type="number" 
                        value={data.r || ''}
                        onChange={e => onChange({ ...data, r: parseFloat(e.target.value) })}
                        className={`w-full bg-slate-50 border rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none ${
                             interpretation === 'EDEMA' && prevR && data.r && data.r < prevR ? 'border-green-300 bg-green-50' : // Drop is expected (Edema)
                             interpretation === 'DRAINAGE' && prevR && data.r && data.r > prevR ? 'border-green-300 bg-green-50' : // Rise is expected (Drainage)
                             'border-gray-200'
                        }`}
                    />
                    {prevR && data.r ? (
                        <div className="absolute top-0 right-0">
                             {interpretation === 'EDEMA' 
                                ? getDiff(data.r, prevR, true) // We want drop (Red if Up, Green if Down) -> Logic above handles color manually actually
                                : getDiff(data.r, prevR, false)
                             }
                        </div>
                    ) : null}
                </div>

                {/* Reactance */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Xc (Ohms)</label>
                    <input 
                        type="number" 
                        value={data.xc || ''}
                        onChange={e => onChange({ ...data, xc: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                </div>

                {/* Phase Angle */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">PhA (°)</label>
                    <input 
                        type="number" step="0.1"
                        value={data.pha || ''}
                        onChange={e => onChange({ ...data, pha: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                </div>
            </div>
            
            {/* Interpretation Hint */}
            {interpretation && prevR && data.r && (
                <div className="mt-2 text-[10px] text-center font-bold">
                    {interpretation === 'EDEMA' && (
                         data.r < prevR ? <span className="text-green-600 flex items-center justify-center gap-1"><Check className="w-3 h-3"/> Œdème confirmé (R baissé)</span> 
                         : <span className="text-gray-400">Pas de baisse significative de R</span>
                    )}
                    {interpretation === 'DRAINAGE' && (
                         data.r > prevR ? <span className="text-green-600 flex items-center justify-center gap-1"><Check className="w-3 h-3"/> Drainage réussi (R remonté)</span> 
                         : <span className="text-gray-400">Pas de hausse significative de R</span>
                    )}
                </div>
            )}
        </div>
    );
};


// --- CMJ MEASUREMENT MODULE ---
const CMJCalculatorModal = ({ onClose, onSave }: { onClose: () => void; onSave: (cm: number) => void }) => {
  // Lock body scroll when modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [mode, setMode] = useState<'FLIGHT_TIME' | 'VIDEO_LAB'>('VIDEO_LAB'); // Default to Video Lab for better UX discovery
  const [flightTime, setFlightTime] = useState<number>(0); // ms
  
  // Multi-jump state
  const [jumpHistory, setJumpHistory] = useState<number[]>([]);
  
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
      // Use absolute value to allow marking in any order without negative result
      const rawDiff = Math.abs(landingTime - takeoffTime);
      return (rawDiff / sloMoFactor) * 1000; // Return in ms
  };

  const calculatedHeight = mode === 'FLIGHT_TIME' 
    ? calculateHeightFromMs(flightTime) 
    : (takeoffTime !== null && landingTime !== null) 
        ? calculateHeightFromMs(getCorrectedDeltaTime())
        : 0;

  const currentJumpIndex = jumpHistory.length + 1;
  const isFinished = jumpHistory.length >= 3;

  // Actions
  const handleAddJump = () => {
    if (calculatedHeight > 0 && isFinite(calculatedHeight)) {
      const val = parseFloat(calculatedHeight.toFixed(1));
      setJumpHistory([...jumpHistory, val]);
      
      // Reset current measure for next jump
      setTakeoffTime(null);
      setLandingTime(null);
      setFlightTime(0);
      // We keep the video loaded in case multiple jumps are on same file
    }
  };

  const removeJump = (index: number) => {
    const newHistory = [...jumpHistory];
    newHistory.splice(index, 1);
    setJumpHistory(newHistory);
  };

  const handleFinish = () => {
    if (jumpHistory.length === 0) return;
    const sum = jumpHistory.reduce((a, b) => a + b, 0);
    const avg = sum / jumpHistory.length;
    onSave(parseFloat(avg.toFixed(1)));
  };

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
      // Use ref current time, fallback to state currentTime if needed
      const t = videoRef.current ? videoRef.current.currentTime : currentTime;
      if (type === 'TAKEOFF') setTakeoffTime(t);
      else setLandingTime(t);
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
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-full md:h-[85vh]" onClick={e => e.stopPropagation()}>
         
         {/* Left Side: Jump History & Summary */}
         <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-6 flex flex-col shrink-0">
            <div className="mb-6">
                <h3 className="font-bold text-lg text-medical-text flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-medical-bronze" />
                    Protocole CMJ (3 sauts)
                </h3>
                <p className="text-xs text-gray-400 mt-1">Réalisez 3 mesures pour obtenir la moyenne.</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
                {[0, 1, 2].map((idx) => {
                    const val = jumpHistory[idx];
                    const isCurrent = idx === jumpHistory.length;
                    return (
                        <div key={idx} className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all group ${
                            val !== undefined 
                                ? 'bg-white border-medical-blue/20 text-medical-text shadow-sm' 
                                : isCurrent 
                                    ? 'bg-blue-50 border-medical-blue border-dashed animate-pulse' 
                                    : 'bg-slate-100 border-transparent opacity-50'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    val !== undefined ? 'bg-medical-blue text-white' : 'bg-slate-200 text-gray-400'
                                }`}>
                                    {idx + 1}
                                </div>
                                <span className="font-bold text-sm text-gray-500">Saut {idx + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-lg">
                                    {val !== undefined ? `${val} cm` : '--'}
                                </span>
                                {val !== undefined && (
                                    <button 
                                        onClick={() => removeJump(idx)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Supprimer ce saut"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 shrink-0">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-sm font-bold text-gray-400 uppercase">Moyenne</span>
                    <span className="text-4xl font-bold text-medical-bronze">
                        {jumpHistory.length > 0 
                            ? (jumpHistory.reduce((a, b) => a + b, 0) / jumpHistory.length).toFixed(1) 
                            : '0.0'}
                        <span className="text-lg text-gray-400 ml-1">cm</span>
                    </span>
                </div>
                {isFinished && (
                    <Button fullWidth variant="bronze" onClick={handleFinish} className="rounded-2xl shadow-xl shadow-yellow-900/10">
                        <Check className="w-5 h-5 mr-2" /> Valider la Moyenne
                    </Button>
                )}
            </div>
         </div>

         {/* Right Side: Analyzer Tool */}
         <div className="w-full md:w-2/3 flex flex-col h-full bg-white relative">
             {/* Header */}
             <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0 z-20 bg-white relative">
                 {/* Tabs */}
                 <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setMode('VIDEO_LAB')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'VIDEO_LAB' ? 'bg-white text-medical-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Video className="w-3 h-3 inline mr-1" /> Vidéo
                    </button>
                    <button 
                      onClick={() => setMode('FLIGHT_TIME')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'FLIGHT_TIME' ? 'bg-white text-medical-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Timer className="w-3 h-3 inline mr-1" /> Manuel
                    </button>
                 </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                   <X className="w-5 h-5 text-gray-400" />
                </button>
             </div>

             {/* Body */}
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 relative min-h-0">
                {isFinished ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/90 backdrop-blur-sm z-30">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                             <Check className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-medical-text">Mesures terminées</h3>
                        <p className="text-gray-500 mt-2 mb-8">Les 3 sauts ont été enregistrés avec succès.</p>
                        <Button variant="bronze" onClick={handleFinish}>Enregistrer et Fermer</Button>
                        <button onClick={() => setJumpHistory([])} className="mt-4 text-sm text-gray-400 hover:text-red-500 underline">Recommencer les mesures</button>
                     </div>
                ) : null}

                {mode === 'FLIGHT_TIME' ? (
                  <div className="p-8 space-y-6 flex flex-col items-center justify-center h-full">
                     <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm w-full max-w-md text-center">
                        <label className="block text-sm font-bold text-gray-500 mb-4">Temps de suspension (ms)</label>
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <input 
                            type="number" 
                            autoFocus
                            value={flightTime || ''}
                            onChange={e => setFlightTime(parseFloat(e.target.value))}
                            placeholder="Ex: 500"
                            className="w-48 text-center text-6xl font-bold text-medical-text border-b-2 border-gray-200 focus:border-medical-blue outline-none py-2 bg-transparent tabular-nums"
                            />
                        </div>
                        <div className="text-4xl font-bold text-medical-blue mb-2">
                             {calculatedHeight > 0 ? calculatedHeight.toFixed(1) : '0.0'} <span className="text-xl text-gray-400">cm</span>
                        </div>
                     </div>
                  </div>
                ) : (
                   <div className="p-4 space-y-4 pb-32">
                     {!videoUrl ? (
                        <div className="py-12 px-6 flex flex-col items-center text-center">
                            <label className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-medical-blue hover:shadow-lg transition-all group bg-slate-100 max-w-lg mx-auto">
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
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-2xl border border-blue-100">
                                   <div className="flex items-center gap-2 text-medical-blue">
                                      <Film className="w-4 h-4" />
                                      <span className="text-xs font-bold uppercase">Type de Vidéo</span>
                                   </div>
                                   <select 
                                      value={sloMoFactor} 
                                      onChange={(e) => setSloMoFactor(Number(e.target.value))}
                                      className="bg-white border border-blue-200 text-medical-text text-sm font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-medical-blue/30 max-w-[220px]"
                                   >
                                      <option value={1}>Standard 60fps (Temps Réel)</option>
                                      <option value={2}>Ralenti x2 (60fps lu à 30)</option>
                                      <option value={4}>Ralenti x4 (120fps)</option>
                                      <option value={8}>iPhone Slo-Mo x8 (240fps)</option>
                                   </select>
                              </div>
                            </div>

                            {/* Player Container */}
                            <div className="relative rounded-[1.5rem] overflow-hidden bg-black shadow-xl ring-4 ring-white max-w-lg mx-auto">
                                <video 
                                    ref={videoRef}
                                    key={videoUrl}
                                    src={videoUrl}
                                    className="w-full h-auto max-h-[35vh] object-contain mx-auto"
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
                            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
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
                                    </button>
                                    <button onClick={() => frameStep(0.016)} className="flex flex-col items-center gap-1 group">
                                        <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-medical-blue group-hover:text-white transition-colors border border-slate-200">
                                            <FastForward className="w-5 h-5" />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Marking Tools */}
                            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                                <button 
                                    type="button"
                                    onClick={() => markTime('TAKEOFF')}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${takeoffTime !== null ? 'bg-blue-50 border-medical-blue text-medical-blue' : 'bg-white border-slate-200 hover:border-medical-blue/50 text-gray-500'}`}
                                >
                                    <div className="z-10 text-center">
                                        <span className="text-[10px] uppercase font-extrabold tracking-widest mb-1 block opacity-70">1. Décollage</span>
                                        <span className="text-xl font-mono font-bold">{takeoffTime !== null ? takeoffTime.toFixed(3) : '--.---'}s</span>
                                    </div>
                                    {takeoffTime === null && <Crosshair className="w-16 h-16 absolute -bottom-4 -right-4 opacity-5" />}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => markTime('LANDING')}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${landingTime !== null ? 'bg-blue-50 border-medical-blue text-medical-blue' : 'bg-white border-slate-200 hover:border-medical-blue/50 text-gray-500'}`}
                                >
                                    <div className="z-10 text-center">
                                        <span className="text-[10px] uppercase font-extrabold tracking-widest mb-1 block opacity-70">2. Atterrissage</span>
                                        <span className="text-xl font-mono font-bold">{landingTime !== null ? landingTime.toFixed(3) : '--.---'}s</span>
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

             {/* Footer / Result - Z-Index ensured */}
             <div className="p-6 bg-white border-t border-slate-100 shrink-0 z-20 relative">
                <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-slate-100">
                   <div>
                       <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Résultat Saut {currentJumpIndex}</span>
                       {mode === 'VIDEO_LAB' && takeoffTime !== null && landingTime !== null && (
                           <div className="flex flex-col">
                               <span className="text-xs font-mono text-medical-blue font-bold">
                                   Δt Video: {(Math.abs(landingTime - takeoffTime) * 1000).toFixed(0)}ms
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
                  onClick={handleAddJump}
                  disabled={calculatedHeight <= 0 || !isFinite(calculatedHeight) || isFinished}
                  className="rounded-2xl shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" /> 
                  {isFinished ? 'Sauts terminés' : `Valider le Saut ${currentJumpIndex}`}
                </Button>
             </div>
         </div>
      </div>
    </div>
  );
};

export const ProtocolWizard: React.FC<Props> = ({ subject, onUpdate, fastTrack, onBack, onDelete, language }) => {
  const [activeTab, setActiveTab] = useState<'SCREENING' | 'DAY0' | 'DAY1' | 'DAY2' | 'FOLLOW_UP'>('SCREENING');
  const [showCMJModal, setShowCMJModal] = useState(false);
  const [cmjTarget, setCmjTarget] = useState<{ day: 'day0' | 'day1' | 'day2', field: string } | null>(null);

  const openCMJ = (day: 'day0' | 'day1' | 'day2', field: string) => {
    setCmjTarget({ day, field });
    setShowCMJModal(true);
  };

  const handleCMJSave = (val: number) => {
    if (cmjTarget) {
      if (cmjTarget.day === 'day0') {
        onUpdate({
          ...subject,
          day0: { 
            ...subject.day0, 
            [cmjTarget.field]: { ...((subject.day0 as any)[cmjTarget.field]), cmj: val } 
          }
        });
      } else if (cmjTarget.day === 'day1') {
        onUpdate({
          ...subject,
          day1: { 
            ...subject.day1, 
            [cmjTarget.field]: { ...((subject.day1 as any)[cmjTarget.field]), cmj: val } 
          }
        });
      } else {
        onUpdate({
          ...subject,
          day2: { 
            ...subject.day2, 
            [cmjTarget.field]: { ...((subject.day2 as any)[cmjTarget.field]), cmj: val } 
          }
        });
      }
    }
    setShowCMJModal(false);
    setCmjTarget(null);
  };

  const updateDay0 = (updates: Partial<Day0Data>) => {
    onUpdate({ ...subject, day0: { ...subject.day0, ...updates } });
  };
  
  const updateDay1 = (updates: Partial<Day1Data>) => {
    onUpdate({ ...subject, day1: { ...subject.day1, ...updates } });
  };

  const updateDay2 = (updates: Partial<Day2Data>) => {
    onUpdate({ ...subject, day2: { ...subject.day2, ...updates } });
  };

  const updateDemographics = (updates: Partial<Demographics>) => {
    onUpdate({ ...subject, demographics: { ...subject.demographics, ...updates } });
  };

  const updateScreening = (updates: Partial<ScreeningData>) => {
    onUpdate({ ...subject, screening: { ...subject.screening, ...updates } });
  };

  const updateFollowUp = (updates: Partial<FollowUpData>) => {
    onUpdate({ ...subject, followUp: { ...subject.followUp, ...updates } });
  };

  const isScreeningComplete = subject.screening.ageValid && subject.screening.noRecentInjuries && subject.screening.noChronicPathology && subject.screening.noPacemaker && subject.screening.noAntiInflammatory && subject.screening.consentSigned;
  const isFollowUpComplete = subject.followUp.painResolvedDays !== null;

  const tabs = [
    { id: 'SCREENING', label: t('screening', language), completed: isScreeningComplete },
    { id: 'DAY0', label: t('day0', language), completed: subject.day0.completed },
    { id: 'DAY1', label: t('day1', language), completed: subject.day1.completed },
    { id: 'DAY2', label: t('day2', language), completed: subject.day2.completed },
    { id: 'FOLLOW_UP', label: t('followUp', language), completed: isFollowUpComplete },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showCMJModal && (
        <CMJCalculatorModal 
          onClose={() => setShowCMJModal(false)} 
          onSave={handleCMJSave} 
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-gray-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-medical-text flex items-center gap-3">
              {subject.name}
              <span className={`text-sm px-3 py-1 rounded-full border ${subject.group === 'AUDIOVITALITY' ? 'bg-[#F9F5EB] border-[#E8DCC4] text-[#9A7B3E]' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                {subject.group === 'AUDIOVITALITY' ? 'AudioVitality' : 'Contrôle'}
              </span>
            </h2>
            <p className="text-gray-400 font-mono text-sm">{subject.code}</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-medical-text text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.completed && <Check className="w-4 h-4 text-emerald-400" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px] relative">
        
        {/* Screening Content */}
        {activeTab === 'SCREENING' && (
          <div className="p-8 md:p-12 space-y-12 animate-in zoom-in-95 duration-300">
             <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div>
                   <h3 className="text-xl font-bold text-medical-text">Données Démographiques</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mb-12">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Âge (ans)</label>
                    <input 
                      type="number" 
                      value={subject.demographics?.age || ''}
                      onChange={e => updateDemographics({ age: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Ex: 25"
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Poids (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={subject.demographics?.weight || ''}
                      onChange={e => updateDemographics({ weight: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Ex: 75.5"
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Taille (cm)</label>
                    <input 
                      type="number" 
                      value={subject.demographics?.height || ''}
                      onChange={e => updateDemographics({ height: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Ex: 180"
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Sexe</label>
                    <select 
                      value={subject.demographics?.gender || ''}
                      onChange={e => updateDemographics({ gender: e.target.value as any || null })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">Sélectionner</option>
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                </div>
             </section>

             <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">2</div>
                   <h3 className="text-xl font-bold text-medical-text">Critères d'Inclusion & Exclusion</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${subject.screening.ageValid ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {subject.screening.ageValid && <Check className="w-4 h-4" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={subject.screening.ageValid}
                          onChange={e => updateScreening({ ageValid: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Âge entre 18 et 60 ans</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${subject.screening.noRecentInjuries ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {subject.screening.noRecentInjuries && <Check className="w-4 h-4" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={subject.screening.noRecentInjuries}
                          onChange={e => updateScreening({ noRecentInjuries: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Antécédents récents (&lt; 6 mois) de lésions musculo-squelettiques aux membres inférieurs</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${subject.screening.noChronicPathology ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {subject.screening.noChronicPathology && <Check className="w-4 h-4" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={subject.screening.noChronicPathology}
                          onChange={e => updateScreening({ noChronicPathology: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Pas de pathologie cardiovasculaire, métabolique ou inflammatoire chronique</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${subject.screening.noPacemaker ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {subject.screening.noPacemaker && <Check className="w-4 h-4" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={subject.screening.noPacemaker}
                          onChange={e => updateScreening({ noPacemaker: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Pas de dispositifs électroniques implantés (Pacemaker) — CONTRE-INDICATION STRICTE A LA BIA</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${subject.screening.noAntiInflammatory ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {subject.screening.noAntiInflammatory && <Check className="w-4 h-4" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={subject.screening.noAntiInflammatory}
                          onChange={e => updateScreening({ noAntiInflammatory: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Pas de prise de médicaments anti-inflammatoires (AINS) ou de suppléments antioxydants lourds durant la durée de l'étude</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${subject.screening.consentSigned ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {subject.screening.consentSigned && <Check className="w-4 h-4" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={subject.screening.consentSigned}
                          onChange={e => updateScreening({ consentSigned: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Consentement éclairé signé</span>
                      </label>
                   </div>
                   
                   <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col justify-center items-center text-center">
                      {isScreeningComplete ? (
                        <>
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <h4 className="text-lg font-bold text-green-800 mb-2">Sujet Éligible</h4>
                          <p className="text-sm text-green-600">Tous les critères sont remplis. Vous pouvez procéder au Jour 0.</p>
                          <Button className="mt-6" onClick={() => setActiveTab('DAY0')}>Commencer Jour 0</Button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8" />
                          </div>
                          <h4 className="text-lg font-bold text-amber-800 mb-2">Vérification Requise</h4>
                          <p className="text-sm text-amber-600">Veuillez valider tous les critères d'inclusion avant de commencer le protocole.</p>
                        </>
                      )}
                   </div>
                </div>
             </section>
          </div>
        )}

        {/* Day 0 Content */}
        {activeTab === 'DAY0' && (
          <div className="p-8 md:p-12 space-y-12 animate-in zoom-in-95 duration-300">
             {/* Section 1: Pre-requisites */}
             <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div>
                   <h3 className="text-xl font-bold text-medical-text">Mesures Initiales (T0)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Date & Hydratation</label>
                      <input 
                        type="date" 
                        value={subject.day0.date}
                        onChange={e => updateDay0({ date: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 mb-4 focus:ring-2 focus:ring-medical-blue outline-none"
                      />
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${subject.day0.hydrationCheck ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {subject.day0.hydrationCheck && <Check className="w-4 h-4" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={subject.day0.hydrationCheck}
                          onChange={e => updateDay0({ hydrationCheck: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Hydratation 500ml OK</span>
                      </label>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Métriques Physiologiques (T0)</label>
                      <div className="space-y-4">
                        <MetricsInputGroup 
                            label="Baseline (T0)"
                            metrics={subject.day0.t0}
                            onChange={(m) => updateDay0({ t0: m })}
                            onMeasureCMJ={() => openCMJ('day0', 't0')}
                            language={language}
                        />
                        
                        {/* New Quad Stiffness Input */}
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                                <MoveDiagonal className="w-3 h-3 text-medical-bronze" /> Raideur Quad. (Angle)
                            </span>
                             <div className="flex items-center">
                                <input 
                                    type="number"
                                    value={subject.day0.quadricepsStiffnessInitial || ''}
                                    onChange={e => updateDay0({ quadricepsStiffnessInitial: parseFloat(e.target.value) })}
                                    className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 text-lg font-bold text-medical-text focus:ring-2 focus:ring-medical-bronze outline-none"
                                    placeholder="0"
                                />
                                <span className="ml-2 text-gray-400 text-xs font-bold">° (Degrés)</span>
                             </div>
                             <p className="text-[10px] text-gray-400 mt-1 italic">Mesure inclinomètre (talon-fesse)</p>
                        </div>

                        <BiaInputGroup 
                            label="Bio-Impédance (T0)"
                            data={subject.day0.biaInitial}
                            onChange={(bia) => updateDay0({ biaInitial: bia })}
                        />
                      </div>
                   </div>

                   <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col justify-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
                        <Activity className="w-32 h-32" />
                      </div>
                      <div className="text-center">
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-2">Performance T0</label>
                        <h4 className="text-lg font-bold text-blue-900">CMJ Baseline</h4>
                        <div className="text-4xl font-bold text-blue-600 tracking-tight my-2">
                            {subject.day0.t0.cmj || '--'} <span className="text-base text-blue-400 ml-1 font-bold">cm</span>
                        </div>
                        <Button size="sm" onClick={() => openCMJ('day0', 't0')} variant="primary" className="rounded-xl shadow-lg shadow-blue-500/20 mx-auto">
                           <Calculator className="w-4 h-4 mr-1" /> Mesurer CMJ
                        </Button>
                      </div>
                   </div>
                </div>
             </section>

             <hr className="border-gray-100" />

             {/* Section 2: Drop Jumps */}
             <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-medical-bronze text-white flex items-center justify-center font-bold">2</div>
                   <h3 className="text-xl font-bold text-medical-text">Protocole Drop Jumps</h3>
                </div>
                
                <DropJumpTracker 
                  data={subject.day0.dropJumps}
                  onUpdate={(dj) => updateDay0({ dropJumps: dj })}
                  onComplete={() => updateDay0({ completed: false })} // Just update data, explicit complete later
                />
             </section>

             <hr className="border-gray-100" />

             {/* Section 3: Post-Fatigue */}
             <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">3</div>
                   <h3 className="text-xl font-bold text-medical-text">Mesures Post-Fatigue (T1)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricsInputGroup 
                        label="Post-Fatigue (T1)"
                        metrics={subject.day0.t1}
                        onChange={(m) => updateDay0({ t1: m })}
                        onMeasureCMJ={() => openCMJ('day0', 't1')}
                        language={language}
                    />

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-3">RPE (Perception Effort)</label>
                        <input 
                            type="range" 
                            min="0" max="10" 
                            value={subject.day0.rpePost}
                            onChange={e => updateDay0({ rpePost: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-medical-bronze mb-4"
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400">0 (Repos)</span>
                            <span className="text-3xl font-bold text-medical-bronze">{subject.day0.rpePost} <span className="text-sm text-gray-400">/ 10</span></span>
                            <span className="text-xs font-bold text-gray-400">10 (Max)</span>
                        </div>
                    </div>
                </div>
             </section>

             <div className="flex justify-end pt-6">
                 <Button 
                   size="lg" 
                   variant={subject.day0.completed ? 'secondary' : 'primary'}
                   onClick={() => {
                     updateDay0({ completed: true });
                     if(fastTrack) setActiveTab('DAY1');
                   }}
                   className={subject.day0.completed ? 'bg-green-100 text-green-700 border-green-200' : ''}
                 >
                    {subject.day0.completed ? <><Check className="w-5 h-5 mr-2"/> J0 Validé</> : 'Valider Jour 0'}
                 </Button>
             </div>
          </div>
        )}

        {/* Day 1 Content */}
        {activeTab === 'DAY1' && (
           <div className="p-8 md:p-12 space-y-12 animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center min-h-[500px]">
              <div className="max-w-md w-full text-center space-y-8">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                     <Calendar className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-medical-text">Suivi J+24h</h3>
                  <p className="text-gray-500">Évaluation de la douleur différée.</p>

                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-left">
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Date du relevé</label>
                     <input 
                        type="date" 
                        value={subject.day1.date}
                        onChange={e => updateDay1({ date: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-8 focus:ring-2 focus:ring-medical-blue outline-none font-bold"
                      />

                      <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Douleur EVA (0-10)</label>
                      <input 
                            type="range" 
                            min="0" max="10" 
                            value={subject.day1.evaPain}
                            onChange={e => updateDay1({ evaPain: parseInt(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-medical-blue mb-6"
                      />
                      <div className="flex justify-center mb-8">
                         <div className="w-24 h-24 rounded-full bg-white border-4 border-medical-blue flex items-center justify-center shadow-lg">
                            <span className="text-4xl font-bold text-medical-text">{subject.day1.evaPain}</span>
                         </div>
                      </div>

                      <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Qualité du sommeil (0-10)</label>
                      <input 
                            type="range" 
                            min="0" max="10" 
                            value={subject.day1.sleepQuality || 0}
                            onChange={e => updateDay1({ sleepQuality: parseInt(e.target.value) })}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-medical-blue mb-6"
                      />
                      <div className="flex justify-center">
                         <div className="w-24 h-24 rounded-full bg-white border-4 border-medical-blue flex items-center justify-center shadow-lg">
                            <span className="text-4xl font-bold text-medical-text">{subject.day1.sleepQuality || 0}</span>
                         </div>
                      </div>
                  </div>

                  <Button 
                   size="lg" 
                   fullWidth
                   variant={subject.day1.completed ? 'secondary' : 'primary'}
                   onClick={() => {
                     updateDay1({ completed: true });
                     if(fastTrack) setActiveTab('DAY2');
                   }}
                   className={subject.day1.completed ? 'bg-green-100 text-green-700 border-green-200' : 'h-16 text-lg rounded-2xl'}
                 >
                    {subject.day1.completed ? <><Check className="w-5 h-5 mr-2"/> J1 Validé</> : 'Valider Jour 1'}
                 </Button>
              </div>
           </div>
        )}

        {/* Day 2 Content */}
        {activeTab === 'DAY2' && (
           <div className="p-8 md:p-12 space-y-12 animate-in zoom-in-95 duration-300">
               {/* Pre-Session */}
               <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">1</div>
                   <h3 className="text-xl font-bold text-medical-text">Pré-Session (T2)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Sommeil (0-10)</label>
                      <div className="flex items-center justify-between">
                         <input 
                           type="number" max="10"
                           value={subject.day2.sleepQuality || 0}
                           onChange={e => updateDay2({ sleepQuality: parseInt(e.target.value) })}
                           className="w-16 bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                         />
                         <span className="text-xs font-bold text-gray-400">/ 10</span>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Densité Urine</label>
                      <input 
                         type="number" step="0.001"
                         value={subject.day2.urineDensity || ''}
                         onChange={e => updateDay2({ urineDensity: parseFloat(e.target.value) })}
                         className={`w-full bg-white border rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-purple-500 outline-none ${subject.day2.urineDensity > 1.025 ? 'border-red-300 text-red-600' : 'border-gray-200'}`}
                         placeholder="1.020"
                      />
                      {subject.day2.urineDensity > 1.025 && <span className="text-[10px] text-red-500 font-bold mt-1 block">Hydratation insuffisante</span>}
                   </div>

                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Douleur Squat</label>
                      <div className="flex items-center justify-between">
                         <input 
                           type="number" max="10"
                           value={subject.day2.painSquatPre}
                           onChange={e => updateDay2({ painSquatPre: parseInt(e.target.value) })}
                           className="w-16 bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                         />
                         <span className="text-xs font-bold text-gray-400">/ 10</span>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Physio Pre (T2)</label>
                      <div className="space-y-4">
                         <MetricsInputGroup 
                            label="Pré-Traitement (T2)"
                            metrics={subject.day2.t2}
                            onChange={(m) => updateDay2({ t2: m })}
                            onMeasureCMJ={() => openCMJ('day2', 't2')}
                            language={language}
                         />
                          {/* Quad Stiffness Pre */}
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 font-bold flex items-center gap-1"><MoveDiagonal className="w-3 h-3"/> Raideur</span>
                            <div className="flex items-center">
                                <input 
                                type="number"
                                value={subject.day2.quadricepsStiffnessPre || ''}
                                onChange={e => updateDay2({ quadricepsStiffnessPre: parseFloat(e.target.value) })}
                                className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm text-right font-bold"
                                />
                                <span className="text-[10px] text-gray-400 ml-1">°</span>
                            </div>
                         </div>
                         <BiaInputGroup 
                            label="BIA T2" 
                            data={subject.day2.biaPre} 
                            onChange={(bia) => updateDay2({ biaPre: bia })}
                            prevR={subject.day0.biaInitial.r}
                            interpretation="EDEMA"
                         />
                      </div>
                   </div>

                   <div className="bg-purple-50 p-5 rounded-3xl border border-purple-100 flex flex-col justify-center">
                      <label className="text-xs font-bold text-purple-400 uppercase block text-center mb-2">CMJ T2</label>
                      <div className="text-center">
                         <div className="text-3xl font-bold text-purple-700 tracking-tight mb-2">
                             {subject.day2.t2.cmj || '--'} <span className="text-sm">cm</span>
                         </div>
                         <button onClick={() => openCMJ('day2', 't2')} className="bg-purple-200 p-2 rounded-lg text-purple-700 hover:bg-purple-300 transition-colors mx-auto">
                            <Calculator className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
               </section>
               
               {/* Treatment Session */}
               <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Zap className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div>
                        <h3 className="text-2xl font-bold mb-2">Session de Traitement</h3>
                        <p className="text-slate-400 max-w-sm">
                           {subject.group === 'AUDIOVITALITY' 
                             ? 'Protocole : Stimulation basse fréquence (20-100Hz) pour drainage et vascularisation.' 
                             : 'Protocole : Placebo / Repos passif.'}
                        </p>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-center">
                           <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Durée Cible</span>
                           <span className="text-3xl font-mono font-bold">40:00</span>
                        </div>
                        <div className="h-12 w-px bg-slate-700"></div>
                        <div className="text-center">
                           <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Groupe</span>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${subject.group === 'AUDIOVITALITY' ? 'bg-medical-bronze text-white' : 'bg-blue-600 text-white'}`}>
                              {subject.group}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Moxy 40-min Upload */}
                  <div className="relative z-10 mt-8 pt-8 border-t border-slate-700">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="text-sm font-bold text-slate-300 mb-1">Enregistrement Moxy (40 min)</h4>
                           <p className="text-xs text-slate-500">Importez le fichier CSV complet de la séance pour calculer la cinétique (pente et delta).</p>
                        </div>
                        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                           <FileUp className="w-4 h-4" />
                           Importer CSV
                           <input 
                              type="file" 
                              accept=".csv" 
                              className="hidden" 
                              onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 const reader = new FileReader();
                                 reader.onload = (ev) => {
                                    const text = ev.target?.result as string;
                                    const data = parseTreatmentMoxyCSV(text);
                                    if (data) {
                                       updateDay2({ treatmentMoxy: data });
                                    } else {
                                       alert("Impossible de lire les données du fichier Moxy 40 min.");
                                    }
                                 };
                                 reader.readAsText(file);
                                 e.target.value = '';
                              }}
                           />
                        </label>
                     </div>
                     
                     {subject.day2.treatmentMoxy && (
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">THb Baseline (0-2m)</span>
                              <span className="text-lg font-bold text-white">{subject.day2.treatmentMoxy.avgStartTHb} <span className="text-xs text-slate-400">g/dL</span></span>
                           </div>
                           <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">THb Fin (38-40m)</span>
                              <span className="text-lg font-bold text-white">{subject.day2.treatmentMoxy.avgEndTHb} <span className="text-xs text-slate-400">g/dL</span></span>
                           </div>
                           <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">THb Delta</span>
                              <span className={`text-lg font-bold ${subject.day2.treatmentMoxy.deltaTHb >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                 {subject.day2.treatmentMoxy.deltaTHb > 0 ? '+' : ''}{subject.day2.treatmentMoxy.deltaTHb} <span className="text-xs text-slate-400">g/dL</span>
                              </span>
                           </div>
                           <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">THb Vitesse (Pente)</span>
                              <span className="text-lg font-bold text-white">{subject.day2.treatmentMoxy.slopeTHb} <span className="text-xs text-slate-400">/min</span></span>
                           </div>
                        </div>
                     )}
                  </div>
               </section>

               {/* Post-Session */}
               <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">2</div>
                   <h3 className="text-xl font-bold text-medical-text">Récupération (T3)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Gain Physiologique (T3)</label>
                      <div className="space-y-4">
                         <MetricsInputGroup 
                            label="Récupération (T3)"
                            metrics={subject.day2.t3}
                            onChange={(m) => updateDay2({ t3: m })}
                            onMeasureCMJ={() => openCMJ('day2', 't3')}
                            language={language}
                         />

                         {/* Quad Stiffness Post */}
                         <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-blue-800 font-bold flex items-center gap-1"><MoveDiagonal className="w-3 h-3"/> Raideur Final</span>
                                <div className="flex items-center">
                                    <input 
                                    type="number"
                                    value={subject.day2.quadricepsStiffnessPost || ''}
                                    onChange={e => updateDay2({ quadricepsStiffnessPost: parseFloat(e.target.value) })}
                                    className="w-16 bg-white border border-blue-200 rounded-lg px-2 py-1 text-sm text-right font-bold text-blue-900"
                                    />
                                    <span className="text-[10px] text-blue-400 ml-1">°</span>
                                </div>
                             </div>
                             {subject.day2.quadricepsStiffnessPre > 0 && subject.day2.quadricepsStiffnessPost > 0 && (
                                 <div className="text-center">
                                     <span className="text-[10px] font-bold text-green-600">
                                         Gain Mobilité: {(subject.day2.quadricepsStiffnessPre - subject.day2.quadricepsStiffnessPost).toFixed(1)}°
                                     </span>
                                 </div>
                             )}
                         </div>

                         <BiaInputGroup 
                            label="BIA T3" 
                            data={subject.day2.biaPost} 
                            onChange={(bia) => updateDay2({ biaPost: bia })}
                            prevR={subject.day2.biaPre.r}
                            interpretation="DRAINAGE"
                         />
                      </div>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Ressenti Douleur</label>
                      <div className="mb-4">
                         <span className="text-sm font-bold text-gray-500">Delta Douleur (Post - Pre)</span>
                         <input 
                           type="number"
                           value={subject.day2.painDelta || ''}
                           onChange={e => updateDay2({ painDelta: parseFloat(e.target.value) })}
                           className="w-full mt-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold"
                           placeholder="-2"
                         />
                      </div>
                   </div>

                   <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex flex-col justify-center">
                      <div className="text-center">
                        <label className="block text-xs font-bold text-green-500 uppercase mb-2">Performance T3</label>
                        <h4 className="text-lg font-bold text-green-900">CMJ Récupération</h4>
                        <div className="text-4xl font-bold text-green-600 tracking-tight my-2">
                            {subject.day2.t3.cmj || '--'} <span className="text-base text-green-400 ml-1 font-bold">cm</span>
                        </div>
                        <Button size="sm" onClick={() => openCMJ('day2', 't3')} className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20 border-none mx-auto">
                           <Calculator className="w-4 h-4 mr-1" /> Mesurer CMJ
                        </Button>
                      </div>
                      {subject.day0.t0.cmj > 0 && subject.day2.t3.cmj > 0 && (
                          <div className="mt-3 text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full w-fit mx-auto">
                             Récup: {(subject.day2.t3.cmj / subject.day0.t0.cmj * 100).toFixed(1)}% Baseline
                          </div>
                      )}
                    </div>
                </div>

                <div className="flex justify-end pt-8">
                  <Button 
                   size="lg" 
                   variant={subject.day2.completed ? 'secondary' : 'primary'}
                   onClick={() => updateDay2({ completed: true })}
                   className={subject.day2.completed ? 'bg-green-100 text-green-700 border-green-200' : 'shadow-xl shadow-medical-blue/20'}
                 >
                    {subject.day2.completed ? <><Check className="w-5 h-5 mr-2"/> Protocole Terminé</> : 'Finaliser le Protocole'}
                 </Button>
                </div>
               </section>
           </div>
        )}

        {/* Follow-up Content */}
        {activeTab === 'FOLLOW_UP' && (
          <div className="p-8 md:p-12 space-y-12 animate-in zoom-in-95 duration-300">
             <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold text-medical-text">Suivi Post-Protocole</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Disparition complète des douleurs</label>
                      <p className="text-xs text-gray-500 mb-4">Combien de jours après le début du protocole (J0) les douleurs ont-elles complètement disparu ?</p>
                      
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          min="0"
                          value={subject.followUp.painResolvedDays !== null ? subject.followUp.painResolvedDays : ''}
                          onChange={e => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                            updateFollowUp({ painResolvedDays: val });
                          }}
                          className="w-24 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-center focus:ring-2 focus:ring-medical-blue outline-none"
                          placeholder="Ex: 3"
                        />
                        <span className="text-sm font-bold text-gray-600">jours</span>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Notes de suivi</label>
                      <textarea 
                        value={subject.followUp.notes}
                        onChange={e => updateFollowUp({ notes: e.target.value })}
                        className="w-full h-32 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-medical-blue outline-none resize-none"
                        placeholder="Observations supplémentaires, commentaires du participant..."
                      />
                   </div>
                </div>
             </section>
          </div>
        )}
      </div>
    </div>
  );
};