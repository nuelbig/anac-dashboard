import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, Sun, Moon, LogOut, Key } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fonction pour fermer le menu lors d'un clic en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    // Ajouter l'écouteur d'événement lorsque le menu est ouvert
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Nettoyer l'écouteur d'événement lors du démontage
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
    if (showUserMenu) {
      setShowPasswordForm(false);
    }
  };

  const handlePasswordFormToggle = () => {
    setShowPasswordForm(!showPasswordForm);
    setError("");
    setSuccess("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordSubmit = async () => {
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      setIsLoading(true);

      // Si tout se passe bien, on affiche un message de succès
      setSuccess("Mot de passe mis à jour avec succès!");
      toast.success("Mot de passe mis à jour avec succès!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Après un délai, fermer le formulaire
      setTimeout(() => {
        setShowPasswordForm(false);
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        "Une erreur est survenue lors de la modification du mot de passe"
      );
      console.error(
        "Une erreur est survenue lors de la modification du mot de passe:",
        err
      );
      toast.error(
        "Une erreur est survenue lors de la modification du mot de passe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 lg:hidden rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 mr-2"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none cursor-pointer text-gray-500 dark:text-gray-400"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
        </button>

        <div className="relative inline-block text-left">
          <div className="flex items-center">
            <button
              className="flex items-center space-x-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 cursor-pointer"
              onClick={handleUserMenuToggle}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-800 flex items-center justify-center text-white">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.name}
              </span>
            </button>

            <button
              onClick={logout}
              className="ml-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 cursor-pointer"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div
              ref={userMenuRef}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-800 flex items-center justify-center text-white text-lg">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Rôle: {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                  onClick={handlePasswordFormToggle}
                >
                  <Key size={16} className="mr-2" />
                  Modifier le mot de passe
                </button>
              </div>

              {/* Password Change Form */}
              {showPasswordForm && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Modifier votre mot de passe
                  </h3>

                  {error && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-2 rounded-md text-xs mb-3">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-2 rounded-md text-xs mb-3">
                      {success}
                    </div>
                  )}

                  <div>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ancien mot de passe
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={handlePasswordFormToggle}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handlePasswordSubmit}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Traitement..." : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
