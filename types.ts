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

export interface Day0Data {
  completed: boolean;
  date: string;
  hydrationCheck: boolean; // 500ml intake
  hrvBaseline: number; // ms
  smo2Baseline: number; // %
  cmjInitial: number; // cm (T0)
  dropJumps: DropJumpSession;
  rpePost: number; // 0-10
  cmjPost: number; // cm (T1)
}

export interface Day1Data {
  completed: boolean;
  date: string;
  evaPain: number; // 0-10
}

export interface Day2Data {
  completed: boolean;
  date: string;
  urineDensity: number; // <= 1.025
  painSquatPre: number; // 0-10
  hrvPre: number; // ms
  smo2Pre: number; // %
  cmjPreSession: number; // cm (T2 - Pre-Treatment)
  sessionDuration: number; // minutes (target 40)
  smo2Post: number; // %
  painDelta: number; // Calculated or input
  hrvRmssdFinal: number; // ms
  cmjRecovery: number; // cm (T3 - Post-Treatment)
}

export interface Subject {
  id: string;
  code: string; // e.g., SUB-001
  group: Group;
  name: string;
  createdAt: string;
  notes: string; // Clinical notes
  day0: Day0Data;
  day1: Day1Data;
  day2: Day2Data;
}

export type ViewState = 'LIST' | 'DASHBOARD' | 'PROTOCOL';

export interface AppState {
  subjects: Subject[];
  currentSubjectId: string | null;
  view: ViewState;
  fastTrackMode: boolean; // For dev/demo
}