
import { Subject, Day0Data, Day1Data, Day2Data, ClinicalMetrics, ScreeningData, FollowUpData, Demographics } from './types';

const EMPTY_METRICS: ClinicalMetrics = {
  nirs: 0,
  thb: 0,
  hrvRmssd: 0,
  hrvSdnn: 0,
  cmj: 0,
  mvic: 0
};

export const INITIAL_DEMOGRAPHICS: Demographics = {
  age: null,
  weight: null,
  height: null,
  gender: null,
};

export const INITIAL_SCREENING: ScreeningData = {
  ageValid: false,
  noRecentInjuries: false,
  noChronicPathology: false,
  noPacemaker: false,
  noAntiInflammatory: false,
  consentSigned: false,
};

export const INITIAL_FOLLOW_UP: FollowUpData = {
  painResolvedDays: null,
  notes: '',
};

export const INITIAL_DAY0: Day0Data = {
  completed: false,
  date: '',
  time: '',
  hydrationCheck: false,
  t0: { ...EMPTY_METRICS },
  biaInitial: { r: 0, xc: 0, pha: 0 },
  quadricepsStiffnessInitial: 0,
  dropJumps: {
    totalJumps: 0,
    completed: false,
    sets: Array(10).fill({ reps: 10, restTime: 60, completed: false }) // Default 10x10
  },
  rpePost: 0,
  t1: { ...EMPTY_METRICS },
};

export const INITIAL_DAY1: Day1Data = {
  completed: false,
  date: '',
  time: '',
  evaPain: 0,
  sleepQuality: 0,
  t24h: { ...EMPTY_METRICS },
};

export const INITIAL_DAY2: Day2Data = {
  completed: false,
  date: '',
  time: '',
  sleepQuality: 0,
  urineDensity: 0,
  painSquatPre: 0,
  t2: { ...EMPTY_METRICS },
  biaPre: { r: 0, xc: 0, pha: 0 },
  quadricepsStiffnessPre: 0,
  sessionDuration: 40,
  t3: { ...EMPTY_METRICS },
  biaPost: { r: 0, xc: 0, pha: 0 },
  quadricepsStiffnessPost: 0,
  painDelta: 0,
};

export const COLORS = {
  bg: '#F4F7F9',
  text: '#0F172A',
  bronze: '#C5A059',
  blue: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  white: '#FFFFFF',
};