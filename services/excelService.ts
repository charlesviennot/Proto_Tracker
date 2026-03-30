
import * as XLSX from 'xlsx';
import { Subject } from '../types';

export const exportSubjectsToExcel = (subjects: Subject[]) => {
  const flattenedData = subjects.map(flattenSubjectData);

  const ws = XLSX.utils.json_to_sheet(flattenedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clinical Data");
  
  // Generate filename with timestamp
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `AudioVitality_Study_Export_${date}.xlsx`);
};

export const exportSubjectsToCSV = (subjects: Subject[]) => {
  const flattenedData = subjects.map(flattenSubjectData);

  const ws = XLSX.utils.json_to_sheet(flattenedData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `AudioVitality_Study_Export_${date}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const flattenSubjectData = (s: Subject) => ({
    ID: s.code,
    Name: s.name,
    Group: s.group,
    Notes: s.notes || '',
    
    // Screening
    'Screening Age Valid': s.screening?.ageValid ? 'Oui' : 'Non',
    'Screening No Injuries': s.screening?.noRecentInjuries ? 'Oui' : 'Non',
    'Screening No NSAIDs': s.screening?.noAntiInflammatory ? 'Oui' : 'Non',
    'Screening Consent': s.screening?.consentSigned ? 'Oui' : 'Non',

    // J0 (Day 0)
    'J0 Date': s.day0.date,
    'J0 Hydratation': s.day0.hydrationCheck ? 'OK' : 'NO',
    'J0 EVA Avant': s.day0.evaPre,
    'J0 EVA Après': s.day0.evaPost,
    'J0 Score Sommeil Avant': s.day0.sleepPre,
    'J0 Score Sommeil Après': s.day0.sleepPost,
    'J0 HRV RMSSD Baseline': s.day0.t0?.hrvRmssd,
    'J0 HRV SDNN Baseline': s.day0.t0?.hrvSdnn,
    'J0 SmO2 Baseline': s.day0.t0?.nirs,
    'J0 THb Baseline': s.day0.t0?.thb,
    'J0 Température Cutanée Baseline': s.day0.t0?.skinTemperature,
    'J0 Circonférence Cuisse Baseline': s.day0.t0?.thighCircumference,
    'J0 Raideur Quad (cm)' : s.day0.quadricepsStiffnessInitial,
    'J0 BIA R': s.day0.biaInitial.r,
    'J0 BIA Xc': s.day0.biaInitial.xc,
    'J0 BIA PhA': s.day0.biaInitial.pha,
    'J0 CMJ Avant Effort': s.day0.t0?.cmj,
    'J0 RPE Post': s.day0.rpePost,
    'J0 CMJ Après Effort': s.day0.t1?.cmj,
    'J0 SmO2 Fatigue': s.day0.t1?.nirs,
    'J0 THb Fatigue': s.day0.t1?.thb,
    'J0 Température Cutanée Fatigue': s.day0.t1?.skinTemperature,
    'J0 Circonférence Cuisse Fatigue': s.day0.t1?.thighCircumference,
    'J0 CMJ Déclin (%)': (s.day0.t0?.cmj || 0) > 0 ? (((s.day0.t1?.cmj || 0) - (s.day0.t0?.cmj || 0)) / (s.day0.t0?.cmj || 1) * 100).toFixed(2) : 0,

    // J1 (Day 1)
    'J1 Date': s.day1.date,
    'J1 EVA Pain (Legacy)': s.day1.evaPain,
    'J1 Score Sommeil': s.day1.sleepQuality,
    'J1 EVA Avant': s.day1.evaPre,
    'J1 EVA Après': s.day1.evaPost,
    'J1 Score Sommeil Avant': s.day1.sleepPre,
    'J1 Score Sommeil Après': s.day1.sleepPost,
    'J1 HRV RMSSD 24h': s.day1.t24h?.hrvRmssd,
    'J1 HRV SDNN 24h': s.day1.t24h?.hrvSdnn,
    'J1 SmO2 24h': s.day1.t24h?.nirs,
    'J1 THb 24h': s.day1.t24h?.thb,
    'J1 Température Cutanée 24h': s.day1.t24h?.skinTemperature,
    'J1 Circonférence Cuisse 24h': s.day1.t24h?.thighCircumference,
    'J1 CMJ 24h': s.day1.t24h?.cmj,

    // J2 (Day 2)
    'J2 Date': s.day2.date,
    'J2 Densité Urine': s.day2.urineDensity,
    'J2 Squat Pain Pre (Legacy)': s.day2.painSquatPre,
    'J2 EVA Avant': s.day2.evaPre,
    'J2 EVA Après': s.day2.evaPost,
    'J2 Score Sommeil Avant': s.day2.sleepPre,
    'J2 Score Sommeil Après': s.day2.sleepPost,
    'J2 HRV RMSSD Pre': s.day2.t2?.hrvRmssd,
    'J2 HRV SDNN Pre': s.day2.t2?.hrvSdnn,
    'J2 SmO2 Pre': s.day2.t2?.nirs,
    'J2 THb Pre': s.day2.t2?.thb,
    'J2 Température Cutanée Pre': s.day2.t2?.skinTemperature,
    'J2 Circonférence Cuisse Pre': s.day2.t2?.thighCircumference,
    'J2 Raideur Quad Pre (cm)': s.day2.quadricepsStiffnessPre,
    'J2 BIA Pre R (T2)': s.day2.biaPre.r,
    'J2 BIA Pre Xc (T2)': s.day2.biaPre.xc,
    'J2 BIA Pre PhA (T2)': s.day2.biaPre.pha,
    'J2 CMJ Avant Séance': s.day2.t2?.cmj,
    
    // Treatment 40-min
    'J2 Traitement THb Base (0-2m)': s.day2.treatmentMoxy?.avgStartTHb,
    'J2 Traitement THb Fin (38-40m)': s.day2.treatmentMoxy?.avgEndTHb,
    'J2 Traitement THb Delta': s.day2.treatmentMoxy?.deltaTHb,
    'J2 Traitement THb Pente (/min)': s.day2.treatmentMoxy?.slopeTHb,
    'J2 Traitement SmO2 Base (0-2m)': s.day2.treatmentMoxy?.avgStartSmO2,
    'J2 Traitement SmO2 Fin (38-40m)': s.day2.treatmentMoxy?.avgEndSmO2,
    'J2 Traitement SmO2 Delta': s.day2.treatmentMoxy?.deltaSmO2,
    'J2 Traitement SmO2 Pente (/min)': s.day2.treatmentMoxy?.slopeSmO2,

    'J2 SmO2 Post': s.day2.t3?.nirs,
    'J2 THb Post': s.day2.t3?.thb,
    'J2 Température Cutanée Post': s.day2.t3?.skinTemperature,
    'J2 Circonférence Cuisse Post': s.day2.t3?.thighCircumference,
    'J2 SmO2 Gain': (s.day2.t3?.nirs || 0) - (s.day2.t2?.nirs || 0),
    'J2 THb Gain': (s.day2.t3?.thb || 0) - (s.day2.t2?.thb || 0),
    'J2 Raideur Quad Post (cm)': s.day2.quadricepsStiffnessPost,
    'J2 Raideur Quad Gain (cm)': s.day2.quadricepsStiffnessPre - s.day2.quadricepsStiffnessPost,
    'J2 BIA Post R (T3)': s.day2.biaPost.r,
    'J2 BIA Post Xc (T3)': s.day2.biaPost.xc,
    'J2 BIA Post PhA (T3)': s.day2.biaPost.pha,
    'J2 HRV RMSSD Final': s.day2.t3?.hrvRmssd,
    'J2 HRV SDNN Final': s.day2.t3?.hrvSdnn,
    'J2 CMJ Après Séance': s.day2.t3?.cmj,

    // Jour 3 (Follow-up 72h)
    'Jour 3 Douleur Disparue (Jours)': s.followUp?.painResolvedDays ?? 'N/A',
    'Jour 3 EVA Avant': s.followUp?.evaPre,
    'Jour 3 EVA Après': s.followUp?.evaPost,
    'Jour 3 Score Sommeil Avant': s.followUp?.sleepPre,
    'Jour 3 Score Sommeil Après': s.followUp?.sleepPost,
    'Jour 3 SmO2 72h': s.followUp?.t72h?.nirs,
    'Jour 3 THb 72h': s.followUp?.t72h?.thb,
    'Jour 3 Température Cutanée 72h': s.followUp?.t72h?.skinTemperature,
    'Jour 3 Circonférence Cuisse 72h': s.followUp?.t72h?.thighCircumference,
    'Jour 3 HRV RMSSD 72h': s.followUp?.t72h?.hrvRmssd,
    'Jour 3 HRV SDNN 72h': s.followUp?.t72h?.hrvSdnn,
    'Jour 3 CMJ 72h': s.followUp?.t72h?.cmj,
    'Jour 3 Notes': s.followUp?.notes || ''
});