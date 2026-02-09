import * as XLSX from 'xlsx';
import { Subject } from '../types';

export const exportSubjectsToExcel = (subjects: Subject[]) => {
  const flattenedData = subjects.map(s => ({
    ID: s.code,
    Name: s.name,
    Group: s.group,
    Notes: s.notes || '',
    
    // Day 0
    'D0 Date': s.day0.date,
    'D0 Hydration': s.day0.hydrationCheck ? 'OK' : 'NO',
    'D0 HRV Baseline': s.day0.hrvBaseline,
    'D0 SmO2 Baseline': s.day0.smo2Baseline,
    'D0 CMJ T0 (Base)': s.day0.cmjInitial,
    'D0 RPE Post': s.day0.rpePost,
    'D0 CMJ T1 (Fatigue)': s.day0.cmjPost,
    'D0 CMJ Decline (%)': s.day0.cmjInitial > 0 ? ((s.day0.cmjPost - s.day0.cmjInitial) / s.day0.cmjInitial * 100).toFixed(2) : 0,

    // Day 1
    'D1 Date': s.day1.date,
    'D1 EVA Pain': s.day1.evaPain,

    // Day 2
    'D2 Date': s.day2.date,
    'D2 Urine Density': s.day2.urineDensity,
    'D2 Squat Pain Pre': s.day2.painSquatPre,
    'D2 HRV Pre': s.day2.hrvPre,
    'D2 SmO2 Pre': s.day2.smo2Pre,
    'D2 CMJ T2 (Pre-Session)': s.day2.cmjPreSession,
    'D2 SmO2 Post': s.day2.smo2Post,
    'D2 SmO2 Gain': s.day2.smo2Post - s.day2.smo2Pre,
    'D2 HRV Final': s.day2.hrvRmssdFinal,
    'D2 CMJ T3 (Recovery)': s.day2.cmjRecovery
  }));

  const ws = XLSX.utils.json_to_sheet(flattenedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clinical Data");
  
  // Generate filename with timestamp
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `AudioVitality_Study_Export_${date}.xlsx`);
};