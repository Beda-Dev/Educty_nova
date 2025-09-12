// lib/app-initialization.ts
import { cleanupLocalStorageAndMigrateToIndexedDB } from '@/store/schoolservice';

/**
 * Fonction à appeler au démarrage de l'application
 * pour nettoyer le localStorage et migrer vers IndexedDB
 */
export const initializeApp = async () => {
  console.log("Initialisation de l'application...");
  
  try {
    // Nettoyer et migrer les données de localStorage vers IndexedDB
    await cleanupLocalStorageAndMigrateToIndexedDB();
    
    // Vous pouvez ajouter d'autres tâches d'initialisation ici
    // comme vérifier la connexion, charger les configurations, etc.
    
    console.log("Initialisation de l'application terminée avec succès");
    return true;
    
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'application:", error);
    return false;
  }
};

/**
 * Fonction pour nettoyer complètement le localStorage des données de l'école
 * Utile pour le débogage ou la réinitialisation complète
 */
export const clearAllAppData = async () => {
  try {
    // Supprimer de localStorage
    localStorage.removeItem("school-store");
    
    // Vous pouvez aussi nettoyer IndexedDB si nécessaire
    // Note: Ceci supprimera TOUTES les données persistantes
    const indexedDB = window.indexedDB;
    if (indexedDB) {
      const deleteRequest = indexedDB.deleteDatabase('school-management-db');
      deleteRequest.onsuccess = () => {
        console.log("Base de données IndexedDB supprimée avec succès");
      };
      deleteRequest.onerror = () => {
        console.error("Erreur lors de la suppression de la base de données");
      };
    }
    
    console.log("Toutes les données de l'application ont été supprimées");
    return true;
    
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    return false;
  }
};