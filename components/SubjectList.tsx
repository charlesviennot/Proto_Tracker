import React, { useState } from 'react';
import { Subject, Language } from '../types';
import { Button } from './Button';
import { Search, Plus, User, Activity, CheckCircle, Clock, ChevronRight, X, Trash2, Calendar } from 'lucide-react';
import { t } from '../i18n';

interface Props {
  subjects: Subject[];
  onSelect: (id: string) => void;
  onViewProfile: (id: string) => void;
  onAdd: (name: string, group: 'CONTROL' | 'AUDIOVITALITY', schedule?: { day0Date: string, day0Time: string, day1Date: string, day1Time: string, day2Date: string, day2Time: string }) => void;
  onDelete: (id: string) => void;
  onUpdateSubject?: (updatedSubject: Subject) => void;
  onLoadExampleData: () => void;
  language: Language;
  blindMode: boolean;
}

export const SubjectList: React.FC<Props> = ({ subjects, onSelect, onViewProfile, onAdd, onDelete, onUpdateSubject, onLoadExampleData, language, blindMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<'CONTROL' | 'AUDIOVITALITY'>('AUDIOVITALITY');
  const [day0Date, setDay0Date] = useState('');
  const [day0Time, setDay0Time] = useState('');
  const [day1Date, setDay1Date] = useState('');
  const [day1Time, setDay1Time] = useState('');
  const [day2Date, setDay2Date] = useState('');
  const [day2Time, setDay2Time] = useState('');
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [subjectToEditSchedule, setSubjectToEditSchedule] = useState<Subject | null>(null);
  const [editScheduleData, setEditScheduleData] = useState({
    day0Date: '', day0Time: '',
    day1Date: '', day1Time: '',
    day2Date: '', day2Time: ''
  });

  const openEditSchedule = (subject: Subject) => {
    setEditScheduleData({
      day0Date: subject.day0.date || '', day0Time: subject.day0.time || '',
      day1Date: subject.day1.date || '', day1Time: subject.day1.time || '',
      day2Date: subject.day2.date || '', day2Time: subject.day2.time || ''
    });
    setSubjectToEditSchedule(subject);
  };

  const handleEditScheduleSave = () => {
    if (subjectToEditSchedule && onUpdateSubject) {
      onUpdateSubject({
        ...subjectToEditSchedule,
        day0: { ...subjectToEditSchedule.day0, date: editScheduleData.day0Date, time: editScheduleData.day0Time },
        day1: { ...subjectToEditSchedule.day1, date: editScheduleData.day1Date, time: editScheduleData.day1Time },
        day2: { ...subjectToEditSchedule.day2, date: editScheduleData.day2Date, time: editScheduleData.day2Time }
      });
      setSubjectToEditSchedule(null);
    }
  };

  const handleEditDay0DateChange = (date: string) => {
    setEditScheduleData(prev => {
      const next = { ...prev, day0Date: date };
      if (date) {
        const d0 = new Date(date);
        
        const d1 = new Date(d0);
        d1.setDate(d1.getDate() + 1);
        next.day1Date = d1.toISOString().split('T')[0];
        
        const d2 = new Date(d0);
        d2.setDate(d2.getDate() + 2);
        next.day2Date = d2.toISOString().split('T')[0];
      }
      return next;
    });
  };

  const handleEditDay0TimeChange = (time: string) => {
    setEditScheduleData(prev => {
      const next = { ...prev, day0Time: time };
      if (time) {
        if (!prev.day1Time) next.day1Time = time;
        if (!prev.day2Time) next.day2Time = time;
      }
      return next;
    });
  };

  const handleDay0DateChange = (date: string) => {
    setDay0Date(date);
    if (date) {
      const d0 = new Date(date);
      
      const d1 = new Date(d0);
      d1.setDate(d1.getDate() + 1);
      setDay1Date(d1.toISOString().split('T')[0]);
      
      const d2 = new Date(d0);
      d2.setDate(d2.getDate() + 2);
      setDay2Date(d2.toISOString().split('T')[0]);
    }
  };

  const handleDay0TimeChange = (time: string) => {
    setDay0Time(time);
    if (time) {
      if (!day1Time) setDay1Time(time);
      if (!day2Time) setDay2Time(time);
    }
  };

  const filtered = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName, newGroup, { day0Date, day0Time, day1Date, day1Time, day2Date, day2Time });
      setNewName('');
      setDay0Date('');
      setDay0Time('');
      setDay1Date('');
      setDay1Time('');
      setDay2Date('');
      setDay2Time('');
      setIsAdding(false);
    }
  };

  const getStatusBadge = (s: Subject) => {
    if (s.day2.completed) return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/> Terminé</span>;
    if (s.day1.completed) return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Attente J2</span>;
    if (s.day0.completed) return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Attente J1</span>;
    return <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> À initier</span>;
  };

  const getNextAppointment = (s: Subject) => {
    if (!s.day0.completed && s.day0.date) return { label: 'J0', date: s.day0.date, time: s.day0.time };
    if (s.day0.completed && !s.day1.completed && s.day1.date) return { label: 'J1', date: s.day1.date, time: s.day1.time };
    if (s.day1.completed && !s.day2.completed && s.day2.date) return { label: 'J2', date: s.day2.date, time: s.day2.time };
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Delete Confirmation Modal */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-medical-text mb-2">Supprimer le sujet</h3>
            <p className="text-gray-500 mb-6">Êtes-vous sûr de vouloir supprimer définitivement le sujet {subjectToDelete.code} ({subjectToDelete.name}) ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSubjectToDelete(null)}>Annuler</Button>
              <Button variant="primary" className="bg-red-500 hover:bg-red-600 border-none text-white shadow-lg shadow-red-500/20" onClick={() => {
                onDelete(subjectToDelete.id);
                setSubjectToDelete(null);
              }}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {subjectToEditSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-medical-text">Éditer le planning</h3>
                <p className="text-gray-500 text-sm mt-1">{subjectToEditSchedule.name} ({subjectToEditSchedule.code})</p>
              </div>
              <button onClick={() => setSubjectToEditSchedule(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Day 0 */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="font-bold text-sm text-medical-text flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-medical-bronze/10 text-medical-bronze flex items-center justify-center text-xs">J0</span>
                  Baseline & Lésion
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Date</label>
                    <input type="date" value={editScheduleData.day0Date} onChange={e => handleEditDay0DateChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-bronze outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Heure</label>
                    <input type="time" value={editScheduleData.day0Time} onChange={e => handleEditDay0TimeChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-bronze outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Day 1 */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="font-bold text-sm text-medical-text flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-medical-blue/10 text-medical-blue flex items-center justify-center text-xs">J1</span>
                  Suivi 24h
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Date</label>
                    <input type="date" value={editScheduleData.day1Date} onChange={e => setEditScheduleData(prev => ({ ...prev, day1Date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-blue outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Heure</label>
                    <input type="time" value={editScheduleData.day1Time} onChange={e => setEditScheduleData(prev => ({ ...prev, day1Time: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-blue outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="font-bold text-sm text-medical-text flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs">J2</span>
                  Suivi 48h & Récup
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Date</label>
                    <input type="date" value={editScheduleData.day2Date} onChange={e => setEditScheduleData(prev => ({ ...prev, day2Date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">Heure</label>
                    <input type="time" value={editScheduleData.day2Time} onChange={e => setEditScheduleData(prev => ({ ...prev, day2Time: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="secondary" onClick={() => setSubjectToEditSchedule(null)}>Annuler</Button>
              <Button variant="primary" onClick={handleEditScheduleSave}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2 border-b border-gray-100/50">
        <div>
          <h2 className="text-4xl font-bold text-medical-text tracking-tight mb-2">Protocole DOMS</h2>
          <p className="text-gray-500 text-lg">Suivi des sujets et objectivation clinique.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="bronze" className="shadow-lg shadow-yellow-900/10">
            <Plus className="w-5 h-5 mr-2" /> {t('newSubject', language)}
          </Button>
        )}
      </div>

      {/* Creation Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-medical-bronze/20 animate-in slide-in-from-top duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-medical-bronze"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-medical-text">Ajouter un participant</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-3">Nom complet</label>
                <input 
                  type="text" 
                  placeholder="Ex: Jean Dupont" 
                  className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-medical-bronze focus:border-transparent transition-all outline-none"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-3">Groupe d'étude</label>
                <div className="relative">
                  <select 
                    value={newGroup} 
                    onChange={(e) => setNewGroup(e.target.value as any)}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-medical-bronze focus:border-transparent transition-all outline-none appearance-none"
                  >
                    <option value="AUDIOVITALITY">AudioVitality (Traitement)</option>
                    <option value="CONTROL">Groupe Contrôle</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-medical-text border-b border-gray-100 pb-2">Planification des visites</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Day 0 */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="font-bold text-sm text-medical-text flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-medical-bronze/10 text-medical-bronze flex items-center justify-center text-xs">J0</span>
                    Baseline & Lésion
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Date</label>
                      <input type="date" value={day0Date} onChange={e => handleDay0DateChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-bronze outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Heure</label>
                      <input type="time" value={day0Time} onChange={e => handleDay0TimeChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-bronze outline-none" />
                    </div>
                  </div>
                </div>

                {/* Day 1 */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="font-bold text-sm text-medical-text flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-medical-blue/10 text-medical-blue flex items-center justify-center text-xs">J1</span>
                    Suivi 24h
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Date</label>
                      <input type="date" value={day1Date} onChange={e => setDay1Date(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-blue outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Heure</label>
                      <input type="time" value={day1Time} onChange={e => setDay1Time(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-medical-blue outline-none" />
                    </div>
                  </div>
                </div>

                {/* Day 2 */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="font-bold text-sm text-medical-text flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs">J2</span>
                    Suivi 48h & Récup
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Date</label>
                      <input type="date" value={day2Date} onChange={e => setDay2Date(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Heure</label>
                      <input type="time" value={day2Time} onChange={e => setDay2Time(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="h-[50px] px-8">Valider la fiche</Button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
           <Search className="h-5 w-5 text-gray-400 group-focus-within:text-medical-bronze transition-colors" />
         </div>
         <input 
           type="text" 
           placeholder={t('searchPlaceholder', language)} 
           className="block w-full pl-14 pr-6 py-4 bg-white text-lg text-medical-text placeholder-gray-400 focus:ring-2 focus:ring-medical-bronze/30 focus:border-medical-bronze/30 border border-transparent rounded-[2rem] shadow-sm hover:shadow-md transition-all outline-none"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(subject => (
          <div
            key={subject.id} 
            onClick={() => onSelect(subject.id)}
            className="w-full text-left bg-white p-5 md:p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-4 group relative overflow-hidden"
          >
            {/* Left Color Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${subject.group === 'AUDIOVITALITY' ? 'bg-medical-bronze' : 'bg-medical-blue'}`} />

            <div className="flex items-center w-full md:w-auto gap-5 pl-3">
               <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 transition-colors ${subject.group === 'AUDIOVITALITY' ? 'bg-[#F9F5EB] text-[#C5A059]' : 'bg-blue-50 text-blue-600'}`}>
                 <User className="w-7 h-7" />
               </div>
               <div>
                 <h4 className="text-xl font-bold text-medical-text group-hover:text-medical-bronze transition-colors">
                   {blindMode ? 'Sujet Anonymisé' : subject.name}
                 </h4>
                 <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                   <span className="font-mono font-medium text-gray-400">{subject.code}</span>
                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                   <span className={`${subject.group === 'AUDIOVITALITY' ? 'text-[#9A7B3E] font-medium' : 'text-blue-600 font-medium'}`}>
                     {subject.group === 'AUDIOVITALITY' ? 'Groupe Traité' : 'Contrôle'}
                   </span>
                   {(() => {
                     const nextAppt = getNextAppointment(subject);
                     if (nextAppt) {
                       return (
                         <>
                           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                           <span className="flex items-center gap-1 text-gray-500">
                             <Calendar className="w-3.5 h-3.5" />
                             {nextAppt.label} : {new Date(nextAppt.date).toLocaleDateString('fr-FR')} {nextAppt.time ? `à ${nextAppt.time}` : ''}
                           </span>
                         </>
                       );
                     }
                     return null;
                   })()}
                 </div>
               </div>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto gap-4 pl-3 md:pl-0">
               {getStatusBadge(subject)}
               
               <div className="flex items-center gap-2">
                 {/* View Profile Button */}
                 <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onViewProfile(subject.id);
                    }}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-500 transition-all shadow-sm z-30 relative"
                    title="Voir le profil patient"
                 >
                    <User className="w-4 h-4 pointer-events-none" />
                 </button>

                 {/* Edit Schedule Button */}
                 <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditSchedule(subject);
                    }}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-500 transition-all shadow-sm z-30 relative"
                    title="Éditer le planning"
                 >
                    <Calendar className="w-4 h-4 pointer-events-none" />
                 </button>

                 {/* Delete Button */}
                 <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSubjectToDelete(subject);
                    }}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all shadow-sm z-30 relative"
                    title="Supprimer définitivement"
                 >
                    <Trash2 className="w-4 h-4 pointer-events-none" />
                 </button>

                 <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-medical-bronze group-hover:text-white transition-colors">
                   <ChevronRight className="w-5 h-5" />
                 </div>
               </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white/50 rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-lg">{t('noSubjects', language)}</p>
            <p className="text-sm mb-6">{t('startByAdding', language)}</p>
            <Button onClick={onLoadExampleData} variant="secondary">
              {t('loadExample', language)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};