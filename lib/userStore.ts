// lib/userStore.ts
import { openDB } from 'idb';
import type { User } from '@/lib/interface';

const DB_NAME = 'AppDB';
const STORE_NAME = 'userWithPermissions';
const DB_VERSION = 1;
const SESSION_DURATION_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_DURATION_MINUTES) || 60;

// Rôles qui nécessitent une déconnexion après inactivité
const STANDARD_ROLES = ['caisse']; // en lowercase
const INACTIVITY_TIMEOUT_MINUTES = 3; // 3 minutes d'inactivité pour les rôles standards

type UserWithSession = User & {
  expiresAt: number; // timestamp en ms
  lastActivity: number; // timestamp de dernière activité
  requiresInactivityCheck: boolean; // si l'utilisateur doit être déconnecté après inactivité
};

export const getDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
    return db;
  } catch (error) {
    console.error('❌ getDB - Erreur lors de la connexion à la base de données:', error);
    throw error;
  }
};

// Vérifie si un utilisateur a un rôle standard
const hasStandardRole = (user: User): boolean => {
  return user.roles?.some(role => 
    STANDARD_ROLES.includes(role.name.toLowerCase())
  ) || false;
};

// Met à jour la dernière activité de l'utilisateur
export const updateLastActivity = async () => {
  try {
    const db = await getDB();
    const allUsers = await db.getAll(STORE_NAME) as UserWithSession[];
    
    if (allUsers.length > 0) {
      const user = allUsers[0];
      user.lastActivity = Date.now();
      await db.put(STORE_NAME, user);
    }
  } catch (error) {
    console.error('❌ updateLastActivity - Erreur:', error);
  }
};

// ✅ Sauvegarde utilisateur avec date d'expiration et gestion d'inactivité
export const saveUser = async (user: User) => {
  try {
    const db = await getDB();
    const expiresAt = Date.now() + SESSION_DURATION_MINUTES * 60 * 1000;
    const now = Date.now();
    
    const userWithSession: UserWithSession = { 
      ...user, 
      expiresAt,
      lastActivity: now,
      requiresInactivityCheck: hasStandardRole(user)
    };
    
    await db.put(STORE_NAME, userWithSession);
    
    console.log('✅ saveUser - Utilisateur sauvegardé:', { 
      userId: user.id,
      email: user.email,
      requiresInactivityCheck: userWithSession.requiresInactivityCheck,
      expiresAt: new Date(expiresAt).toLocaleString()
    });
  } catch (error) {
    console.error('❌ saveUser - Erreur lors de la sauvegarde:', error);
    throw error;
  }
};

// ✅ Récupère l'utilisateur en vérifiant la session ET l'inactivité
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const db = await getDB();
    const allUsers = await db.getAll(STORE_NAME) as UserWithSession[];

    if (allUsers.length === 0) {
      return null;
    }

    const user = allUsers[0];
    const now = Date.now();

    // Vérification de l'expiration de session
    if (now > user.expiresAt) {
      console.log('⌛ getCurrentUser - Session expirée');
      await db.clear(STORE_NAME);
      return null;
    }

    // Vérification de l'inactivité pour les rôles standards
    if (user.requiresInactivityCheck) {
      const inactivityThreshold = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
      const timeSinceLastActivity = now - user.lastActivity;
      
      if (timeSinceLastActivity > inactivityThreshold) {
        console.log('⏰ getCurrentUser - Déconnexion pour inactivité (rôle standard)');
        await db.clear(STORE_NAME);
        return null;
      }
    }

    return user;
  } catch (error) {
    console.error('❌ getCurrentUser - Erreur:', error);
    return null;
  }
};

// ✅ Force la déconnexion
export const forceLogout = async () => {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    console.log('🔒 forceLogout - Déconnexion forcée effectuée');
  } catch (error) {
    console.error('❌ forceLogout - Erreur:', error);
    throw error;
  }
};

// ✅ Supprimer tous les utilisateurs
export const deleteUser = async () => {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    console.log('✅ deleteUser - Tous les utilisateurs supprimés');
  } catch (error) {
    console.error('❌ deleteUser - Erreur:', error);
    throw error;
  }
};

// ✅ Liste tous les utilisateurs (debug)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const db = await getDB();
    const users = await db.getAll(STORE_NAME);
    return users;
  } catch (error) {
    console.error('❌ getAllUsers - Erreur:', error);
    throw error;
  }
};