import { Subject, Day0Data, Day1Data, Day2Data } from './types';

export const INITIAL_DAY0: Day0Data = {
  completed: false,
  date: '',
  hydrationCheck: false,
  hrvBaseline: 0,
  smo2Baseline: 0,
  cmjInitial: 0,
  dropJumps: {
    totalJumps: 0,
    completed: false,
    sets: Array(10).fill({ reps: 10, restTime: 60, completed: false }) // Default 10x10
  },
  rpePost: 0,
  cmjPost: 0,
};

export const INITIAL_DAY1: Day1Data = {
  completed: false,
  date: '',
  evaPain: 0,
};

export const INITIAL_DAY2: Day2Data = {
  completed: false,
  date: '',
  urineDensity: 0,
  painSquatPre: 0,
  hrvPre: 0,
  smo2Pre: 0,
  cmjPreSession: 0,
  sessionDuration: 40,
  smo2Post: 0,
  painDelta: 0,
  hrvRmssdFinal: 0,
  cmjRecovery: 0,
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