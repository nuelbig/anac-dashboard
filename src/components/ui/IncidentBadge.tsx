/**
 * Composant Badge pour afficher les statuts, priorités et types d'incidents
 * Avec les couleurs aviation OACI standardisées
 */

import {
  StatutIncident,
  PrioriteIncident,
  TypeIncident,
  STATUT_CONFIG,
  PRIORITE_CONFIG,
  INCIDENT_TYPE_COLORS,
  INCIDENT_TYPE_LABELS,
  INCIDENT_TYPE_CODES
} from "../../types/incident";

interface IncidentBadgeProps {
  type: "statut" | "priorite" | "type";
  value: StatutIncident | PrioriteIncident | TypeIncident | null | undefined;
  showCode?: boolean; // Pour afficher le code OACI (ex: "RI", "FOD")
  size?: "sm" | "md" | "lg";
}

const IncidentBadge = ({ type, value, showCode = false, size = "md" }: IncidentBadgeProps) => {
  // Gérer les valeurs nulles/undefined
  if (!value) {
    return (
      <span className={`inline-flex items-center font-medium rounded-full ${size === "sm" ? "text-xs px-2 py-0.5" : size === "md" ? "text-sm px-3 py-1" : "text-base px-4 py-1.5"}`}
        style={{
          backgroundColor: "#f0f0f0",
          color: "#666666",
        }}
      >
        Non défini
      </span>
    );
  }
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const getSizeClass = () => sizeClasses[size];

  // Badge pour les statuts
  if (type === "statut") {
    const config = STATUT_CONFIG[value as StatutIncident];
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full ${getSizeClass()}`}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  }

  // Badge pour les priorités
  if (type === "priorite") {
    const config = PRIORITE_CONFIG[value as PrioriteIncident];
    return (
      <span
        className={`inline-flex items-center font-bold rounded ${getSizeClass()}`}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}`,
        }}
      >
        {config.label}
      </span>
    );
  }

  // Badge pour les types d'incidents (avec code OACI optionnel)
  if (type === "type") {
    const typeValue = value as TypeIncident;
    const color = INCIDENT_TYPE_COLORS[typeValue];
    const label = INCIDENT_TYPE_LABELS[typeValue];
    const code = INCIDENT_TYPE_CODES[typeValue];

    return (
      <span
        className={`inline-flex items-center gap-2 font-medium rounded ${getSizeClass()}`}
        style={{
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        {showCode && (
          <span
            className="font-bold px-1.5 py-0.5 rounded text-white"
            style={{
              backgroundColor: color,
              fontFamily: "'Roboto Mono', monospace",
              fontSize: size === "sm" ? "0.65rem" : size === "md" ? "0.75rem" : "0.85rem",
            }}
          >
            {code}
          </span>
        )}
        <span>{label}</span>
      </span>
    );
  }

  return null;
};

export default IncidentBadge;
