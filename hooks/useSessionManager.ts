// hooks/useSessionManager.ts
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '@/store';
import { getCurrentUser, updateLastActivity, forceLogout } from '@/lib/userStore';
import toast from 'react-hot-toast';

const SESSION_CHECK_INTERVAL = 5000; // 5 secondes pour un compte à rebours plus précis
const ACTIVITY_UPDATE_INTERVAL = 15000; // 15 secondes

export const useSessionManager = () => {
  const router = useRouter();
  const { userOnline, setUserOnline } = useSchoolStore();
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const activityUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier si l'utilisateur a un rôle standard
  const hasStandardRole = useCallback(() => {
    return userOnline?.roles?.some(role => 
      ['caisse'].includes(role.name.toLowerCase())
    ) || false;
  }, [userOnline]);

  // Calculer le temps restant avant expiration
  const calculateRemainingTime = useCallback((user: any) => {
    const now = Date.now();
    
    if (user.requiresInactivityCheck) {
      // Pour les rôles standards, calculer basé sur la dernière activité
      const inactivityThreshold = 3 * 60 * 1000; // 3 minutes
      const timeSinceLastActivity = now - user.lastActivity;
      return Math.max(0, inactivityThreshold - timeSinceLastActivity);
    } else {
      // Pour les autres rôles, calculer basé sur l'expiration de session
      return Math.max(0, user.expiresAt - now);
    }
  }, []);

  // Formater le temps pour l'affichage
  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(async (reason: string = '') => {
    console.log(`🔒 Tentative de déconnexion: ${reason}`);
    console.trace('Stack trace de la déconnexion');
    
    // Nettoyer les intervalles
    if (sessionCheckRef.current) {
      clearInterval(sessionCheckRef.current);
    }
    if (activityUpdateRef.current) {
      clearInterval(activityUpdateRef.current);
    }

    // Supprimer l'utilisateur du store et de IndexedDB
    setUserOnline(null);
    await forceLogout();
    
    // Afficher le message et rediriger
    if (reason) {
      toast.error(reason);
    }
    
    router.push('/');
  }, [router, setUserOnline]);

  // Vérification périodique de la session
  const checkSession = useCallback(async () => {
    try {
      // console.log('🔍 Vérification de la session en cours...');
      const user = await getCurrentUser();
      console.log('Utilisateur actuel:', user ? 'Connecté' : 'Non connecté');
      
      if (!user && userOnline) {
        console.log('🚨 Déconnexion nécessaire: utilisateur non trouvé mais toujours connecté dans le store');
        // L'utilisateur a été déconnecté (session expirée ou inactivité)
        const reason = hasStandardRole() 
          ? 'Déconnexion pour inactivité (3 minutes)'
          : 'Votre session a expiré';
        await logout(reason);
        return;
      }
      
      if (user && !userOnline) {
        // Restaurer l'utilisateur dans le store
        setUserOnline(user);
      }

      // 🕐 COMPTE À REBOURS DANS LA CONSOLE
      // if (user && userOnline) {
      //   const remainingTime = calculateRemainingTime(user);
      //   const remainingSeconds = Math.floor(remainingTime / 1000);
        
      //   if (remainingSeconds > 0) {
      //     const roleType = hasStandardRole() ? '⏰ INACTIVITÉ' : '🕐 SESSION';
      //     const timeFormatted = formatTime(remainingTime);
          
      //     // Afficher le compte à rebours
      //     console.log(`${roleType} - Temps restant: ${timeFormatted} (${remainingSeconds}s)`);
          
      //     // Avertissements à des moments clés
      //     if (remainingSeconds === 60) {
      //       console.warn('⚠️  1 MINUTE RESTANTE avant déconnexion !');
      //     } else if (remainingSeconds === 30) {
      //       console.warn('⚠️  30 SECONDES RESTANTES avant déconnexion !');
      //     } else if (remainingSeconds === 10) {
      //       console.warn('🚨 10 SECONDES RESTANTES avant déconnexion !');
      //     } else if (remainingSeconds <= 5 && remainingSeconds > 0) {
      //       console.error(`🚨 DÉCONNEXION DANS ${remainingSeconds} SECONDE${remainingSeconds > 1 ? 'S' : ''} !`);
      //     }
      //   }
      // }
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
    }
  }, [userOnline, setUserOnline, logout, hasStandardRole, calculateRemainingTime, formatTime]);

  // Gestion des événements d'activité
  const handleActivity = useCallback(() => {
    // Mise à jour immédiate de l'activité pour les rôles standards
    if (hasStandardRole()) {
      updateLastActivity();
      // console.log('🔄 Activité détectée - Timer d\'inactivité remis à zéro');
    }
  }, [hasStandardRole]);

  // Mise à jour périodique de l'activité
  const updateActivity = useCallback(async () => {
    if (userOnline) {
      try {
        await updateLastActivity();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'activité:', error);
      }
    }
  }, [userOnline]);

  // Démarrer la surveillance
  const startSessionMonitoring = useCallback(() => {
    // console.log('🚀 Surveillance de session démarrée');
    
    // Vérification de session toutes les 5 secondes pour le compte à rebours
    sessionCheckRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    
    // Mise à jour de l'activité toutes les 15 secondes
    activityUpdateRef.current = setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL);

    // Écouter les événements d'activité seulement pour les rôles standards
    if (hasStandardRole()) {
      // console.log('👀 Surveillance d\'activité activée (rôle Caisse)');
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      return () => {
        // console.log('🛑 Surveillance arrêtée');
        // Nettoyer les intervalles
        if (sessionCheckRef.current) {
          clearInterval(sessionCheckRef.current);
        }
        if (activityUpdateRef.current) {
          clearInterval(activityUpdateRef.current);
        }
        
        // Nettoyer les événements
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
      };
    } else {
      console.log('📅 Surveillance de session simple (rôle avec accès complet)');
    }

    return () => {
      console.log('🛑 Surveillance arrêtée');
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
      if (activityUpdateRef.current) {
        clearInterval(activityUpdateRef.current);
      }
    };
  }, [checkSession, updateActivity, handleActivity, hasStandardRole]);

  // Arrêter la surveillance
  const stopSessionMonitoring = useCallback(() => {
    // console.log('⏹️  Arrêt de la surveillance de session');
    if (sessionCheckRef.current) {
      clearInterval(sessionCheckRef.current);
      sessionCheckRef.current = null;
    }
    if (activityUpdateRef.current) {
      clearInterval(activityUpdateRef.current);
      activityUpdateRef.current = null;
    }
  }, []);

  // Effet pour démarrer/arrêter la surveillance selon l'état de connexion
  useEffect(() => {
    // console.log('🔄 Mise à jour de l\'état de connexion:', userOnline ? 'Connecté' : 'Déconnecté');
    if (userOnline) {
      console.log('👤 Utilisateur connecté, démarrage de la surveillance');
      const cleanup = startSessionMonitoring();
      return () => {
        // console.log('🧹 Nettoyage de la surveillance de session');
        cleanup?.();
      };
    } else {
      console.log('👤 Aucun utilisateur connecté, arrêt de la surveillance');
      stopSessionMonitoring();
    }
  }, [userOnline, startSessionMonitoring, stopSessionMonitoring]);

  // Vérification initiale
  useEffect(() => {
    if (userOnline) {
      // console.log('🔍 Vérification initiale de session');
      checkSession();
    }
  }, []);

  return {
    logout,
    checkSession,
    isMonitoring: !!sessionCheckRef.current,
    hasStandardRole: hasStandardRole()
  };
};