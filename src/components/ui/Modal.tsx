import React, { useEffect } from "react";

interface ModalProps {
  children?: React.ReactNode;
  onClose: () => void;
  modalType?: string;
  size?: "sm" | "md" | "lg" | "xl" | "auto";
}

const Modal: React.FC<ModalProps> = ({ children, onClose, size = "auto" }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "visible";
    };
  }, [onClose]);

  // Détermine la classe de largeur en fonction de la taille
  const widthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    auto: "max-w-fit",
  }[size];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative rounded-lg shadow-lg ${widthClass} mx-4 dark:bg-gray-800 dark:text-white bg-white text-gray-800`}
      >
        {children ? (
          children
        ) : (
          <div className="flex flex-col items-center p-6">
            <div
              className={`text-xl font-bold mb-4 dark:text-gray-100 text-gray-900`}
            >
              Information
            </div>
            <div
              className={`mb-6 text-center dark:text-gray-300 text-gray-600`}
            >
              Aucun contenu, Revenir plus tard
            </div>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white bg-blue-500 hover:bg-blue-600 text-white`}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
