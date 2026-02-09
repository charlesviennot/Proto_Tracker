import React, { useState } from 'react';
import { Subject } from '../types';
import { Button } from './Button';
import { Search, Plus, User, Activity, CheckCircle, Clock, ChevronRight, X } from 'lucide-react';

interface Props {
  subjects: Subject[];
  onSelect: (id: string) => void;
  onAdd: (name: string, group: 'CONTROL' | 'AUDIOVITALITY') => void;
}

export const SubjectList: React.FC<Props> = ({ subjects, onSelect, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<'CONTROL' | 'AUDIOVITALITY'>('AUDIOVITALITY');

  const filtered = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName, newGroup);
      setNewName('');
      setIsAdding(false);
    }
  };

  const getStatusBadge = (s: Subject) => {
    if (s.day2.completed) return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/> Terminé</span>;
    if (s.day1.completed) return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Attente J2</span>;
    if (s.day0.completed) return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Attente J1</span>;
    return <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> À initier</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2 border-b border-gray-100/50">
        <div>
          <h2 className="text-4xl font-bold text-medical-text tracking-tight mb-2">Protocole DOMS</h2>
          <p className="text-gray-500 text-lg">Suivi des sujets et objectivation clinique.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="bronze" className="shadow-lg shadow-yellow-900/10">
            <Plus className="w-5 h-5 mr-2" /> Nouveau Sujet
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
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex items-end">
              <Button type="submit" fullWidth className="h-[50px]">Valider la fiche</Button>
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
           placeholder="Rechercher par nom, ID..." 
           className="block w-full pl-14 pr-6 py-4 bg-white text-lg text-medical-text placeholder-gray-400 focus:ring-2 focus:ring-medical-bronze/30 focus:border-medical-bronze/30 border border-transparent rounded-[2rem] shadow-sm hover:shadow-md transition-all outline-none"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* List */}
      <div className="grid gap-5">
        {filtered.map(subject => (
          <button 
            key={subject.id} 
            type="button"
            onClick={() => onSelect(subject.id)}
            className="w-full text-left bg-white p-5 md:p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-4 group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-medical-bronze/10"
          >
            {/* Left Color Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${subject.group === 'AUDIOVITALITY' ? 'bg-medical-bronze' : 'bg-medical-blue'}`} />

            <div className="flex items-center w-full md:w-auto gap-5 pl-3">
               <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 transition-colors ${subject.group === 'AUDIOVITALITY' ? 'bg-[#F9F5EB] text-[#C5A059]' : 'bg-blue-50 text-blue-600'}`}>
                 <User className="w-7 h-7" />
               </div>
               <div>
                 <h4 className="text-xl font-bold text-medical-text group-hover:text-medical-bronze transition-colors">{subject.name}</h4>
                 <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                   <span className="font-mono font-medium text-gray-400">{subject.code}</span>
                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                   <span className={`${subject.group === 'AUDIOVITALITY' ? 'text-[#9A7B3E] font-medium' : 'text-blue-600 font-medium'}`}>
                     {subject.group === 'AUDIOVITALITY' ? 'Groupe Traité' : 'Contrôle'}
                   </span>
                 </div>
               </div>
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-3 md:pl-0">
               {getStatusBadge(subject)}
               <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-medical-bronze group-hover:text-white transition-colors">
                 <ChevronRight className="w-5 h-5" />
               </div>
            </div>
          </button>
        ))}
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white/50 rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-lg">Aucun sujet trouvé.</p>
            <p className="text-sm">Modifiez votre recherche ou ajoutez un nouveau participant.</p>
          </div>
        )}
      </div>
    </div>
  );
};