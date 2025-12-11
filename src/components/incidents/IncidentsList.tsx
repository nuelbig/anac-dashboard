/**
 * Liste des incidents aviation OACI avec pagination et filtres
 * ANAC - Agence Nationale de l'Aviation Civile
 */

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Search, Trash2, Filter, Download } from "lucide-react";
import Swal from "sweetalert2";

import {
  getIncidents,
  deleteIncident,
  searchIncidents,
} from "../../services/incidentService";
import {
  TypeIncident,
  StatutIncident,
  PrioriteIncident,
  INCIDENT_TYPE_LABELS,
} from "../../types/incident";
import Button from "../ui/Button";
import Card from "../ui/Card";
import IncidentBadge from "../ui/IncidentBadge";

const IncidentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [filterType, setFilterType] = useState<TypeIncident | "">("");
  const [filterStatut, setFilterStatut] = useState<StatutIncident | "">("");
  const [filterPriorite, setFilterPriorite] = useState<PrioriteIncident | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const recordPerPage: number = 10;

  const queryClient = useQueryClient();

  // Fetch incidents avec pagination
  const {
    data: incidentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["incidents", currentPage, filterType, filterStatut, filterPriorite],
    queryFn: async () => {
      // Si des filtres sont actifs, utiliser searchIncidents
      if (filterType || filterStatut || filterPriorite) {
        return await searchIncidents({
          type: filterType || undefined,
          statut: filterStatut || undefined,
          priorite: filterPriorite || undefined,
          page: currentPage,
          size: recordPerPage,
        });
      }
      // Sinon utiliser getIncidents simple
      return await getIncidents(currentPage, recordPerPage);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      Swal.fire({
        title: "Supprimé !",
        text: "L'incident a été supprimé avec succès.",
        icon: "success",
        confirmButtonColor: "#0066CC",
      });
    },
    onError: () => {
      Swal.fire({
        title: "Erreur",
        text: "Impossible de supprimer l'incident.",
        icon: "error",
        confirmButtonColor: "#CC0000",
      });
    },
  });

  const handleDelete = (id: number, trackingId: string) => {
    Swal.fire({
      title: "Confirmer la suppression",
      html: `Êtes-vous sûr de vouloir supprimer l'incident <strong>${trackingId}</strong> ?<br/>Cette action est irréversible.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CC0000",
      cancelButtonColor: "#666666",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  // Filtrage local par recherche de texte
  const filteredIncidents = useMemo(() => {
    if (!incidentsData?.content) return [];

    if (!searchTerm) return incidentsData.content;

    const term = searchTerm.toLowerCase();
    return incidentsData.content.filter(
      (incident) =>
        incident.trackingId.toLowerCase().includes(term) ||
        incident.titre.toLowerCase().includes(term) ||
        incident.description.toLowerCase().includes(term) ||
        INCIDENT_TYPE_LABELS[incident.typeIncident].toLowerCase().includes(term)
    );
  }, [incidentsData, searchTerm]);

  const handleResetFilters = () => {
    setFilterType("");
    setFilterStatut("");
    setFilterPriorite("");
    setSearchTerm("");
  };

  const totalPages = incidentsData?.totalPages || 0;
  const totalElements = incidentsData?.totalElements || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
        Échec du chargement des incidents. Vérifiez la connexion au backend.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Incidents Aviation OACI
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalElements} incident{totalElements > 1 ? "s" : ""} enregistré{totalElements > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
          >
            <Filter size={18} />
            Filtres
          </Button>
          <Link to="/incidents/new">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              + Nouvel Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* FILTRES */}
      {showFilters && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtre Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type d'incident
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TypeIncident | "")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value as StatutIncident | "")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="EN_COURS">En cours</option>
                <option value="RESOLU">Résolu</option>
                <option value="REJETE">Rejeté</option>
              </select>
            </div>

            {/* Filtre Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priorité
              </label>
              <select
                value={filterPriorite}
                onChange={(e) => setFilterPriorite(e.target.value as PrioriteIncident | "")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les priorités</option>
                <option value="CRITIQUE">Critique</option>
                <option value="ELEVEE">Élevée</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="FAIBLE">Faible</option>
              </select>
            </div>

            {/* Bouton reset */}
            <div className="flex items-end">
              <Button
                onClick={handleResetFilters}
                className="w-full bg-gray-500 hover:bg-gray-600"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SEARCH BAR */}
      <Card>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par tracking ID, titre, description ou type..."
            className="pl-10 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type OACI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Déclaré par
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident, i = 1) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {i + 1 }
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <IncidentBadge
                        type="type"
                        value={incident.typeIncident}
                        showCode={true}
                        size="sm"
                      />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {incident.titre}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <IncidentBadge
                        type="priorite"
                        value={incident.priorite}
                        size="sm"
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <IncidentBadge
                        type="statut"
                        value={incident.statut}
                        size="sm"
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {incident.declarePar.nom}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {incident.createdAt
                        ? new Date(incident.createdAt).toLocaleDateString("fr-FR")
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-start space-x-3">
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </Link>

                        <Link
                          to={`/incidents/${incident.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Modifier l'incident"
                        >
                          <Edit size={18} />
                        </Link>

                        <button
                          onClick={() => handleDelete(incident.id!, incident.trackingId)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer l'incident"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Aucun incident trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage + 1} sur {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Précédent
            </Button>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsList;
