import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { AuthResponse, DataResponse, baseUrl, User } from "../types";
import api from "../services/api";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSystem: boolean;
  isDev: boolean;
  isNetwork: boolean;
  resetInactivityTimer: () => void;
}

interface JwtPayload {
  exp: number;
  sub: string;
  // autres champs du JWT si nécessaire
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSystem, setIsSystem] = useState<boolean>(false);
  const [isDev, setIsDev] = useState<boolean>(false);
  const [isNetwork, setIsNetwork] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const inactivityTimeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  
  // Configurer la durée d'inactivité en millisecondes
  const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 1 * 60 * 1000; // 1 minute d'avertissement avant déconnexion

  // Fonction pour vérifier si un token est valide
  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      // Vérifier si le token est expiré (exp est en secondes)
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };

  // Fonction pour récupérer l'utilisateur depuis l'API
  const fetchCurrentUser = async (token: string): Promise<User | null> => {
    try {
      // S'assurer que le token est utilisé pour cette requête spécifique
      const response = await api.get(baseUrl + '/api/v1/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  };

  // Fonction pour rafraîchir le token
  const refreshToken = async (): Promise<string | null> => {
    const refresh = Cookies.get('refresh_token');
    if (!refresh) return null;

    try {
      const response = await api.post<{ access_token: string }>(baseUrl + '/api/v1/auth/refresh-token', {
        refresh_token: refresh
      });
      
      const newToken = response.data.access_token;
      
      // Stocker le nouveau token dans un cookie sécurisé avec expiration
      const decoded = jwtDecode<JwtPayload>(newToken);
      const expires = new Date(decoded.exp * 1000);
      
      Cookies.set('access_token', newToken, {
        expires,
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
      });
      
      // Mettre à jour l'en-tête d'autorisation
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      
      return newToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Récupérer le token depuis le cookie
        let token = Cookies.get('access_token');
        
        if (token) {
          // Vérifier si le token est valide
          if (!isTokenValid(token)) {
            // Token expiré, essayer de le rafraîchir
            const newToken = await refreshToken();
            if (!newToken) {
              // Échec du rafraîchissement, déconnexion
              logout();
              setIsInitialized(true);
              return;
            }
            token = newToken;
          }
          
          // Configurer l'en-tête d'autorisation
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Essayer de récupérer les données utilisateur du localStorage
          let userData: User | null = null;
          const userDataStr = localStorage.getItem("user");
          
          if (userDataStr) {
            try {
              userData = JSON.parse(userDataStr);
            } catch (error) {
              console.error("Failed to parse user data:", error);
            }
          }
          
          // Si aucune donnée utilisateur en cache ou données incomplètes, récupérer depuis l'API
          if (!userData || !userData.role) {
            userData = await fetchCurrentUser(token);
            if (userData) {
              // Stocker dans localStorage pour persister entre les rechargements
              localStorage.setItem("user", JSON.stringify(userData));
            } else {
              // Si l'API ne renvoie pas de données utilisateur, déconnexion
              logout();
              setIsInitialized(true);
              return;
            }
          }
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            handleRoleFlags(userData.role);
          }
        }
      } catch (error) {
        console.error("Authentication initialization failed:", error);
        logout();
      }
      
      setIsInitialized(true);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<DataResponse<AuthResponse>>(
        baseUrl + "/api/v1/auth/login",
        {
          email,
          password,
        }
      );

      // Le backend retourne une DataResponse qui enveloppe les données dans un champ "data"
      const { access_token, refresh_token, name, role } = response.data.data;

      // Décoder le token pour obtenir l'expiration
      const decoded = jwtDecode<JwtPayload>(access_token);
      const expires = new Date(decoded.exp * 1000);

      // Stocker les tokens dans des cookies sécurisés
      Cookies.set('access_token', access_token, {
        expires,
        secure: window.location.protocol === 'https:',
        sameSite: 'strict'
      });

      // Stocker le refresh_token seulement s'il existe
      if (refresh_token) {
        Cookies.set('refresh_token', refresh_token, {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          secure: window.location.protocol === 'https:',
          sameSite: 'strict'
        });
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Stocker les informations de l'utilisateur dans localStorage pour persister entre rechargements
      const userData: User = { name, email, role };
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      handleRoleFlags(role);
      
      // Initialiser le timer d'inactivité après la connexion
      resetInactivityTimer();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    // Nettoyer les timers d'inactivité
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    setShowWarning(false);
    
    // Supprimer les cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    
    // Supprimer les données stockées
    localStorage.removeItem("user");
    
    // Supprimer l'en-tête d'autorisation
    delete api.defaults.headers.common["Authorization"];

    // Réinitialiser l'état
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsSystem(false);
    setIsDev(false);
    setIsNetwork(false);
  }, []);
  
  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    // Si l'utilisateur n'est pas authentifié, ne rien faire
    if (!isAuthenticated) {
      return;
    }
    
    // Nettoyer les timers existants
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      setShowWarning(false);
    }
    
    // Définir le timer d'avertissement
    const newWarningTimeout = setTimeout(() => {
      setShowWarning(true);
    }, INACTIVITY_TIME - WARNING_TIME);
    
    // Définir le timer d'inactivité
    const newInactivityTimeout = setTimeout(() => {
      logout();
    }, INACTIVITY_TIME);
    
    warningTimeoutRef.current = newWarningTimeout;
    inactivityTimeoutRef.current = newInactivityTimeout;
  }, [isAuthenticated, INACTIVITY_TIME, WARNING_TIME, logout]);
  
  // Ajouter des gestionnaires d'événements pour réinitialiser le timer sur l'activité de l'utilisateur
  useEffect(() => {
    if (isAuthenticated) {
      // Initialiser le timer
      resetInactivityTimer();
      
      // Ajouter des écouteurs d'événements
      const eventTypes = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const activityHandler = () => {
        resetInactivityTimer();
      };
      
      // Ajouter les écouteurs d'événements
      eventTypes.forEach(type => {
        window.addEventListener(type, activityHandler);
      });
      
      // Nettoyer les écouteurs lors du démontage
      return () => {
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        
        eventTypes.forEach(type => {
          window.removeEventListener(type, activityHandler);
        });
      };
    }
  }, [isAuthenticated, resetInactivityTimer]);

  const handleRoleFlags = (role: string) => {
    setIsAdmin(role === "ADMIN");
    setIsSystem(role === "SYSTEM");
    setIsDev(role === "DEV");
    setIsNetwork(role === "NETWORK");
  };

  // Si l'initialisation n'est pas terminée, on peut afficher un indicateur de chargement
  if (!isInitialized) {
    return null; // Ou un composant de chargement
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isAdmin,
        isSystem,
        isDev,
        isNetwork,
        resetInactivityTimer
      }}
    >
      {/* Afficher une alerte d'avertissement d'inactivité si nécessaire */}
      {showWarning && isAuthenticated && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-4 text-center shadow-md z-50">
          <p>Vous serez déconnecté pour inactivité dans moins d'une minute. Cliquez n'importe où pour rester connecté.</p>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};