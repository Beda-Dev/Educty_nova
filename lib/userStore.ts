// lib/indexedDB/userStore.ts
import { openDB } from 'idb';
import type { User } from '@/lib/interface';

const DB_NAME = 'AppDB';
const STORE_NAME = 'userWithPermissions';
const DB_VERSION = 1;
const SESSION_DURATION_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_DURATION_MINUTES) || 60;

type UserWithSession = User & {
  expiresAt: number; // timestamp en ms
};

export const getDB = async () => {
  // console.log('🔌 getDB - Tentative de connexion à la base de données');
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // console.log('🆕 getDB - Création du store IndexedDB');
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
    // console.log('✅ getDB - Connexion à la base de données réussie');
    return db;
  } catch (error) {
    // console.error('❌ getDB - Erreur lors de la connexion à la base de données:', error);
    throw error;
  }
};

// ✅ Sauvegarde utilisateur avec date d’expiration
export const saveUser = async (user: User) => {
  // console.log('💾 saveUser - Début de la sauvegarde utilisateur', { userId: user?.id });
  try {
    const db = await getDB();
    const expiresAt = Date.now() + SESSION_DURATION_MINUTES * 60 * 1000;
    const userWithSession: UserWithSession = { ...user, expiresAt };
    
    // console.log('📅 saveUser - Date d\'expiration:', new Date(expiresAt).toLocaleString());
    await db.put(STORE_NAME, userWithSession);
    
    // console.log('✅ saveUser - Utilisateur sauvegardé avec succès', { 
    //   userId: user.id,
    //   email: user.email,
    //   expiresAt: new Date(expiresAt).toLocaleString()
    // });
  } catch (error) {
    // console.error('❌ saveUser - Erreur lors de la sauvegarde de l\'utilisateur:', error);
    throw error;
  }
};

// ✅ Récupère le seul utilisateur s'il n'est pas expiré
export const getCurrentUser = async (): Promise<User | null> => {
  // console.log('🚀 getCurrentUser - Début de la fonction');
  try {
    const db = await getDB();
    // console.log('🔍 getCurrentUser - Connexion à la base de données établie');
    
    const allUsers = await db.getAll(STORE_NAME) as UserWithSession[];
    // console.log('📊 getCurrentUser - Nombre d\'utilisateurs trouvés:', allUsers.length);
    // console.log('📝 getCurrentUser - Données brutes des utilisateurs:', allUsers);

    if (allUsers.length === 0) {
      // console.log('❌ getCurrentUser - Aucun utilisateur trouvé dans le stockage local');
      return null;
    }

    const user = allUsers[0];
    // console.log('👤 getCurrentUser - Utilisateur trouvé:', { 
    //   id: user.id, 
    //   email: user.email,
    //   expiresAt: new Date(user.expiresAt).toLocaleString()
    // });

    if (Date.now() > user.expiresAt) {
      // console.log('⌛ getCurrentUser - Session expirée, suppression des données locales');
      await db.clear(STORE_NAME); // Session expirée
      return null;
    }

    // console.log('✅ getCurrentUser - Utilisateur valide retourné');
    return user;
  } catch (error) {
    // console.error('❌ getCurrentUser - Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

// ✅ Supprimer tous les utilisateurs (sans ID)
export const deleteUser = async () => {
  // console.log('🗑️ deleteUser - Suppression de tous les utilisateurs');
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    // console.log('✅ deleteUser - Tous les utilisateurs ont été supprimés');
  } catch (error) {
    // console.error('❌ deleteUser - Erreur lors de la suppression des utilisateurs:', error);
    throw error;
  }
};

// ✅ Liste tous les utilisateurs (utile pour debug)
export const getAllUsers = async (): Promise<User[]> => {
  // console.log('📋 getAllUsers - Récupération de tous les utilisateurs');
  try {
    const db = await getDB();
    const users = await db.getAll(STORE_NAME);
    // console.log(`📊 getAllUsers - ${users.length} utilisateur(s) trouvé(s)`);
    return users;
  } catch (error) {
    // console.error('❌ getAllUsers - Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};
