"use client";
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const handleConnectionChange = () => {
      const newStatus = navigator.onLine;
      setIsOnline(newStatus);

      // Détection du type de connexion si l'API est disponible
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || null;
      setConnectionType(effectiveType);

      if (!newStatus) {
        toast.error(
          <div className="flex items-center gap-2">
            <Icon icon="ion:wifi-off-outline" className="text-xl" />
            <div>
              <p className="font-medium">Aucune connexion</p>
              <p className="text-xs opacity-90">Fonctionnalités limitées</p>
            </div>
          </div>,
          {
            duration: Infinity,
            id: 'network-status',
            position: 'bottom-center',
            style: {
              background: '#ef4444',
              color: 'white',
              minWidth: '320px',
              padding: '0.75rem 1rem'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444'
            }
          }
        );
        setWasOffline(true);
      } else if (wasOffline) {
        toast.success(
          <div className="flex items-center gap-2">
            <Icon 
              icon={connectionType === 'cellular' ? 'ion:cellular-outline' : 'ion:wifi-outline'} 
              className="text-xl" 
            />
            <div>
              <p className="font-medium">Connexion rétablie</p>
              {connectionType && (
                <p className="text-xs opacity-90">
                  {connectionType === 'cellular' ? 'Réseau mobile' : 'Wi-Fi'} - {effectiveType}
                </p>
              )}
            </div>
          </div>,
          {
            duration: 5000,
            id: 'network-status',
            position: 'bottom-center',
            style: {
              background: '#10b981',
              color: 'white',
              minWidth: '320px',
              padding: '0.75rem 1rem'
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981'
            }
          }
        );
        setWasOffline(false);
      }
    };

    // Vérification initiale
    handleConnectionChange();

    // Écouteurs d'événements
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    // Network Information API
    const connection = (navigator as any).connection;
    if (connection?.addEventListener) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      if (connection?.removeEventListener) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      toast.dismiss('network-status');
    };
  }, [wasOffline, connectionType]);

  return null;
}