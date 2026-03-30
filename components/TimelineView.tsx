import React from 'react';
import { Calendar, Users, Activity, Database, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const phases = [
    {
      id: 1,
      title: "Préparation & Recrutement",
      date: "Mars - Avril 2026",
      status: "current", // current, upcoming, completed
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      tasks: [
        "Validation finale du protocole",
        "Lancement de la campagne de recrutement",
        "Screening des premiers candidats",
        "Planification des sessions"
      ]
    },
    {
      id: 2,
      title: "Phase Clinique (Inclusions)",
      date: "Mi-Avril - Fin Juin 2026",
      status: "upcoming",
      icon: <Activity className="w-6 h-6" />,
      color: "bg-purple-500",
      tasks: [
        "Premier Sujet Inclus (FSI)",
        "Passation des tests (J0, J1, J2, Suivi)",
        "Dernier Sujet Inclus (LSI)",
        "Dernier Sujet Sorti (LSO)"
      ]
    },
    {
      id: 3,
      title: "Traitement & Analyse des Données",
      date: "Mai - Juillet 2026",
      status: "upcoming",
      icon: <Database className="w-6 h-6" />,
      color: "bg-amber-500",
      tasks: [
        "Nettoyage des données en fil de l'eau (pendant les inclusions)",
        "Export et structuration de la base de données finale",
        "Analyses statistiques (comparaison Audiovitality vs Placebo)",
        "Génération des graphiques et résultats"
      ]
    },
    {
      id: 4,
      title: "Rédaction & Publication",
      date: "Août - Octobre 2026",
      status: "upcoming",
      icon: <FileText className="w-6 h-6" />,
      color: "bg-emerald-500",
      tasks: [
        "Rédaction du manuscrit (Introduction, Méthodes, Résultats)",
        "Revue interne et corrections",
        "Sélection de la revue scientifique",
        "Soumission de l'article"
      ]
    }
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-medical-blue" />
          Calendrier du Protocole
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Vue d'ensemble des phases de l'étude clinique, du recrutement à la publication.
        </p>
      </div>

      <div className="relative">
        {/* Ligne verticale de la timeline */}
        <div className="absolute left-8 top-8 bottom-8 w-1 bg-gray-200 rounded-full hidden md:block"></div>

        <div className="space-y-12">
          {phases.map((phase, index) => (
            <div key={phase.id} className="relative flex flex-col md:flex-row gap-6 md:gap-12">
              
              {/* Indicateur visuel (Cercle) */}
              <div className="hidden md:flex flex-col items-center z-10">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white ${
                  phase.status === 'completed' ? 'bg-green-500' : 
                  phase.status === 'current' ? phase.color + ' ring-4 ring-blue-100' : 
                  'bg-gray-300'
                }`}>
                  {phase.status === 'completed' ? <CheckCircle className="w-8 h-8" /> : phase.icon}
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className={`flex-1 bg-white rounded-3xl p-8 shadow-sm border transition-all hover:shadow-md ${
                phase.status === 'current' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'
              }`}>
                
                {/* En-tête mobile */}
                <div className="flex items-center gap-4 mb-4 md:hidden">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm ${
                    phase.status === 'completed' ? 'bg-green-500' : 
                    phase.status === 'current' ? phase.color : 
                    'bg-gray-300'
                  }`}>
                    {phase.icon}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{phase.date}</span>
                    <h3 className="text-xl font-bold text-gray-900">{phase.title}</h3>
                  </div>
                </div>

                {/* En-tête desktop */}
                <div className="hidden md:flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{phase.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{phase.date}</span>
                    </div>
                  </div>
                  {phase.status === 'current' && (
                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100 animate-pulse">
                      Phase Actuelle
                    </span>
                  )}
                  {phase.status === 'completed' && (
                    <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-bold border border-green-100">
                      Terminé
                    </span>
                  )}
                </div>

                {/* Liste des tâches */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Jalons clés</h4>
                  <ul className="space-y-3">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <ArrowRight className={`w-5 h-5 shrink-0 mt-0.5 ${
                          phase.status === 'completed' ? 'text-green-500' : 
                          phase.status === 'current' ? 'text-blue-500' : 
                          'text-gray-400'
                        }`} />
                        <span className="text-gray-700 font-medium">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
