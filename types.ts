
export type Group = 'CONTROL' | 'AUDIOVITALITY';

export interface DropJumpSession {
  totalJumps: number;
  completed: boolean;
  sets: {
    reps: number;
    restTime: number;
    completed: boolean;
  }[];
}

export interface BiaData {
  r?: number; // Resistance (Ohms)
  xc?: number; // Reactance (Ohms)
  pha: number; // Phase Angle (Degrees)
  re?: number; // Resistance Extra-cellular (Ohms)
  ri?: number; // Resistance Intra-cellular (Ohms)
  cm?: number; // Capacitance membranaire (nF)
  fc?: number; // Fréquence caractéristique (kHz)
}

export interface ClinicalMetrics {
  nirs: number; // SmO2 %
  thb?: number; // Total Hemoglobin g/dL
  hrvRmssd: number; // ms
  hrvSdnn: number; // ms
  cmj: number; // cm
  mvic: number; // Maximum Voluntary Isometric Contraction (kg or N)
  skinTemperature?: number; // °C
  thighCircumference?: number; // cm
}

export interface Day0Data {
  completed: boolean;
  date: string;
  time?: string;
  hydrationCheck: boolean; // 500ml intake
  t0: ClinicalMetrics; // Baseline
  biaInitial: BiaData; // T0 Baseline
  quadricepsStiffnessInitial: number; // Distance talon-fesse in cm (lower is better)
  dropJumps: DropJumpSession;
  rpePost: number; // 0-10
  t1: ClinicalMetrics; // Post-Exercise
  evaPre?: number;
  evaPost?: number;
  sleepPre?: number;
  sleepPost?: number;
}

export interface Day1Data {
  completed: boolean;
  date: string;
  time?: string;
  evaPain: number; // 0-10 (Legacy)
  sleepQuality: number; // 1-10 (Legacy)
  t24h: ClinicalMetrics; // 24h follow-up
  evaPre?: number;
  evaPost?: number;
  sleepPre?: number;
  sleepPost?: number;
}

export interface TreatmentMoxyData {
  avgStartTHb: number;
  avgEndTHb: number;
  deltaTHb: number;
  slopeTHb: number;
  avgStartSmO2: number;
  avgEndSmO2: number;
  deltaSmO2: number;
  slopeSmO2: number;
}

export interface TimeSeriesPoint {
  time: number; // seconds
  smo2?: number;
  thb?: number;
  hr?: number;
  rmssd?: number;
}

export interface Day2Data {
  completed: boolean;
  date: string;
  time?: string;
  sleepQuality: number; // 1-10 (Legacy)
  urineDensity: number; // <= 1.025
  painSquatPre: number; // 0-10 (Legacy)
  t2: ClinicalMetrics; // T2 Pre-Session (Check Edema)
  biaPre: BiaData; // T2 Pre-Session (Check Edema)
  quadricepsStiffnessPre: number; // Distance talon-fesse in cm (T2)
  sessionDuration: number; // minutes (target 40)
  treatmentMoxy?: TreatmentMoxyData; // 40-minute continuous measurement
  treatmentTimeSeries?: TimeSeriesPoint[]; // 40-minute continuous time series data
  t3: ClinicalMetrics; // T3 Post-Session (Check Drainage)
  biaPost: BiaData; // T3 Post-Session (Check Drainage)
  quadricepsStiffnessPost: number; // Distance talon-fesse in cm (T3)
  painDelta: number; // Calculated or input
  evaPre?: number;
  evaPost?: number;
  sleepPre?: number;
  sleepPost?: number;
}

export interface ScreeningData {
  ageValid: boolean; // 18-60 years old
  noRecentInjuries: boolean; // No lower limb injuries in last 6 months
  noChronicPathology: boolean; // No cardiovascular, metabolic, or chronic inflammatory pathology
  noPacemaker: boolean; // No implanted electronic devices (Pacemaker)
  noAntiInflammatory: boolean; // No NSAIDs or heavy antioxidants
  consentSigned: boolean;
}

export interface FollowUpData {
  painResolvedDays: number | null; // Days until pain completely disappeared
  t72h?: ClinicalMetrics; // 72h post-exercise metrics
  biaT4?: BiaData; // 72h bio-impedance
  quadricepsStiffnessT4?: number; // 72h stiffness
  notes: string;
  evaPre?: number;
  evaPost?: number;
  sleepPre?: number;
  sleepPost?: number;
}

export interface Demographics {
  age: number | null;
  weight: number | null; // kg
  height: number | null; // cm
  gender: 'M' | 'F' | 'OTHER' | null;
}

export interface Subject {
  id: string;
  code: string; // e.g., SUB-001
  group: Group;
  name: string;
  createdAt: string;
  notes: string; // Clinical notes
  demographics: Demographics;
  screening: ScreeningData;
  day0: Day0Data;
  day1: Day1Data;
  day2: Day2Data;
  followUp: FollowUpData;
}

export type ViewState = 'LIST' | 'DASHBOARD' | 'PROTOCOL' | 'CALENDAR' | 'DATA_HUB' | 'PROFILE';
export type Language = 'fr' | 'en';

export interface AppState {
  subjects: Subject[];
  currentSubjectId: string | null;
  view: ViewState;
  fastTrackMode: boolean; // For dev/demo
  language: Language;
  blindMode: boolean;
}