import React, { useMemo } from 'react';
import { Subject, Language } from '../types';
import { Button } from './Button';
import { CheckCircle, XCircle, Download, Database, Table as TableIcon, FileText } from 'lucide-react';
import { exportSubjectsToExcel, exportSubjectsToCSV } from '../services/excelService';

interface Props {
  subjects: Subject[];
  onUpdateSubject: (subject: Subject) => void;
  language: Language;
}

export const DataHub: React.FC<Props> = ({ subjects, language }) => {
  
  // Helper to check if a specific metric is filled
  const hasData = (subject: Subject, type: string) => {
    switch (type) {
      case 'j0_moxy': return (subject.day0.t0?.nirs || 0) > 0;
      case 'j0_hrv': return (subject.day0.t0?.hrvRmssd || 0) > 0;
      case 'j0_cmj': return (subject.day0.t0?.cmj || 0) > 0;
      case 'j1_eva': return (subject.day1.evaPain || 0) > 0;
      case 'j2_moxy_pre': return (subject.day2.t2?.nirs || 0) > 0;
      case 'j2_moxy_40m': return !!subject.day2.treatmentMoxy || (subject.day2.treatmentTimeSeries && subject.day2.treatmentTimeSeries.length > 0);
      case 'j2_moxy_post': return (subject.day2.t3?.nirs || 0) > 0;
      case 'j2_cmj': return (subject.day2.t3?.cmj || 0) > 0;
      default: return false;
    }
  };

  // Generate the exact same data as the Excel export for the preview table
  const excelPreviewData = useMemo(() => {
    return subjects.map(s => ({
      'ID': s.code,
      'Groupe': s.group,
      'J0 SmO2 Base': s.day0.t0?.nirs || '-',
      'J0 THb Base': s.day0.t0?.thb || '-',
      'J0 CMJ Base': s.day0.t0?.cmj || '-',
      'J0 HRV RMSSD Base': s.day0.t0?.hrvRmssd || '-',
      'J0 HRV SDNN Base': s.day0.t0?.hrvSdnn || '-',
      'J1 EVA': s.day1.evaPain || '-',
      'J2 SmO2 Pre': s.day2.t2?.nirs || '-',
      'J2 THb Pre': s.day2.t2?.thb || '-',
      'J2 Moxy 40m (ΔTHb)': s.day2.treatmentMoxy?.deltaTHb ?? '-',
      'J2 SmO2 Post': s.day2.t3?.nirs || '-',
      'J2 THb Post': s.day2.t3?.thb || '-',
      'J2 CMJ Recup': s.day2.t3?.cmj || '-',
      'J2 HRV RMSSD Final': s.day2.t3?.hrvRmssd || '-',
      'J2 HRV SDNN Final': s.day2.t3?.hrvSdnn || '-',
    }));
  }, [subjects]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-gray-100/50">
        <div>
          <h2 className="text-4xl font-bold text-medical-text tracking-tight mb-2 flex items-center gap-3">
            <Database className="w-8 h-8 text-medical-bronze" />
            Data Hub
          </h2>
          <p className="text-gray-500 text-lg">Résumé des données collectées et aperçu du fichier d'export final.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => exportSubjectsToCSV(subjects)} variant="secondary" className="shadow-sm">
            <FileText className="w-5 h-5 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={() => exportSubjectsToExcel(subjects)} variant="primary" className="shadow-lg shadow-medical-bronze/20">
            <Download className="w-5 h-5 mr-2" />
            Télécharger Excel
          </Button>
        </div>
      </div>

      {/* Completion Matrix */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-xl font-bold text-medical-text mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          Matrice de complétion globale
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Sujet</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J0 Moxy</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J0 HRV</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J0 CMJ</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J1 EVA</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J2 Moxy Pre</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J2 Moxy 40m</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J2 Moxy Post</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-center">J2 CMJ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.map(subject => (
                <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-medical-text">{subject.code}</div>
                    <div className="text-sm text-gray-500">{subject.name}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j0_moxy') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j0_hrv') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j0_cmj') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j1_eva') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j2_moxy_pre') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j2_moxy_40m') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j2_moxy_post') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasData(subject, 'j2_cmj') ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-200 mx-auto" />}
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">Aucun sujet enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excel Preview */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-xl font-bold text-medical-text mb-6 flex items-center gap-2">
          <TableIcon className="w-6 h-6 text-medical-blue" />
          Aperçu du fichier Excel final (Colonnes principales)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-medical-text bg-gray-50">
                {excelPreviewData.length > 0 && Object.keys(excelPreviewData[0]).map(key => (
                  <th key={key} className="py-3 px-4 font-bold text-medical-text text-xs whitespace-nowrap">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {excelPreviewData.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                      <span className={val === '-' ? 'text-gray-300' : 'font-medium'}>{val}</span>
                    </td>
                  ))}
                </tr>
              ))}
              {excelPreviewData.length === 0 && (
                <tr>
                  <td className="py-8 text-center text-gray-500">Aucune donnée à afficher.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-medical-bronze"></div>
          Note : Cet aperçu ne montre que les colonnes principales. Le fichier Excel complet contient toutes les variables (BIA, raideur, etc.).
        </div>
      </div>
    </div>
  );
};
