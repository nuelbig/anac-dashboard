/**
 * Formulaire de création d'incident aviation OACI
 * ANAC - Agence Nationale de l'Aviation Civile
 *
 * TODO: Le système d'authentification doit être corrigé pour renvoyer l'ID utilisateur
 * lors du login. Pour l'instant, un ID temporaire est utilisé.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

import { createIncident } from "../../services/incidentService";
import {
  TypeIncident,
  PrioriteIncident,
  INCIDENT_TYPE_LABELS,
  INCIDENT_TYPE_CODES,
} from "../../types/incident";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

const CreateIncident: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [typeIncident, setTypeIncident] = useState<TypeIncident | "">("");
  const [priorite, setPriorite] = useState<PrioriteIncident | "">("");
  const [localisation, setLocalisation] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      Swal.fire({
        title: "Incident créé !",
        text: "L'incident a été créé avec succès et sera analysé par l'IA.",
        icon: "success",
        confirmButtonColor: "#0066CC",
      }).then(() => {
        navigate("/incidents");
      });
    },
    onError: (error: any) => {
      console.error("Erreur création incident:", error);
      Swal.fire({
        title: "Erreur",
        text: error?.response?.data?.message || "Impossible de créer l'incident.",
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

      setPhoto(file);
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
    setPhoto(null);
    setPhotoPreview(null);
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

    /**
     * TODO IMPORTANT: Corriger le système d'authentification
     *
     * Problème actuel: Le backend LoginResponse ne renvoie pas l'ID utilisateur.
     * Le AuthContext du dashboard ne stocke donc pas l'ID.
     *
     * Solutions possibles:
     * 1. Modifier LoginResponse.java pour inclure userId
     * 2. Ajouter un endpoint /api/v1/users/me pour récupérer l'utilisateur connecté
     * 3. Décoder le JWT côté frontend pour extraire le user ID
     *
     * Pour l'instant, on utilise un ID temporaire (1) pour les tests.
     */
    const declareParId = "1"; // TEMPORARY - Should be user.id from AuthContext

    createMutation.mutate({
      titre: titre.trim(),
      description: description.trim(),
      typeIncident: typeIncident || undefined,
      priorite: priorite || undefined,
      localisation: localisation.trim() || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      photo: photo || undefined,
      declareParId,
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Créer un Incident Aviation
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Signalement conforme aux standards OACI - Aéroport LFW Lomé
          </p>
        </div>
        <Button
          onClick={() => navigate("/incidents")}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
        >
          <ArrowLeft size={18} />
          Retour
        </Button>
      </div>

      {/* AUTH WARNING */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Note technique:</strong> Le système d'authentification nécessite une correction.
            L'incident sera temporairement créé avec un ID utilisateur par défaut.
            Contactez l'administrateur pour résoudre ce problème.
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
                placeholder="Décrivez l'incident de manière détaillée : lieu précis, circonstances, gravité apparente, actions déjà entreprises..."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Classification OACI */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Classification OACI (Optionnel)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Si non renseigné, l'IA analysera automatiquement la photo et la description pour suggérer une classification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type d'incident */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type d'incident OACI
              </label>
              <select
                value={typeIncident}
                onChange={(e) => setTypeIncident(e.target.value as TypeIncident | "")}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
              >
                <option value="">Laisser l'IA déterminer</option>
                {Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    [{INCIDENT_TYPE_CODES[value as TypeIncident]}] {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priorité
              </label>
              <select
                value={priorite}
                onChange={(e) => setPriorite(e.target.value as PrioriteIncident | "")}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
              >
                <option value="">Laisser l'IA déterminer</option>
                <option value="CRITIQUE">Critique</option>
                <option value="ELEVEE">Élevée</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="FAIBLE">Faible</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Localisation */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Localisation (Optionnel)
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
            Photo de l'incident (Optionnel)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            La photo sera analysée par l'IA pour une classification automatique. Max 10 MB.
          </p>

          {!photo ? (
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
                src={photoPreview!}
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {photo.name} ({(photo.size / 1024 / 1024).toFixed(2)} MB)
              </p>
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
            onClick={() => navigate("/incidents")}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? "Création en cours..." : "Créer l'incident"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateIncident;
