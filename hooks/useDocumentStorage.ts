import { useState, useCallback } from 'react';

interface DocumentData {
  label: string;
  path: File;
}

export function useDocumentStorage() {
  const [documents, setDocuments] = useState<DocumentData[]>(() => {
    // Récupérer les documents stockés au démarrage
    const storedDocs = localStorage.getItem('registrationDocuments');
    if (storedDocs) {
      return JSON.parse(storedDocs);
    }
    return [];
  });

  const addDocument = useCallback((doc: DocumentData) => {
    const newDocs = [...documents, doc];
    setDocuments(newDocs);
    // Stocker les métadonnées (label) en localStorage
    localStorage.setItem('registrationDocuments', JSON.stringify(newDocs.map(d => ({ label: d.label }))));
  }, [documents]);

  const removeDocument = useCallback((index: number) => {
    const newDocs = [...documents];
    newDocs.splice(index, 1);
    setDocuments(newDocs);
    localStorage.setItem('registrationDocuments', JSON.stringify(newDocs.map(d => ({ label: d.label }))));
  }, [documents]);

  const clearDocuments = useCallback(() => {
    setDocuments([]);
    localStorage.removeItem('registrationDocuments');
  }, []);

  return {
    documents,
    addDocument,
    removeDocument,
    clearDocuments
  };
}
