import React, { useState, useMemo } from 'react';
import { Subject } from '../types';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  parseISO,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, User, Link as LinkIcon, Check } from 'lucide-react';
import { t } from '../i18n';

interface CalendarProps {
  subjects: Subject[];
  onSelectSubject: (id: string, targetDay?: number) => void;
  language: 'fr' | 'en';
}

type ViewMode = 'month' | 'week';

interface ProtocolEvent {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  group: 'CONTROL' | 'AUDIOVITALITY';
  date: Date;
  time?: string;
  dayNumber: number; // 0, 1, or 2 (for J1, J2, J3)
  status: 'completed' | 'pending' | 'missed';
}

export function Calendar({ subjects, onSelectSubject, language }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [copied, setCopied] = useState(false);
  const locale = language === 'fr' ? fr : enUS;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/api/calendar.ics`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Generate events based on subject data
  const events = useMemo(() => {
    const allEvents: ProtocolEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    subjects.forEach(subject => {
      // Day 0 (J1)
      if (subject.day0.date) {
        const d0Date = parseISO(subject.day0.date);
        let status: ProtocolEvent['status'] = 'pending';
        if (subject.day0.completed) status = 'completed';
        else if (d0Date < today) status = 'missed';

        allEvents.push({
          id: `${subject.id}-d0`,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          group: subject.group,
          date: d0Date,
          time: subject.day0.time,
          dayNumber: 0,
          status
        });

        // If Day 1 (J2) date is not set, estimate it (+1 day)
        const d1Date = subject.day1.date ? parseISO(subject.day1.date) : addDays(d0Date, 1);
        let d1Status: ProtocolEvent['status'] = 'pending';
        if (subject.day1.completed) d1Status = 'completed';
        else if (d1Date < today && subject.day0.completed) d1Status = 'missed'; // Only missed if previous day was done

        allEvents.push({
          id: `${subject.id}-d1`,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          group: subject.group,
          date: d1Date,
          time: subject.day1.time,
          dayNumber: 1,
          status: d1Status
        });

        // If Day 2 (J3) date is not set, estimate it (+2 days from J1)
        const d2Date = subject.day2.date ? parseISO(subject.day2.date) : addDays(d0Date, 2);
        let d2Status: ProtocolEvent['status'] = 'pending';
        if (subject.day2.completed) d2Status = 'completed';
        else if (d2Date < today && subject.day1.completed) d2Status = 'missed';

        allEvents.push({
          id: `${subject.id}-d2`,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          group: subject.group,
          date: d2Date,
          time: subject.day2.time,
          dayNumber: 2,
          status: d2Status
        });
      }
    });

    // Sort events by time if available
    return allEvents.sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
  }, [subjects]);

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get days to display based on view mode
  const daysToDisplay = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const getStatusColor = (status: ProtocolEvent['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'missed': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: ProtocolEvent['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'missed': return <AlertCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
    }
  };

  const getGroupColor = (group: 'CONTROL' | 'AUDIOVITALITY') => {
    return group === 'AUDIOVITALITY' ? 'bg-medical-bronze' : 'bg-medical-blue';
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="bg-medical-blue/10 p-3 rounded-2xl text-medical-blue">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">
              {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Semaine du' d MMMM", { locale })}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {events.filter(e => e.status === 'pending').length} visites prévues
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Export Button */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              copied 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-medical-blue hover:border-medical-blue/30 shadow-sm'
            }`}
            title="Copier le lien d'abonnement pour Google Agenda"
          >
            {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Lien copié !' : 'Google Agenda'}</span>
          </button>

          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semaine
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={goToToday}
              className="px-4 py-2 text-sm font-bold text-medical-blue bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              Aujourd'hui
            </button>
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button onClick={prevPeriod} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextPeriod} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-7 gap-4 ${viewMode === 'month' ? 'auto-rows-fr' : ''}`}>
          {daysToDisplay.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <div 
                key={day.toISOString()} 
                className={`
                  min-h-[120px] rounded-2xl border p-3 flex flex-col transition-all
                  ${!isCurrentMonth && viewMode === 'month' ? 'opacity-40 bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-medical-blue/30 hover:shadow-md'}
                  ${isTodayDate ? 'ring-2 ring-medical-blue ring-offset-2 border-transparent' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`
                    text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                    ${isTodayDate ? 'bg-medical-blue text-white' : 'text-slate-700'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {dayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => onSelectSubject(event.subjectId, event.dayNumber)}
                      className={`
                        text-left p-2 rounded-xl border text-xs group transition-all hover:scale-[1.02]
                        ${getStatusColor(event.status)}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <div className={`w-2 h-2 rounded-full ${getGroupColor(event.group)}`} />
                          <span className="truncate max-w-[80px]">{event.subjectCode}</span>
                        </div>
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex items-center justify-between opacity-80 mt-1">
                        <span className="truncate">{event.subjectName}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {event.time && <span className="text-[10px] font-medium bg-white/50 px-1 rounded">{event.time}</span>}
                          <span className="font-bold bg-white/50 px-1.5 rounded-md">J{event.dayNumber + 1}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-100 bg-white flex flex-wrap gap-6 justify-center text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-medical-bronze"></div>
          <span>AudioVitality</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-medical-blue"></div>
          <span>Contrôle</span>
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Terminé</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>À venir</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>En retard</span>
        </div>
      </div>
    </div>
  );
}
