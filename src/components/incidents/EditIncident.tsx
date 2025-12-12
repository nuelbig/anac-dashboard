/**
 * Formulaire de modification d'incident aviation OACI
 * ANAC - Agence Nationale de l'Aviation Civile
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

import {
  getIncidentById,
  updateIncident,
  uploadIncidentPhoto,
} from "../../services/incidentService";
import {
  StatutIncident,
  INCIDENT_TYPE_LABELS,
  INCIDENT_TYPE_CODES,
} from "../../types/incident";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

const EditIncident: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [statut, setStatut] = useState<StatutIncident>("EN_ATTENTE");
  const [localisation, setLocalisation] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch incident
  const {
    data: incident,
    isLoading: isLoadingIncident,
    isError: isErrorIncident,
  } = useQuery({
    queryKey: ["incident", id],
    queryFn: () => getIncidentById(Number(id)),
    enabled: !!id,
  });

  // Populate form when incident is loaded
  useEffect(() => {
    if (incident) {
      setTitre(incident.titre);
      setDescription(incident.description);
      setStatut(incident.statut || "EN_ATTENTE");
      setLocalisation(incident.localisation || "");
      setLatitude(incident.latitude ? String(incident.latitude) : "");
      setLongitude(incident.longitude ? String(incident.longitude) : "");

      // Set existing photo preview
      if (incident.photoUrl) {
        setPhotoPreview(`http://localhost:8080${incident.photoUrl}`);
      }
    }
  }, [incident]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateIncident(id, data),
    onSuccess: async () => {
      // If there's a new photo, upload it
      if (newPhoto && incident?.id) {
        try {
          await uploadIncidentPhoto(incident.id, newPhoto);
        } catch (error) {
          console.error("Erreur upload photo:", error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });

      Swal.fire({
        title: "Incident modifié !",
        text: "L'incident a été mis à jour avec succès.",
        icon: "success",
        confirmButtonColor: "#0066CC",
      }).then(() => {
        navigate(`/incidents/${id}`);
      });
    },
    onError: (error: any) => {
      console.error("Erreur modification incident:", error);
      Swal.fire({
        title: "Erreur",
        text: error?.response?.data?.message || "Impossible de modifier l'incident.",
        icon: "error",
        confirmButtonColor: "#CC0000",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, photo: "La photo ne doit pas dépasser 10 MB" });
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, photo: "Seules les images sont acceptées" });
        return;
      }

      setNewPhoto(file);
      setErrors({ ...errors, photo: "" });

      // Créer preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setNewPhoto(null);
    setPhotoPreview(incident?.photoUrl ? `http://localhost:8080${incident.photoUrl}` : null);
    setErrors({ ...errors, photo: "" });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!titre.trim()) {
      newErrors.titre = "Le titre est obligatoire";
    } else if (titre.length < 10) {
      newErrors.titre = "Le titre doit contenir au moins 10 caractères";
    }

    if (!description.trim()) {
      newErrors.description = "La description est obligatoire";
    } else if (description.length < 20) {
      newErrors.description = "La description doit contenir au moins 20 caractères";
    }

    if (latitude && isNaN(parseFloat(latitude))) {
      newErrors.latitude = "Latitude invalide";
    }

    if (longitude && isNaN(parseFloat(longitude))) {
      newErrors.longitude = "Longitude invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Formulaire invalide",
        text: "Veuillez corriger les erreurs avant de soumettre.",
        icon: "warning",
        confirmButtonColor: "#FF9900",
      });
      return;
    }

    if (!incident?.id) return;

    updateMutation.mutate({
      id: incident.id,
      data: {
        titre: titre.trim(),
        description: description.trim(),
        statut,
        localisation: localisation.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      },
    });
  };

  // Loading state
  if (isLoadingIncident) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (isErrorIncident || !incident) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Modifier l'Incident {incident.trackingId}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Modification de l'incident aviation OACI
          </p>
        </div>
        <Button
          onClick={() => navigate(`/incidents/${id}`)}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
        >
          <ArrowLeft size={18} />
          Retour
        </Button>
      </div>

      {/* INFO NOTICE */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Le type d'incident et la priorité ne peuvent pas être modifiés après
            la création car ils sont déterminés par l'analyse IA. Seules les informations descriptives
            et le statut peuvent être mis à jour.
          </div>
        </div>
      </Card>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Informations de base
          </h2>

          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre de l'incident <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Corps étranger détecté sur la piste 09"
                className={errors.titre ? "border-red-500" : ""}
              />
              {errors.titre && (
                <p className="text-red-500 text-sm mt-1">{errors.titre}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description détaillée <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'incident de manière détaillée..."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as StatutIncident)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
              >
                <option value="EN_ATTENTE">En attente</option>
                <option value="EN_COURS">En cours</option>
                <option value="RESOLU">Résolu</option>
                <option value="REJETE">Rejeté</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Classification OACI (lecture seule) */}
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Classification OACI (Lecture seule)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Ces champs ne peuvent pas être modifiés car ils ont été déterminés par l'analyse IA.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Type d'incident OACI
              </label>
              <div className="mt-2">
                <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
                  [{INCIDENT_TYPE_CODES[incident.typeIncident]}] {INCIDENT_TYPE_LABELS[incident.typeIncident]}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Priorité
              </label>
              <div className="mt-2">
                <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
                  {incident.priorite}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Localisation */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Localisation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zone / Terminal
              </label>
              <Input
                type="text"
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
                placeholder="Ex: Terminal 1, Piste 09/27, Zone Airside..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latitude
              </label>
              <Input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Ex: 6.1659"
                className={errors.latitude ? "border-red-500" : ""}
              />
              {errors.latitude && (
                <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Longitude
              </label>
              <Input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Ex: 1.2549"
                className={errors.longitude ? "border-red-500" : ""}
              />
              {errors.longitude && (
                <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Photo */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Photo de l'incident
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Vous pouvez remplacer la photo existante. Max 10 MB.
          </p>

          {!photoPreview ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  Cliquez pour uploader
                </span>
                <span className="text-gray-600 dark:text-gray-400"> ou glissez-déposez</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                PNG, JPG, JPEG jusqu'à 10MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Preview"
                className="max-h-96 mx-auto rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
              >
                <X size={20} />
              </button>
              {newPhoto && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Nouvelle photo: {newPhoto.name} ({(newPhoto.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}
          {errors.photo && (
            <p className="text-red-500 text-sm mt-2">{errors.photo}</p>
          )}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            onClick={() => navigate(`/incidents/${id}`)}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "Modification en cours..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditIncident;
