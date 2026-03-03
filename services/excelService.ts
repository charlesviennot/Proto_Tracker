
import * as XLSX from 'xlsx';
import { Subject } from '../types';

export const exportSubjectsToExcel = (subjects: Subject[]) => {
  const flattenedData = subjects.map(s => ({
    ID: s.code,
    Name: s.name,
    Group: s.group,
    Notes: s.notes || '',
    
    // Screening
    'Screening Age Valid': s.screening?.ageValid ? 'Yes' : 'No',
    'Screening No Injuries': s.screening?.noRecentInjuries ? 'Yes' : 'No',
    'Screening No NSAIDs': s.screening?.noAntiInflammatory ? 'Yes' : 'No',
    'Screening Consent': s.screening?.consentSigned ? 'Yes' : 'No',

    // Day 0
    'D0 Date': s.day0.date,
    'D0 Hydration': s.day0.hydrationCheck ? 'OK' : 'NO',
    'D0 HRV Baseline': s.day0.t0?.hrvRmssd,
    'D0 SmO2 Baseline': s.day0.t0?.nirs,
    'D0 THb Baseline': s.day0.t0?.thb,
    'D0 Quad Stiffness (°)' : s.day0.quadricepsStiffnessInitial,
    'D0 BIA R': s.day0.biaInitial.r,
    'D0 BIA Xc': s.day0.biaInitial.xc,
    'D0 BIA PhA': s.day0.biaInitial.pha,
    'D0 CMJ T0 (Base)': s.day0.t0?.cmj,
    'D0 RPE Post': s.day0.rpePost,
    'D0 CMJ T1 (Fatigue)': s.day0.t1?.cmj,
    'D0 SmO2 Fatigue': s.day0.t1?.nirs,
    'D0 THb Fatigue': s.day0.t1?.thb,
    'D0 CMJ Decline (%)': (s.day0.t0?.cmj || 0) > 0 ? (((s.day0.t1?.cmj || 0) - (s.day0.t0?.cmj || 0)) / (s.day0.t0?.cmj || 1) * 100).toFixed(2) : 0,

    // Day 1
    'D1 Date': s.day1.date,
    'D1 EVA Pain': s.day1.evaPain,

    // Day 2
    'D2 Date': s.day2.date,
    'D2 Urine Density': s.day2.urineDensity,
    'D2 Squat Pain Pre': s.day2.painSquatPre,
    'D2 HRV Pre': s.day2.t2?.hrvRmssd,
    'D2 SmO2 Pre': s.day2.t2?.nirs,
    'D2 THb Pre': s.day2.t2?.thb,
    'D2 Quad Stiffness Pre (°)': s.day2.quadricepsStiffnessPre,
    'D2 BIA Pre R (T2)': s.day2.biaPre.r,
    'D2 BIA Pre Xc (T2)': s.day2.biaPre.xc,
    'D2 BIA Pre PhA (T2)': s.day2.biaPre.pha,
    'D2 CMJ T2 (Pre-Session)': s.day2.t2?.cmj,
    
    // Treatment 40-min
    'D2 Treatment THb Base (0-2m)': s.day2.treatmentMoxy?.avgStartTHb,
    'D2 Treatment THb End (38-40m)': s.day2.treatmentMoxy?.avgEndTHb,
    'D2 Treatment THb Delta': s.day2.treatmentMoxy?.deltaTHb,
    'D2 Treatment THb Slope (/min)': s.day2.treatmentMoxy?.slopeTHb,
    'D2 Treatment SmO2 Base (0-2m)': s.day2.treatmentMoxy?.avgStartSmO2,
    'D2 Treatment SmO2 End (38-40m)': s.day2.treatmentMoxy?.avgEndSmO2,
    'D2 Treatment SmO2 Delta': s.day2.treatmentMoxy?.deltaSmO2,
    'D2 Treatment SmO2 Slope (/min)': s.day2.treatmentMoxy?.slopeSmO2,

    'D2 SmO2 Post': s.day2.t3?.nirs,
    'D2 THb Post': s.day2.t3?.thb,
    'D2 SmO2 Gain': (s.day2.t3?.nirs || 0) - (s.day2.t2?.nirs || 0),
    'D2 THb Gain': (s.day2.t3?.thb || 0) - (s.day2.t2?.thb || 0),
    'D2 Quad Stiffness Post (°)': s.day2.quadricepsStiffnessPost,
    'D2 Quad Gain (°)': s.day2.quadricepsStiffnessPre - s.day2.quadricepsStiffnessPost,
    'D2 BIA Post R (T3)': s.day2.biaPost.r,
    'D2 BIA Post Xc (T3)': s.day2.biaPost.xc,
    'D2 BIA Post PhA (T3)': s.day2.biaPost.pha,
    'D2 HRV Final': s.day2.t3?.hrvRmssd,
    'D2 CMJ T3 (Recovery)': s.day2.t3?.cmj,

    // Follow-up
    'Follow-up Pain Resolved (Days)': s.followUp?.painResolvedDays ?? 'N/A',
    'Follow-up Notes': s.followUp?.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(flattenedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clinical Data");
  
  // Generate filename with timestamp
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `AudioVitality_Study_Export_${date}.xlsx`);
};