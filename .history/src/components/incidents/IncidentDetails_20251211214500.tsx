/**
 * Page de détails d'un incident aviation OACI
 * ANAC - Agence Nationale de l'Aviation Civile
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";


import {
  getIncidentById,
  deleteIncident,
  updateIncidentStatus,
} from "../../services/incidentService";
import { SERVER_URL } from "../../types";
import { StatutIncident } from "../../types/incident";
import Button from "../ui/Button";
import Card from "../ui/Card";
import IncidentBadge from "../ui/IncidentBadge";

/**
 * Construit l'URL complète de la photo de l'incident
 * Gère les cas où photoUrl est déjà une URL complète ou un chemin relatif
 * Format attendu: http://localhost:8080/api/v1/uploads/incidents/...
 */
const buildPhotoUrl = (photoUrl: string): string => {
  // Si photoUrl est déjà une URL complète (http:// ou https://), on la retourne telle quelle
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    console.log("✅ Photo URL complète détectée:", photoUrl);
    return photoUrl;
  }

  // Construire l'URL complète avec SERVER_URL
  const baseUrl = SERVER_URL.endsWith("/") ? SERVER_URL.slice(0, -1) : SERVER_URL;
  
  // Normaliser le chemin : s'assurer qu'il commence par /api/v1/uploads
  let path = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
  
  // Si le chemin commence par /uploads mais pas par /api/v1/uploads, ajouter /api/v1
  if (path.startsWith("/uploads") && !path.startsWith("/api/v1/uploads")) {
    path = `/api/v1${path}`;
  }
  // Si le chemin ne commence ni par /api ni par /uploads, ajouter /api/v1/uploads
  else if (!path.startsWith("/api") && !path.startsWith("/uploads")) {
    path = `/api/v1/uploads${path.startsWith("/") ? path : `/${path}`}`;
  }
  
  const fullUrl = `${baseUrl}${path}`;
  
  console.log("🌐 URL construite:", fullUrl, "(photoUrl original:", photoUrl, ")");
  return fullUrl;
};

const IncidentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch incident
  const {
    data: incident,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["incident", id],
    queryFn: () => getIncidentById(Number(id)),
    enabled: !!id,
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
      }).then(() => {
        navigate("/incidents");
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

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: StatutIncident }) =>
      updateIncidentStatus(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      Swal.fire({
        title: "Statut mis à jour !",
        text: "Le statut de l'incident a été modifié.",
        icon: "success",
        confirmButtonColor: "#0066CC",
      });
    },
    onError: () => {
      Swal.fire({
        title: "Erreur",
        text: "Impossible de mettre à jour le statut.",
        icon: "error",
        confirmButtonColor: "#CC0000",
      });
    },
  });

  const handleDelete = () => {
    if (!incident) return;

    Swal.fire({
      title: "Confirmer la suppression",
      html: `Êtes-vous sûr de vouloir supprimer l'incident <strong>${incident.trackingId}</strong> ?<br/>Cette action est irréversible.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CC0000",
      cancelButtonColor: "#666666",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed && incident.id) {
        deleteMutation.mutate(incident.id);
      }
    });
  };

  const handleStatusChange = async () => {
    if (!incident || !incident.id) return;

    const { value: newStatus } = await Swal.fire({
      title: "Changer le statut",
      input: "select",
      inputOptions: {
        EN_ATTENTE: "En attente",
        EN_COURS: "En cours",
        RESOLU: "Résolu",
        REJETE: "Rejeté",
      },
      inputValue: incident.statut,
      showCancelButton: true,
      confirmButtonText: "Modifier",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#0066CC",
    });

    if (newStatus && newStatus !== incident.statut) {
      updateStatusMutation.mutate({
        id: incident.id,
        statut: newStatus as StatutIncident,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (isError || !incident) {
    return (
      <div className="space-y-4">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
          Incident introuvable ou erreur de chargement.
        </div>
        <Button onClick={() => navigate("/incidents")} className="bg-gray-600 hover:bg-gray-700">
          <ArrowLeft size={18} className="mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Incident {incident.trackingId?.substring(0, 12)}
            </h1>
            <IncidentBadge type="statut" value={incident.statut} size="md" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Créé le {incident.createdAt ? new Date(incident.createdAt).toLocaleString("fr-FR") : "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/incidents")}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
          >
            <ArrowLeft size={18} />
            Retour
          </Button>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations principales */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText size={20} />
              Informations de l'incident
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Titre
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {incident.titre}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Description
                </label>
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Type OACI
                  </label>
                  <div className="mt-2">
                    <IncidentBadge type="type" value={incident.typeIncident} showCode={true} size="md" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Priorité
                  </label>
                  <div className="mt-2">
                    <IncidentBadge type="priorite" value={incident.priorite} size="md" />
                  </div>
                </div>
              </div>
            </div>
          </Card>



          {/* Photo */}
          {incident.photoUrl && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Photo de l'incident
              </h2>
              <div className="space-y-2">
                {/* Debug info en développement */}
                {import.meta.env.DEV && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                    URL: {buildPhotoUrl(incident.photoUrl)}
                  </p>
                )}
                <img
                  src={buildPhotoUrl(incident.photoUrl)}
                  alt="Photo incident"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    // Gestion d'erreur si l'image ne peut pas être chargée
                    const imageUrl = buildPhotoUrl(incident.photoUrl!);
                    console.error("❌ Erreur de chargement de l'image:", imageUrl);
                    console.error("PhotoUrl original:", incident.photoUrl);
                    console.error("SERVER_URL:", SERVER_URL);
                    const target = e.target as HTMLImageElement;
                    // Afficher un message d'erreur au lieu de masquer l'image
                    target.style.display = "none";
                    const errorDiv = document.createElement("div");
                    errorDiv.className = "p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm";
                    errorDiv.innerHTML = `
                      <p><strong>Impossible de charger l'image</strong></p>
                      <p class="text-xs mt-1 font-mono break-all">URL: ${imageUrl}</p>
                    `;
                    target.parentElement?.appendChild(errorDiv);
                  }}
                  onLoad={() => {
                    console.log("✅ Image chargée avec succès:", buildPhotoUrl(incident.photoUrl!));
                  }}
                />
              </div>
            </Card>
          )}

          {/* Localisation */}
          {(incident.localisation || incident.latitude || incident.longitude) && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Localisation
              </h2>
              <div className="space-y-2">
                {incident.localisation && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Zone:</span> {incident.localisation}
                  </p>
                )}
                {incident.latitude && incident.longitude && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Coordonnées:</span> {incident.latitude}, {incident.longitude}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions rapides
            </h2>
            <div className="space-y-3">
              <Button
                onClick={handleStatusChange}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Changer le statut
              </Button>
            </div>
          </Card>

          {/* Informations système */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Informations système
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600 dark:text-gray-400">ID Système</label>
                <p className="text-gray-900 dark:text-white font-mono">#{incident.id}</p>
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-400">Tracking ID</label>
                <p className="text-gray-900 dark:text-white font-mono">{incident.trackingId}</p>
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-400">Créé le</label>
                <p className="text-gray-900 dark:text-white">
                  {incident.createdAt ? new Date(incident.createdAt).toLocaleString("fr-FR") : "N/A"}
                </p>
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-400">Mis à jour le</label>
                <p className="text-gray-900 dark:text-white">
                  {incident.updatedAt ? new Date(incident.updatedAt).toLocaleString("fr-FR") : "N/A"}
                </p>
              </div>

              {incident.resolvedAt && (
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Résolu le</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(incident.resolvedAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Utilisateurs */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={18} />
              Utilisateurs
            </h2>
            <div className="space-y-3 text-sm">
              {incident.declarePar && (
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Déclaré par</label>
                  <p className="text-gray-900 dark:text-white font-medium">{incident.declarePar.nom}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{incident.declarePar.email}</p>
                </div>
              )}

              {incident.assigneA && (
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Assigné à</label>
                  <p className="text-gray-900 dark:text-white font-medium">{incident.assigneA.nom}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{incident.assigneA.email}</p>
                </div>
              )}

              {!incident.assigneA && (
                <div className="pt-2">
                  <p className="text-gray-500 dark:text-gray-400 italic text-xs">
                    Non assigné
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetails;
