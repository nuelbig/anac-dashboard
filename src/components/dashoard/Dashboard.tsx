/**
 * Dashboard ANAC - Tableau de bord des incidents aviation OACI
 * Agence Nationale de l'Aviation Civile - Togo
 * Aéroport International Gnassingbé Eyadéma (LFW)
 */

import { AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import {
  getIncidentStats,
  getIncidentCountByType,
  getIncidents,
} from "../../services/incidentService";
import {
  INCIDENT_TYPE_LABELS,
  INCIDENT_TYPE_COLORS,
  INCIDENT_TYPE_CODES,
  TypeIncident,
} from "../../types/incident";
import IncidentBadge from "../ui/IncidentBadge";

const Card = ({ title, children, className = "" }: any) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, trend, color = "blue" }: any) => {
  const colorClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
    red: "text-red-500",
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <Icon className={colorClasses[color]} size={24} />
          {trend && (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <TrendingUp size={16} className="mr-1" />
              {trend}
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
};

const ProgressBar = ({ percentage, color = "blue" }: any) => {
  const colorClasses = {
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const DashboardIncidents = () => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const navigate = useNavigate();

  // Fetch statistiques globales
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["incidentStats"],
    queryFn: getIncidentStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch répartition par type
  const { data: typeCount, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["incidentTypeCount"],
    queryFn: getIncidentCountByType,
    staleTime: 1000 * 60 * 2,
  });

  // Fetch incidents récents (page 0, 5 éléments)
  const { data: recentIncidentsData, isLoading: isLoadingRecent } = useQuery({
    queryKey: ["recentIncidents"],
    queryFn: () => getIncidents(0, 5),
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  const recentIncidents = recentIncidentsData?.content || [];

  // Calcul des types d'incidents avec pourcentages
  const incidentTypes = typeCount
    ? Object.entries(typeCount)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => {
          const total = Object.values(typeCount).reduce((sum, c) => sum + c, 0);
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return {
            type: type as TypeIncident,
            label: INCIDENT_TYPE_LABELS[type as TypeIncident],
            code: INCIDENT_TYPE_CODES[type as TypeIncident],
            count,
            percentage,
            color: INCIDENT_TYPE_COLORS[type as TypeIncident],
          };
        })
        .sort((a, b) => b.count - a.count)
    : [];

  // Calcul des niveaux de criticité
  const criticalityLevels = stats
    ? [
        {
          level: "Critique",
          count: stats.critique,
          percentage: stats.totalIncidents > 0 ? Math.round((stats.critique / stats.totalIncidents) * 100) : 0,
          color: "red",
        },
        {
          level: "Élevée",
          count: stats.elevee,
          percentage: stats.totalIncidents > 0 ? Math.round((stats.elevee / stats.totalIncidents) * 100) : 0,
          color: "orange",
        },
        {
          level: "Moyenne",
          count: stats.moyenne,
          percentage: stats.totalIncidents > 0 ? Math.round((stats.moyenne / stats.totalIncidents) * 100) : 0,
          color: "yellow",
        },
        {
          level: "Faible",
          count: stats.faible,
          percentage: stats.totalIncidents > 0 ? Math.round((stats.faible / stats.totalIncidents) * 100) : 0,
          color: "green",
        },
      ]
    : [];

  const getStatusColor = (status: string | null | undefined) => {
    const colors: Record<string, string> = {
      EN_ATTENTE: "bg-red-100 text-red-700 border-red-200",
      EN_COURS: "bg-yellow-100 text-yellow-700 border-yellow-200",
      RESOLU: "bg-green-100 text-green-700 border-green-200",
      REJETE: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status || "EN_ATTENTE"] || colors.EN_ATTENTE;
  };

  const getStatusIcon = (status: string | null | undefined) => {
    const icons: Record<string, any> = {
      EN_ATTENTE: XCircle,
      EN_COURS: Clock,
      RESOLU: CheckCircle,
      REJETE: XCircle,
    };
    const Icon = icons[status || "EN_ATTENTE"];
    return Icon ? <Icon size={14} className="mr-1" /> : null;
  };

  const getStatusLabel = (status: string | null | undefined) => {
    const labels: Record<string, string> = {
      EN_ATTENTE: "En attente",
      EN_COURS: "En cours",
      RESOLU: "Résolu",
      REJETE: "Rejeté",
    };
    return labels[status || "EN_ATTENTE"] || (status || "En attente");
  };

  // Loading state
  if (isLoadingStats || isLoadingTypes || isLoadingRecent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error or no data
  if (!stats || !typeCount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
            <p>Impossible de charger les statistiques. Vérifiez que le backend est démarré sur http://localhost:8080</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Tableau de bord ANAC - Incidents Aviation
            </h1>
            <p className="text-gray-600">
              Aéroport International Gnassingbé Eyadéma (LFW) - Lomé, Togo
            </p>
          </div>
        </div>

        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={AlertTriangle}
            title="Total des incidents"
            value={stats.totalIncidents}
            color="blue"
          />
          <StatCard
            icon={XCircle}
            title="En attente de traitement"
            value={stats.enAttente}
            color="red"
          />
          <StatCard
            icon={Clock}
            title="En cours de traitement"
            value={stats.enCours}
            color="orange"
          />
          <StatCard
            icon={CheckCircle}
            title="Incidents résolus"
            value={stats.resolus}
            color="green"
          />
        </div>

        {/* Incident Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Types d'incidents OACI */}
          <Card title="Répartition par type OACI" className="lg:col-span-1">
            <div className="space-y-5">
              {incidentTypes.length > 0 ? (
                incidentTypes.slice(0, 6).map((incident, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="px-2 py-1 rounded font-bold text-white text-xs"
                          style={{ backgroundColor: incident.color }}
                        >
                          {incident.code}
                        </div>
                        <span className="font-medium text-gray-700 text-sm">{incident.label}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{incident.count}</span>
                    </div>
                    <ProgressBar
                      percentage={incident.percentage}
                      color={incident.color.includes("CC0000") ? "red" : incident.color.includes("FF6600") ? "orange" : "blue"}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun incident enregistré</p>
              )}
            </div>
          </Card>

          {/* Statuts */}
          <Card title="Répartition par statut" className="lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-700">En attente</span>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <ProgressBar
                      percentage={stats.totalIncidents > 0 ? (stats.enAttente / stats.totalIncidents) * 100 : 0}
                      color="red"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900 w-8 text-right">{stats.enAttente}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-700">En cours</span>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <ProgressBar
                      percentage={stats.totalIncidents > 0 ? (stats.enCours / stats.totalIncidents) * 100 : 0}
                      color="yellow"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900 w-8 text-right">{stats.enCours}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-700">Résolus</span>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <ProgressBar
                      percentage={stats.totalIncidents > 0 ? (stats.resolus / stats.totalIncidents) * 100 : 0}
                      color="green"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900 w-8 text-right">{stats.resolus}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-700">Rejetés</span>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <ProgressBar
                      percentage={stats.totalIncidents > 0 ? (stats.rejetes / stats.totalIncidents) * 100 : 0}
                      color="purple"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900 w-8 text-right">{stats.rejetes}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Criticité */}
          <Card title="Criticité des incidents" className="lg:col-span-1">
            <div className="space-y-5">
              {criticalityLevels.map((level, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`text-${level.color}-600`} size={20} />
                      <span className="font-medium text-gray-700">{level.level}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${level.color}-100 text-${level.color}-700 border border-${level.color}-200`}>
                      {level.count}
                    </span>
                  </div>
                  <ProgressBar percentage={level.percentage} color={level.color} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Incidents Table */}
        <Card title="Incidents récents">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">N°</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Type OACI</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Titre</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Priorité</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.length > 0 ? (
                  recentIncidents.map((incident, index) => (
                    <tr
                      key={index}
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                      className={`border-b border-gray-100 transition-all cursor-pointer ${
                        hoveredRow === index ? "bg-blue-50 scale-[1.01]" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono font-semibold text-blue-600">{index + 1}</span>
                      </td>
                      <td className="py-4 px-4">
                        <IncidentBadge type="type" value={incident.typeIncident} showCode={true} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-gray-700 max-w-xs truncate">{incident.titre}</td>
                      <td className="py-4 px-4">
                        <IncidentBadge type="priorite" value={incident.priorite} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <span className={`flex items-center w-fit px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(incident.statut)}`}>
                          {getStatusIcon(incident.statut)}
                          {getStatusLabel(incident.statut)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Aucun incident récent
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {recentIncidents.length > 0 && (
            <div className="mt-4 text-center">
              <Link
                to="/incidents"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Voir tous les incidents →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardIncidents;
