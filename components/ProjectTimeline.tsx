import React, { useState, useEffect, useRef } from 'react';
import { TimelineEvent, Language } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Check, X, Calendar as CalendarIcon, Clock, Flag, FileText, Activity, Users, Download, Loader2, LayoutList, CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { t } from '../i18n';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  isSameDay,
  parseISO
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const getContrastYIQ = (hexcolor: string) => {
  if (!hexcolor) return 'black';
  hexcolor = hexcolor.replace("#", "");
  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split('').map(c => c + c).join('');
  }
  const r = parseInt(hexcolor.substring(0,2),16);
  const g = parseInt(hexcolor.substring(2,2),16);
  const b = parseInt(hexcolor.substring(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
};

interface Props {
  language: Language;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  { 
    id: '1', 
    title: '1. PRÉPARATION', 
    startDate: '2026-03-16', 
    endDate: '2026-03-29', 
    status: 'IN_PROGRESS', 
    description: 'Phase de préparation du protocole S20.',
    actions: [
      { id: '1-1', title: 'Logistique & Tests', startDate: '2026-03-16', endDate: '2026-03-22', description: 'Réception Moxy NIRS, Crash Test du protocole sur l\'équipe.', status: 'IN_PROGRESS', color: '#3b82f6' },
      { id: '1-2', title: 'Recrutement', startDate: '2026-03-23', endDate: '2026-03-29', description: 'Screening des 24 sujets, verrouillage du planning des visites.', status: 'TODO', color: '#8b5cf6' }
    ]
  },
  { 
    id: '2', 
    title: '2. CLINIQUE', 
    startDate: '2026-04-06', 
    endDate: '2026-05-15', 
    status: 'TODO', 
    description: 'Phase clinique et collecte de données.',
    actions: [
      { id: '2-1', title: '🚩 FIRST SUBJECT IN (FSI)', startDate: '2026-04-06', endDate: '2026-04-06', description: 'Jalon : Début des inductions (100 Drop Jumps) pour le premier sujet.', status: 'TODO', color: '#ef4444' },
      { id: '2-2', title: 'Expérimentation (L\'Usine)', startDate: '2026-04-06', endDate: '2026-05-03', description: '~6 sujets/sem. Traitement des CSV "au fil de l\'eau" chaque soir.', status: 'TODO', color: '#10b981' },
      { id: '2-3', title: '🚩 LAST SUBJECT OUT (LSO)', startDate: '2026-05-15', endDate: '2026-05-15', description: 'Jalon : Fin officielle de la collecte de données sur le terrain.', status: 'TODO', color: '#ef4444' }
    ]
  },
  { 
    id: '3', 
    title: '3. DATA & STATS', 
    startDate: '2026-05-18', 
    endDate: '2026-05-29', 
    status: 'TODO', 
    description: 'Traitement des données et analyses statistiques.',
    actions: [
      { id: '3-1', title: 'Data Cleaning', startDate: '2026-05-18', endDate: '2026-05-22', description: 'Nettoyage de la base eCRF, identification des valeurs aberrantes.', status: 'TODO', color: '#f59e0b' },
      { id: '3-2', title: 'Analyses Statistiques', startDate: '2026-05-22', endDate: '2026-05-29', description: 'Tests ANOVA / Modèles Mixtes (Comparaison LFVSS vs Repos).', status: 'TODO', color: '#06b6d4' },
      { id: '3-3', title: '🚩 Présentation R&D', startDate: '2026-05-29', endDate: '2026-05-29', description: 'Jalon : Restitution interne des résultats (Graphiques) au CEO.', status: 'TODO', color: '#ef4444' }
    ]
  },
  { 
    id: '4', 
    title: '4. MASTER', 
    startDate: '2026-05-15', 
    endDate: '2026-05-26', 
    status: 'TODO', 
    description: 'Rédaction et dépôt du mémoire.',
    actions: [
      { id: '4-1', title: 'Rédaction Académique', startDate: '2026-05-15', endDate: '2026-05-25', description: 'Rédaction finale de la "Discussion" du mémoire, mise en forme APA.', status: 'TODO', color: '#6366f1' },
      { id: '4-2', title: '🚨 DÉPÔT DU MÉMOIRE', startDate: '2026-05-26', endDate: '2026-05-26', description: 'Deadline absolue : Envoi du PDF à la Faculté de Lorraine.', status: 'TODO', color: '#ef4444' }
    ]
  },
  { 
    id: '5', 
    title: '5. PUBLICATION', 
    startDate: '2026-06-01', 
    endDate: '2026-07-15', 
    status: 'TODO', 
    description: 'Publication scientifique.',
    actions: [
      { id: '5-1', title: 'Rédaction Article', startDate: '2026-06-01', endDate: '2026-06-30', description: 'Reformatage en "Paper" scientifique (IMRaD 4000 mots, Anglais).', status: 'TODO', color: '#ec4899' },
      { id: '5-2', title: '🚩 Soumission', startDate: '2026-07-15', endDate: '2026-07-15', description: 'Jalon : Soumission au comité de lecture (Cureus / Frontiers).', status: 'TODO', color: '#ef4444' }
    ]
  }
];

export const ProjectTimeline: React.FC<Props> = ({ language }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimelineEvent>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const docRef = doc(db, 'settings', 'timeline');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedEvents = docSnap.data().events || [];
          // Auto-migrate if old defaults are detected
          if (fetchedEvents.length > 0 && fetchedEvents[0].title === 'Phase de recrutement' && fetchedEvents[0].startDate === '2024-01-01') {
            await setDoc(docRef, { events: DEFAULT_EVENTS });
            setEvents(DEFAULT_EVENTS);
          } else {
            setEvents(fetchedEvents);
          }
        } else {
          // Initialize with defaults
          await setDoc(docRef, { events: DEFAULT_EVENTS });
          setEvents(DEFAULT_EVENTS);
        }
      } catch (error) {
        console.error("Error fetching timeline:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const saveEvents = async (newEvents: TimelineEvent[]) => {
    try {
      await setDoc(doc(db, 'settings', 'timeline'), { events: newEvents });
      setEvents(newEvents);
    } catch (error) {
      console.error("Error saving timeline:", error);
      setAlertMessage("Erreur lors de la sauvegarde.");
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setEditForm(event);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!editForm.title) {
      setAlertMessage("Le titre de la phase est obligatoire.");
      return;
    }

    const actions = editForm.actions || [];
    if (actions.length === 0) {
      setAlertMessage("Veuillez ajouter au moins une action.");
      return;
    }

    // Auto-calculate dates and status based on actions
    const startDates = actions.map(a => new Date(a.startDate).getTime()).filter(t => !isNaN(t));
    const endDates = actions.map(a => new Date(a.endDate || a.startDate).getTime()).filter(t => !isNaN(t));
    
    const minDate = startDates.length > 0 ? new Date(Math.min(...startDates)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const maxDate = endDates.length > 0 ? new Date(Math.max(...endDates)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const allDone = actions.every(a => a.status === 'DONE');
    const anyInProgress = actions.some(a => a.status === 'IN_PROGRESS');
    const anyDone = actions.some(a => a.status === 'DONE');
    
    let phaseStatus = 'TODO';
    if (allDone) phaseStatus = 'DONE';
    else if (anyInProgress || anyDone) phaseStatus = 'IN_PROGRESS';

    const phaseData = {
      ...editForm,
      startDate: minDate,
      endDate: maxDate,
      status: phaseStatus,
      description: editForm.description || ''
    };

    let newEvents: TimelineEvent[];
    if (isAdding) {
      const newEvent = {
        ...phaseData,
        id: crypto.randomUUID(),
      } as TimelineEvent;
      newEvents = [...events, newEvent];
    } else {
      newEvents = events.map(e => e.id === editingId ? { ...e, ...phaseData } as TimelineEvent : e);
    }

    // Sort by start date
    newEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    await saveEvents(newEvents);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      const newEvents = events.filter(e => e.id !== deleteConfirmId);
      await saveEvents(newEvents);
      setDeleteConfirmId(null);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId('new');
    const today = new Date().toISOString().split('T')[0];
    setEditForm({
      title: '',
      actions: [{
        id: crypto.randomUUID(),
        title: '',
        startDate: today,
        endDate: today,
        description: '',
        status: 'TODO'
      }]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'TODO': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DONE': return 'Terminé';
      case 'IN_PROGRESS': return 'En cours';
      case 'TODO': return 'À faire';
      default: return status;
    }
  };

  const getIconForTitle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('recrutement')) return <Users className="w-5 h-5" />;
    if (t.includes('premier') || t.includes('dernier') || t.includes('jalon') || t.includes('🚩')) return <Flag className="w-5 h-5" />;
    if (t.includes('donnée') || t.includes('data') || t.includes('stat')) return <Activity className="w-5 h-5" />;
    if (t.includes('article') || t.includes('rédaction') || t.includes('mémoire') || t.includes('🚨')) return <FileText className="w-5 h-5" />;
    return <CalendarIcon className="w-5 h-5" />;
  };

  const handleExportPDF = async () => {
    if (!timelineRef.current) return;
    
    setIsExporting(true);
    
    // Small delay to allow React to re-render and hide buttons
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(timelineRef.current!, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc', // slate-50 to match bg
          windowWidth: 1200 // Force a good width for the export
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save('AudioVitality_Timeline.pdf');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        setAlertMessage('Erreur lors de l\'exportation PDF');
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  const getMonthsRange = () => {
    if (events.length === 0) return [new Date()];
    
    let minDate = new Date('2099-01-01');
    let maxDate = new Date('2000-01-01');
    
    events.forEach(event => {
      const items = event.actions && event.actions.length > 0 ? event.actions : [event];
      items.forEach(item => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate || item.startDate);
        if (start < minDate) minDate = start;
        if (end > maxDate) maxDate = end;
      });
    });
    
    if (minDate > maxDate) return [new Date()];
    
    const months: Date[] = [];
    let current = startOfMonth(minDate);
    const endMonth = startOfMonth(maxDate);
    
    while (current <= endMonth) {
      months.push(current);
      current = addMonths(current, 1);
    }
    
    return months;
  };

  const renderMonthCalendar = (monthDate: Date, showControls: boolean) => {
    const locale = language === 'fr' ? fr : enUS;
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 capitalize">
            {format(monthStart, 'MMMM yyyy', { locale })}
          </h3>
          {showControls && !isExporting && (
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button onClick={prevMonth} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 auto-rows-fr">
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);
            
            // Find actions that start or end on this day, or span across this day
            const dayActions: { action: any, isStart: boolean, isEnd: boolean, isSpan: boolean }[] = [];
            
            events.forEach(event => {
              const items = event.actions && event.actions.length > 0 ? event.actions : [event];
              items.forEach(item => {
                const start = parseISO(item.startDate);
                const end = parseISO(item.endDate || item.startDate);
                
                // Reset time to midnight for accurate day comparison
                const dayTime = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
                const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
                const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
                
                if (dayTime >= startTime && dayTime <= endTime) {
                  dayActions.push({
                    action: item,
                    isStart: dayTime === startTime,
                    isEnd: dayTime === endTime,
                    isSpan: dayTime > startTime && dayTime < endTime
                  });
                }
              });
            });

            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[100px] sm:min-h-[120px] rounded-xl sm:rounded-2xl border p-1.5 sm:p-3 flex flex-col transition-all ${
                  !isCurrentMonth ? 'opacity-40 bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
                } ${isTodayDate ? 'ring-2 ring-medical-blue border-transparent' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                    isTodayDate ? 'bg-medical-blue text-white' : 'text-slate-700'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className={`flex flex-col gap-1.5 flex-1 ${isExporting ? '' : 'overflow-y-auto custom-scrollbar'}`}>
                  {dayActions.map(({ action, isStart, isEnd, isSpan }, idx) => {
                    let label = action.title;
                    if (isStart && !isEnd) label = `Début: ${action.title}`;
                    else if (isEnd && !isStart) label = `Fin: ${action.title}`;
                    else if (isSpan) label = action.title;

                    const actionColor = action.color || '#3b82f6';
                    const textColor = getContrastYIQ(actionColor);

                    return (
                      <div 
                        key={`${action.id}-${idx}`}
                        className={`text-[10px] sm:text-xs p-1.5 sm:p-2 rounded-lg font-bold truncate cursor-pointer hover:opacity-80 transition-opacity ${isSpan ? 'opacity-70' : ''}`}
                        style={{ 
                          backgroundColor: actionColor, 
                          color: textColor,
                          border: `1px solid ${actionColor}`
                        }}
                        title={label}
                        onClick={() => !isExporting && setViewMode('LIST')}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-medical-text">Calendrier du Protocole</h2>
          <p className="text-slate-500 mt-1">Suivi des grandes phases de l'étude clinique</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl hidden sm:flex">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'LIST' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutList className="w-4 h-4" />
              Liste
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'CALENDAR' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendrier
            </button>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting || isAdding || editingId !== null}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span className="hidden sm:inline">Exporter PDF</span>
          </button>
          <button 
            onClick={startAdd}
            disabled={isAdding || editingId !== null || isExporting || viewMode === 'CALENDAR'}
            className="flex items-center gap-2 px-4 py-2 bg-medical-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Ajouter une phase</span>
          </button>
        </div>
      </div>

      <div ref={timelineRef} className={`space-y-8 ${isExporting ? 'bg-white p-12 rounded-[2rem]' : ''}`}>
        {isExporting && (
          <div className="mb-12 pb-8 border-b-2 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-medical-blue rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">AudioVitality</h1>
              </div>
              <h2 className="text-2xl font-bold text-slate-700">Chronologie du Projet</h2>
              <p className="text-slate-500 mt-2 text-lg">Suivi détaillé des phases et jalons de l'étude clinique</p>
            </div>
            <div className="text-left md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Généré le</p>
              <p className="text-lg font-bold text-medical-blue">{format(new Date(), 'dd MMMM yyyy', { locale: language === 'fr' ? fr : enUS })}</p>
            </div>
          </div>
        )}

        {(viewMode === 'LIST' || isExporting) && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-12 pb-8">
            
            {isAdding && !isExporting && (
              <div className="relative pl-8">
                <div className="absolute -left-[11px] top-4 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 text-blue-900">Nouvel événement</h3>
                  <EventForm form={editForm} setForm={setEditForm} onSave={handleSave} onCancel={handleCancel} />
                </div>
              </div>
            )}

            {events.map((event, index) => (
              <div key={event.id} className="relative pl-8 group">
                {/* Timeline dot */}
                <div className={`absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
                  event.status === 'DONE' ? 'bg-green-500' : 
                  event.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />

                {editingId === event.id && !isExporting ? (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <EventForm form={editForm} setForm={setEditForm} onSave={handleSave} onCancel={handleCancel} />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-blue-100 group-hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${getStatusColor(event.status)}`}>
                          {getIconForTitle(event.title)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString('fr-FR')} 
                              {event.endDate && event.endDate !== event.startDate && ` - ${new Date(event.endDate).toLocaleDateString('fr-FR')}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(event.status)}`}>
                          {getStatusLabel(event.status)}
                        </span>
                        {!isExporting && (
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <button onClick={() => handleEdit(event)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(event.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-slate-600 leading-relaxed mb-4">{event.description}</p>
                    )}
                    
                    {event.actions && event.actions.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {event.actions.map(action => (
                          <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 gap-2">
                            <div className="flex items-start gap-3">
                              <div 
                                className="mt-0.5 w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: action.color || (action.status === 'DONE' ? '#22c55e' : action.status === 'IN_PROGRESS' ? '#3b82f6' : '#cbd5e1') }} 
                              />
                              <div>
                                <div className="font-bold text-slate-800 text-sm">{action.title}</div>
                                {action.description && <div className="text-slate-500 text-xs mt-0.5">{action.description}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 sm:ml-4 pl-5 sm:pl-0">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                                <CalendarIcon className="w-3 h-3" />
                                <span>
                                  {new Date(action.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                  {action.endDate && action.endDate !== action.startDate && ` - ${new Date(action.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(action.status)}`}>
                                {getStatusLabel(action.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {events.length === 0 && !isAdding && (
              <div className="pl-8 text-slate-500 italic">Aucun événement dans le calendrier.</div>
            )}
            </div>
          </div>
        )}

        {(viewMode === 'CALENDAR' || isExporting) && (
          <div className={isExporting ? 'mt-8' : ''}>
            {isExporting ? (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-8">
                  {getMonthsRange().map(month => (
                    <div key={month.toISOString()}>
                      {renderMonthCalendar(month, false)}
                    </div>
                  ))}
                </div>
                <div className="w-full lg:w-80 shrink-0 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-medical-blue" />
                    Légende des actions
                  </h3>
                  <div className="space-y-6">
                    {events.map(event => (
                      <div key={event.id}>
                        <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-100 pb-2">{event.title}</h4>
                        <div className="space-y-2.5">
                          {event.actions?.map(action => (
                            <div key={action.id} className="flex items-start gap-3 text-xs">
                              <div 
                                className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-sm" 
                                style={{ backgroundColor: action.color || '#3b82f6' }}
                              />
                              <span className="text-slate-600 font-medium leading-tight">{action.title}</span>
                            </div>
                          ))}
                          {(!event.actions || event.actions.length === 0) && (
                            <span className="text-xs text-slate-400 italic">Aucune action</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              renderMonthCalendar(currentMonth, true)
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Information</h3>
            <p className="text-slate-600 mb-6">{alertMessage}</p>
            <div className="flex justify-end">
              <button onClick={() => setAlertMessage(null)} className="px-4 py-2 bg-medical-blue text-white rounded-lg font-bold hover:bg-blue-600 transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmer la suppression</h3>
            <p className="text-slate-600 mb-6">Voulez-vous vraiment supprimer cette phase et toutes ses actions ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition-colors">
                Annuler
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for the form
const EventForm = ({ form, setForm, onSave, onCancel }: { form: Partial<TimelineEvent>, setForm: any, onSave: () => void, onCancel: () => void }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titre de la phase</label>
        <input 
          type="text" 
          value={form.title || ''} 
          onChange={e => setForm({...form, title: e.target.value})}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
          placeholder="Ex: Phase de recrutement"
        />
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-xs font-bold text-slate-500 uppercase">Actions / Jalons</label>
          <button 
            type="button"
            onClick={() => {
              const newActions = [...(form.actions || []), {
                id: crypto.randomUUID(),
                title: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                description: '',
                status: 'TODO',
                color: '#3b82f6'
              }];
              setForm({...form, actions: newActions});
            }}
            className="text-xs font-bold text-medical-blue hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter une action
          </button>
        </div>
        
        <div className="space-y-3">
          {(form.actions || []).map((action, idx) => (
            <div key={action.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group">
              <button 
                type="button"
                onClick={() => {
                  const newActions = form.actions!.filter((_, i) => i !== idx);
                  setForm({...form, actions: newActions});
                }}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 pr-8">
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Titre de l'action</label>
                  <input 
                    type="text" 
                    value={action.title} 
                    onChange={e => {
                      const newActions = [...form.actions!];
                      newActions[idx].title = e.target.value;
                      setForm({...form, actions: newActions});
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="Ex: Screening des sujets"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Couleur</label>
                  <input 
                    type="color" 
                    value={action.color || '#3b82f6'} 
                    onChange={e => {
                      const newActions = [...form.actions!];
                      newActions[idx].color = e.target.value;
                      setForm({...form, actions: newActions});
                    }}
                    className="w-full h-[38px] p-0.5 border border-slate-200 rounded-lg cursor-pointer bg-white"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Statut</label>
                  <select 
                    value={action.status} 
                    onChange={e => {
                      const newActions = [...form.actions!];
                      newActions[idx].status = e.target.value as any;
                      setForm({...form, actions: newActions});
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="TODO">À faire</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="DONE">Terminé</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Début</label>
                  <input 
                    type="date" 
                    value={action.startDate} 
                    onChange={e => {
                      const newActions = [...form.actions!];
                      newActions[idx].startDate = e.target.value;
                      setForm({...form, actions: newActions});
                    }}
                    className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fin</label>
                  <input 
                    type="date" 
                    value={action.endDate} 
                    onChange={e => {
                      const newActions = [...form.actions!];
                      newActions[idx].endDate = e.target.value;
                      setForm({...form, actions: newActions});
                    }}
                    className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Détails opérationnels</label>
                <input 
                  type="text" 
                  value={action.description} 
                  onChange={e => {
                    const newActions = [...form.actions!];
                    newActions[idx].description = e.target.value;
                    setForm({...form, actions: newActions});
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Contacter les 24 sujets par email..."
                />
              </div>
            </div>
          ))}
          {(!form.actions || form.actions.length === 0) && (
            <div className="text-sm text-slate-500 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Aucune action définie. Cliquez sur "Ajouter une action" pour commencer.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
        <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition-colors">
          Annuler
        </button>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-medical-blue text-white rounded-lg font-bold hover:bg-blue-600 transition-colors">
          <Check className="w-4 h-4" />
          Enregistrer
        </button>
      </div>
    </div>
  );
};
