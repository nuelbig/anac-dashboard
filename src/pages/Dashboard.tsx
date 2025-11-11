import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message } from "../types";
import { Activity, User, TrendingUp, Clock, Phone, Calendar, RefreshCw } from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAllMessages } from "../services/message";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type Period = "today" | "week" | "month";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  trend?: number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, trend, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value.toLocaleString()}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}% vs période précédente</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${gradient}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function MessagesDashboard() {
  const [period, setPeriod] = useState<Period>("today");

  // 🚀 Utilisation de React Query avec caching et refetching
  const {
    data: messages = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: getAllMessages,
    staleTime: 1000 * 60 * 5, // Les données restent "fraîches" pendant 5 minutes
    refetchOnWindowFocus: true, // Refetch quand l'utilisateur revient sur l'onglet
    refetchInterval: 1000 * 60 * 2, // Refetch automatique toutes les 2 minutes
    retry: 3, // Réessayer 3 fois en cas d'échec
  });

  const now = new Date();

  const messagesByPeriod = messages.filter((m) => {
    const date = new Date(m.recdTime);
    if (period === "today") return date.toDateString() === now.toDateString();
    if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return date >= startOfWeek;
    }
    if (period === "month") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Clients uniques
  const clients = Array.from(new Set(messages.map((m) => m.clientId)));
  const activeClients = Array.from(new Set(messagesByPeriod.map((m) => m.clientId)));

  // Stats par client
  const statsByClient = clients.map((c) => ({
    clientId: c,
    count: messagesByPeriod.filter((m) => m.clientId === c).length,
    totalCount: messages.filter((m) => m.clientId === c).length,
  })).sort((a, b) => b.count - a.count);

  // Messages récents (10 derniers)
  const recentMessages = [...messagesByPeriod]
    .sort((a, b) => new Date(b.recdTime).getTime() - new Date(a.recdTime).getTime())
    .slice(0, 10);

  // Préparer données pour le graphique en ligne
  const messagesByDay = (() => {
    const days: Record<string, number> = {};
    messagesByPeriod.forEach((m) => {
      const day = format(new Date(m.recdTime), "dd/MM");
      days[day] = (days[day] || 0) + 1;
    });
    
    const sortedDays = Object.entries(days).sort((a, b) => {
      const [dayA, monthA] = a[0].split('/').map(Number);
      const [dayB, monthB] = b[0].split('/').map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    });

    return {
      labels: sortedDays.map(([day]) => day),
      datasets: [
        {
          label: "Messages",
          data: sortedDays.map(([, count]) => count),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#3b82f6",
          borderWidth: 2,
        },
      ],
    };
  })();

  // Graphique par client (Bar)
  const messagesByClientChart = {
    labels: statsByClient.slice(0, 5).map((s) => s.clientId),
    datasets: [
      {
        label: "Messages",
        data: statsByClient.slice(0, 5).map((s) => s.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(250, 204, 21, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  // Graphique en donut pour la distribution
  const distributionChart = {
    labels: statsByClient.slice(0, 4).map((s) => s.clientId),
    datasets: [
      {
        data: statsByClient.slice(0, 4).map((s) => s.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.9)",
          "rgba(34, 197, 94, 0.9)",
          "rgba(250, 204, 21, 0.9)",
          "rgba(139, 92, 246, 0.9)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // État de chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {error instanceof Error ? error.message : "Une erreur s'est produite"}
          </p>
          <button
            onClick={() => refetch()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Header avec bouton refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Statistiques des messages par client et période
            {dataUpdatedAt && (
              <span className="text-xs">
                • Dernière mise à jour: {format(new Date(dataUpdatedAt), "HH:mm:ss")}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Bouton de refresh manuel */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isFetching ? 'Actualisation...' : 'Actualiser'}
            </span>
          </button>

          {/* Sélecteur de période */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
            {["today", "week", "month"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as Period)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  period === p
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {p === "today" ? "Aujourd'hui" : p === "week" ? "Cette semaine" : "Ce mois"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicateur de chargement en arrière-plan */}
      {isFetching && !isLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Mise à jour des données en cours...
          </span>
        </div>
      )}

      {/* Cards de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={messagesByPeriod.length}
          icon={<Activity className="h-7 w-7 text-white" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="Messages reçus"
        />
        <StatCard
          title="Clients Actifs"
          value={activeClients.length}
          icon={<User className="h-7 w-7 text-white" />}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`sur ${clients.length} total`}
        />
        <StatCard
          title="Moyenne/Client"
          value={activeClients.length > 0 ? Math.round(messagesByPeriod.length / activeClients.length) : 0}
          icon={<TrendingUp className="h-7 w-7 text-white" />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="messages par client"
        />
        <StatCard
          title="Total Phones"
          value={Array.from(new Set(messagesByPeriod.map(m => m.phone))).length}
          icon={<Phone className="h-7 w-7 text-white" />}
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          subtitle="numéros uniques"
        />
      </div>

      {/* Top Clients */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Top Clients - Période Actuelle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsByClient.slice(0, 4).map((stat, idx) => {
            const colors = [
              "from-blue-500 to-blue-600",
              "from-green-500 to-green-600",
              "from-yellow-500 to-yellow-600",
              "from-purple-500 to-purple-600",
            ];
            const percentage = messagesByPeriod.length > 0 
              ? ((stat.count / messagesByPeriod.length) * 100).toFixed(1) 
              : 0;
            
            return (
              <div key={stat.clientId} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">#{idx + 1}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${colors[idx]} text-white`}>
                    {percentage}%
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{stat.clientId}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">messages envoyés</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Évolution des Messages
          </h2>
          <div className="h-80">
            <Line data={messagesByDay} options={{...chartOptions, maintainAspectRatio: false}} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Distribution</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={distributionChart} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages par Client</h2>
        <div className="h-80">
          <Bar 
            data={messagesByClientChart} 
            options={{
              ...chartOptions, 
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Tableau des messages récents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Messages Récents
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Message ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Date & Heure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun message pour cette période
                  </td>
                </tr>
              ) : (
                recentMessages.map((m) => (
                  <tr key={m.messageId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {m.clientId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {m.phone}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                      {m.messageId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(m.recdTime), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}