import { useQuery } from "@tanstack/react-query";
import MessageTable from "../components/messages/MessageTable";
import { Message } from "../types";
import { getAllMessages } from "../services/message";
import { useState } from "react";
import * as XLSX from 'xlsx';

const Messages: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState(""); // clientId sélectionné
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: getAllMessages,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Trier les messages du plus récent au plus ancien
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.recdTime).getTime() - new Date(a.recdTime).getTime()
  );

  // Extraire tous les clientIds uniques pour le select
  const clientIds = Array.from(new Set(messages.map((msg) => msg.clientId)));

  // Filtrer les messages
  const filteredMessages = sortedMessages.filter((msg) => {
    // Filtre par clientId sélectionné
    if (selectedClient && msg.clientId !== selectedClient) return false;

    // Filtre par date
    if (startDate || endDate) {
      const msgDate = new Date(msg.recdTime);

      if (startDate && !endDate) return msgDate >= new Date(startDate);

      if (!startDate && endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return msgDate <= end;
      }

      if (startDate && endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return msgDate >= new Date(startDate) && msgDate <= end;
      }
    }
    return true;
  });

  // Fonction d'export Excel
const exportToExcel = () => {
  // Préparer les données pour Excel
  const dataForExcel = filteredMessages.map((msg) => ({
    "Message ID": msg.messageId,
    "Client ID": msg.clientId,
    "Téléphone": msg.phone,
    "Nosms": msg.nosms,
    "Date de réception": new Date(msg.recdTime).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }));

  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();
  
  // Convertir les données en worksheet
  const ws = XLSX.utils.json_to_sheet(dataForExcel);

  // Ajuster la largeur des colonnes
  const colWidths = [
    { wch: 23 }, // Message ID
    { wch: 18 }, // Client ID
    { wch: 18 }, // Téléphone
    { wch: 5 }, // Nosms
    { wch: 22 }  // Date
  ];
  ws['!cols'] = colWidths;

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, "Messages");

  // Générer le nom du fichier avec la date actuelle
  const fileName = `Messages_export_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Télécharger le fichier
  XLSX.writeFile(wb, fileName);
};

  const resetFilters = () => {
    setSelectedClient("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start gap-4">
<div className="flex items-center justify-between w-full">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Messages
      </h1>
      
      {/* Bouton d'export Excel */}
      <button
        onClick={exportToExcel}
        disabled={filteredMessages.length === 0}
        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        Exporter en Excel
      </button>
    </div>


        {/* Filtres */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Select clientId */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          >
            <option value="">Select Client ID</option>
            {clientIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          {/* Date de début */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />

          {/* Date de fin */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />

          {/* Bouton reset */}
          {(selectedClient || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-100 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Failed to load messages</span>
          </div>
          <p className="mt-1 text-sm">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing <span className="font-semibold">{filteredMessages.length}</span> of{" "}
              <span className="font-semibold">{messages.length}</span> messages
            </span>
            {(selectedClient || startDate || endDate) && (
              <span className="text-blue-600 dark:text-blue-400">Filters active</span>
            )}
          </div>
          <MessageTable messages={filteredMessages} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default Messages;
