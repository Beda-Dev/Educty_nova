"use client"

import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Save, X, Users, GraduationCap, CreditCard, Building, Calendar, User, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useSchoolStore } from '@/store';
import type { 
  Student, 
  Registration, 
  Payment, 
  Transaction, 
  Tutor, 
  Pricing, 
  AssignmentType, 
  AcademicYear, 
  Level, 
  Classe,
  Installment,
  PaymentMethod
} from '@/lib/interface';

interface TutorWithPivot extends Tutor {
    pivot: {
      tutor_id: number;
      student_id: number;
      is_tutor_legal: 0 | 1;
      created_at: string;
      updated_at: string;
    };
  }

interface SearchResult extends Student {
  registrations: Registration[];
  payments: Payment[];
  transactions: Transaction[];
  tutors: TutorWithPivot[];
  availablePricing: Pricing[];
}

interface EditingPayment extends Payment {
  isEditing?: boolean;
  tempMethods?: Array<{ id: number; montant: string }>;
}

interface EditingRegistration extends Registration {
  isEditing?: boolean;
}

interface PaymentMethodWithAmount extends PaymentMethod {
  amount: string;
}

const StudentMaintenancePage: React.FC = () => {
  const {
    students,
    registrations,
    payments,
    transactions,
    tutors,
    pricing,
    assignmentTypes,
    academicYears,
    levels,
    classes,
    methodPayment,
    installements,
    setStudents,
    setPayments,
    setRegistration
  } = useSchoolStore();

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingPayments, setEditingPayments] = useState<EditingPayment[]>([]);
  const [editingRegistrations, setEditingRegistrations] = useState<EditingRegistration[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [allPricing, setAllPricing] = useState<Pricing[]>([]);

  // Charger toutes les données nécessaires
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Charger tous les pricing avec leurs installments
        const pricingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pricing`);
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          setAllPricing(pricingData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données de tarification',
          color: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Fonction de recherche d'étudiants
  const searchStudents = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results = students.filter(student => 
      student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(student => {
      const studentRegistrations = registrations.filter(reg => reg.student_id === student.id);
      const studentPayments = payments.filter(payment => payment.student_id === student.id);
      const studentTransactions = transactions.filter(transaction => 
        studentPayments.some(payment => payment.transaction_id === transaction.id)
      );
      const studentTutors = tutors.filter(tutor => 
        tutor.students?.some(s => s.id === student.id)
      );
      
      // Trouver les pricing disponibles basés sur les inscriptions
      const availablePricing = pricing.filter(p => {
        return studentRegistrations.some(reg => 
          p.assignment_type_id === student.assignment_type_id &&
          p.academic_years_id === reg.academic_year_id &&
          p.level_id === reg.classe?.level_id
        );
      });

      return {
        ...student,
        registrations: studentRegistrations,
        payments: studentPayments,
        transactions: studentTransactions,
        tutors: studentTutors,
        availablePricing
      };
    });

    setSearchResults(results as SearchResult[]);
  };

  // Sélectionner un étudiant
  const selectStudent = (student: SearchResult) => {
    setSelectedStudent(student);
    setEditingPayments(student.payments.map(p => ({ 
      ...p, 
      isEditing: false,
      tempMethods: p.payment_methods.map(pm => ({
        id: pm.id,
        montant: pm.pivot.montant
      }))
    })));
    setEditingRegistrations(student.registrations.map(r => ({ ...r, isEditing: false })));
    setEditingStudent({ ...student });
  };

  // Modifier le type d'assignation de l'étudiant
  const updateStudentAssignmentType = async (newAssignmentTypeId: number) => {
    if (!selectedStudent) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/${selectedStudent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedStudent,
          assignment_type_id: newAssignmentTypeId
        })
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        setEditingStudent(prev => prev ? { ...prev, assignment_type_id: newAssignmentTypeId } : null);
        
        // Mettre à jour le store
        setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s));
        
        toast({
          title: 'Succès',
          description: 'Type d\'assignation mis à jour avec succès'
        });
        
        // Actualiser les résultats de recherche
        searchStudents();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le type d\'assignation',
        color: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier un paiement
  const updatePayment = async (paymentId: number, updatedData: {
    amount?: string;
    installment_id?: number;
    methods?: Array<{ id: number; montant: string }>;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          methods: updatedData.methods || []
        })
      });

      if (response.ok) {
        const updatedPayment = await response.json();
        
        // Mettre à jour l'état local
        setEditingPayments(prev => 
          prev.map(p => p.id === paymentId ? { ...updatedPayment, isEditing: false } : p)
        );
        
        // Mettre à jour le store
        setPayments(payments.map(p => p.id === paymentId ? updatedPayment : p));
        
        toast({
          title: 'Succès',
          description: 'Paiement mis à jour avec succès'
        });
      } else {
        throw new Error('Erreur lors de la mise à jour du paiement');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le paiement',
        color: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un paiement
  const deletePayment = async (paymentId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/${paymentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setEditingPayments(prev => prev.filter(p => p.id !== paymentId));
        
        // Mettre à jour le store
        setPayments(payments.filter(p => p.id !== paymentId));
        
        toast({
          title: 'Succès',
          description: 'Paiement supprimé avec succès'
        });
      } else {
        throw new Error('Erreur lors de la suppression du paiement');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du paiement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le paiement',
        color: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier une inscription
  const updateRegistration = async (registrationId: number, updatedData: Partial<Registration>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedRegistration = await response.json();
        
        setEditingRegistrations(prev => 
          prev.map(r => r.id === registrationId ? { ...updatedRegistration, isEditing: false } : r)
        );
        
        // Mettre à jour le store
        setRegistration(registrations.map(r => r.id === registrationId ? updatedRegistration : r));
        
        toast({
          title: 'Succès',
          description: 'Inscription mise à jour avec succès'
        });
      } else {
        throw new Error('Erreur lors de la mise à jour de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'inscription:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'inscription',
        color: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer une inscription
  const deleteRegistration = async (registrationId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/registration/${registrationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setEditingRegistrations(prev => prev.filter(r => r.id !== registrationId));
        
        // Mettre à jour le store
        setRegistration(registrations.filter(r => r.id !== registrationId));
        
        toast({
          title: 'Succès',
          description: 'Inscription supprimée avec succès'
        });
      } else {
        throw new Error('Erreur lors de la suppression de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'inscription:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'inscription',
        color: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PaymentEditForm: React.FC<{ 
    payment: EditingPayment; 
    onSave: (paymentId: number, data: any) => void; 
    onCancel: () => void;
  }> = ({ payment, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      amount: payment.amount,
      installment_id: payment.installment_id,
      methods: payment.tempMethods || payment.payment_methods.map(pm => ({
        id: pm.id,
        montant: pm.pivot.montant
      }))
    });

    const addPaymentMethod = () => {
      setFormData(prev => ({
        ...prev,
        methods: [...prev.methods, { id: methodPayment[0]?.id || 0, montant: '0' }]
      }));
    };

    const removePaymentMethod = (index: number) => {
      setFormData(prev => ({
        ...prev,
        methods: prev.methods.filter((_, i) => i !== index)
      }));
    };

    const updatePaymentMethod = (index: number, field: 'id' | 'montant', value: string | number) => {
      const newMethods = [...formData.methods];
      newMethods[index] = { ...newMethods[index], [field]: value };
      setFormData(prev => ({ ...prev, methods: newMethods }));
    };

    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Montant</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Installment</label>
            <Select
              value={formData.installment_id.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, installment_id: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un installment" />
              </SelectTrigger>
              <SelectContent>
                {installements.map(installment => (
                  <SelectItem key={installment.id} value={installment.id.toString()}>
                    {installment.amount_due} FCFA - {installment.due_date} (ID: {installment.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Méthodes de paiement</label>
            <Button type="button" size="sm" onClick={addPaymentMethod}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {formData.methods.map((method, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Select
                  value={method.id.toString()}
                  onValueChange={(value) => updatePaymentMethod(index, 'id', parseInt(value))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {methodPayment.map(pm => (
                      <SelectItem key={pm.id} value={pm.id.toString()}>
                        {pm.name} (ID: {pm.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Montant"
                  value={method.montant}
                  onChange={(e) => updatePaymentMethod(index, 'montant', e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removePaymentMethod(index)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onSave(payment.id, formData)}
            disabled={isLoading}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
        </div>
      </div>
    );
  };

  const RegistrationEditForm: React.FC<{ 
    registration: EditingRegistration; 
    onSave: (registrationId: number, data: any) => void; 
    onCancel: () => void;
  }> = ({ registration, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      class_id: registration.class_id,
      academic_year_id: registration.academic_year_id,
      discount_percentage: registration.discount_percentage || '',
      discount_amount: registration.discount_amount || '',
      pricing_id: registration.pricing_id || ''
    });

    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Classe</label>
            <Select
              value={formData.class_id.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map(classe => (
                  <SelectItem key={classe.id} value={classe.id.toString()}>
                    {classe.label} (ID: {classe.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Année académique</label>
            <Select
              value={formData.academic_year_id.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={year.id.toString()}>
                    {year.label} (ID: {year.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Pricing</label>
            <Select
              value={formData.pricing_id?.toString() || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, pricing_id: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un pricing" />
              </SelectTrigger>
              <SelectContent>
                {selectedStudent?.availablePricing.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.label} - {p.amount} FCFA (ID: {p.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Remise (%)</label>
            <Input
              type="number"
              value={formData.discount_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Remise (montant)</label>
            <Input
              type="number"
              value={formData.discount_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onSave(registration.id, formData)}
            disabled={isLoading}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Page de Maintenance Étudiants
          </h1>
          <p className="text-gray-600">
            Recherchez et gérez les informations complètes des étudiants
          </p>
        </div>

        {/* Recherche */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Recherche d'étudiants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher par matricule, nom ou prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
              />
              <Button onClick={searchStudents} disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultats de recherche */}
        {searchResults.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Résultats de recherche ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => selectStudent(student)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge color="secondary">{student.registration_number}</Badge>
                          <h3 className="font-semibold">
                            {student.name} {student.first_name}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>ID: {student.id}</p>
                          <p>Statut: {student.status}</p>
                          <p>Inscriptions: {student.registrations.length}</p>
                          <p>Paiements: {student.payments.length}</p>
                        </div>
                      </div>
                      <Button size="sm">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Détails de l'étudiant sélectionné */}
        {selectedStudent && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Détails de {selectedStudent.name} {selectedStudent.first_name}
                </div>
                <Badge>{selectedStudent.registration_number}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="registrations">Inscriptions</TabsTrigger>
                  <TabsTrigger value="payments">Paiements</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="tutors">Parents</TabsTrigger>
                  <TabsTrigger value="pricing">Tarifications</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Type d'assignation</label>
                      <Select
                        value={editingStudent?.assignment_type_id.toString()}
                        onValueChange={(value) => updateStudentAssignmentType(parseInt(value))}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assignmentTypes.map(type => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.label} (ID: {type.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p><strong>ID:</strong> {selectedStudent.id}</p>
                      <p><strong>Date de naissance:</strong> {selectedStudent.birth_date}</p>
                      <p><strong>Sexe:</strong> {selectedStudent.sexe}</p>
                      <p><strong>Statut:</strong> {selectedStudent.status}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="registrations" className="space-y-4">
                  <h3 className="text-lg font-semibold">Inscriptions ({editingRegistrations.length})</h3>
                  {editingRegistrations
                    .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
                    .map((registration) => (
                    <div key={registration.id} className="border rounded-lg p-4">
                      {registration.isEditing ? (
                        <RegistrationEditForm
                          registration={registration}
                          onSave={updateRegistration}
                          onCancel={() => setEditingRegistrations(prev => 
                            prev.map(r => r.id === registration.id ? { ...r, isEditing: false } : r)
                          )}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">ID: {registration.id}</Badge>
                              <Badge>{registration.classe.label}</Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <p><strong>Année académique:</strong> {registration.academic_year.label}</p>
                              <p><strong>Date d'inscription:</strong> {registration.registration_date}</p>
                              <p><strong>Classe ID:</strong> {registration.class_id}</p>
                              <p><strong>Academic Year ID:</strong> {registration.academic_year_id}</p>
                              <p><strong>Pricing ID:</strong> {registration.pricing_id || 'Non défini'}</p>
                              {registration.discount_percentage && (
                                <p><strong>Remise (%):</strong> {registration.discount_percentage}%</p>
                              )}
                              {registration.discount_amount && (
                                <p><strong>Remise (montant):</strong> {registration.discount_amount} FCFA</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setEditingRegistrations(prev => 
                                prev.map(r => r.id === registration.id ? { ...r, isEditing: true } : r)
                              )}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              color="destructive"
                              onClick={() => deleteRegistration(registration.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <h3 className="text-lg font-semibold">Paiements ({editingPayments.length})</h3>
                  {editingPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      {payment.isEditing ? (
                        <PaymentEditForm
                          payment={payment}
                          onSave={updatePayment}
                          onCancel={() => setEditingPayments(prev => 
                            prev.map(p => p.id === payment.id ? { ...p, isEditing: false } : p)
                          )}
                        />
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">ID: {payment.id}</Badge>
                              <Badge color="secondary">{payment.amount} FCFA</Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <p><strong>Date:</strong> {payment.created_at}</p>
                              <p><strong>Caissier ID:</strong> {payment.cashier_id}</p>
                              <p><strong>Transaction ID:</strong> {payment.transaction_id || 'Non défini'}</p>
                              <p><strong>Installment ID:</strong> {payment.installment_id}</p>
                              <div>
                                <strong>Méthodes de paiement:</strong>
                                {payment.payment_methods.map((method) => (
                                  <div key={method.id} className="ml-4">
                                    - {method.name} (ID: {method.id}): {method.pivot.montant} FCFA
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setEditingPayments(prev => 
                                prev.map(p => p.id === payment.id ? { ...p, isEditing: true } : p)
                              )}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              color="destructive"
                              onClick={() => deletePayment(payment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                  <h3 className="text-lg font-semibold">Transactions ({selectedStudent.transactions.length})</h3>
                  {selectedStudent.transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ID: {transaction.id}</Badge>
                        <Badge>{transaction.total_amount} FCFA</Badge>
                        <Badge color="secondary">{transaction.transaction_type}</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Date:</strong> {transaction.transaction_date}</p>
                        <p><strong>Utilisateur ID:</strong> {transaction.user_id}</p>
                        <p><strong>Session de caisse ID:</strong> {transaction.cash_register_session_id}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="tutors" className="space-y-4">
                  <h3 className="text-lg font-semibold">Parents/Tuteurs ({selectedStudent.tutors.length})</h3>
                  {selectedStudent.tutors.map((tutor) => (
                    <div key={tutor.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ID: {tutor.id}</Badge>
                        <h4 className="font-medium">{tutor.name} {tutor.first_name}</h4>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Téléphone:</strong> {tutor.phone_number}</p>
                        <p><strong>Sexe:</strong> {tutor.sexe}</p>
                        <p><strong>Type:</strong> {tutor.type_tutor}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <h3 className="text-lg font-semibold">Tarifications disponibles ({selectedStudent.availablePricing.length})</h3>
                  {selectedStudent.availablePricing.map((pricingItem) => (
                    <div key={pricingItem.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ID: {pricingItem.id}</Badge>
                        <h4 className="font-medium">{pricingItem.label}</h4>
                        <Badge>{pricingItem.amount} FCFA</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Type d'assignation:</strong> {pricingItem.assignment_type.label} (ID: {pricingItem.assignment_type_id})</p>
                        <p><strong>Année académique:</strong> {pricingItem.academic_year.label} (ID: {pricingItem.academic_years_id})</p>
                        <p><strong>Niveau:</strong> {pricingItem.level.label} (ID: {pricingItem.level_id})</p>
                        <p><strong>Type de frais:</strong> {pricingItem.fee_type.label} (ID: {pricingItem.fee_type_id})</p>
                      </div>
                      
                      {/* Installments */}
                      {pricingItem.installments && pricingItem.installments.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Échéanciers:</h5>
                          <div className="space-y-2">
                            {pricingItem.installments.map((installment) => (
                              <div key={installment.id} className="pl-4 border-l-2 border-gray-200">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">ID: {installment.id}</Badge>
                                  <span>{installment.amount_due} FCFA</span>
                                  <Badge color={installment.status === 'paid' ? 'default' : 'secondary'}>
                                    {installment.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">Échéance: {installment.due_date}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Tableau de tous les pricing avec installments */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Tous les Pricing avec Échéanciers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Type Assignation</TableHead>
                    <TableHead>Année Académique</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Type Frais</TableHead>
                    <TableHead>Échéanciers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPricing.map((pricingItem) => (
                    <TableRow key={pricingItem.id}>
                      <TableCell className="font-medium">{pricingItem.id}</TableCell>
                      <TableCell>{pricingItem.label}</TableCell>
                      <TableCell>{pricingItem.amount} FCFA</TableCell>
                      <TableCell>
                        {pricingItem.assignment_type?.label} (ID: {pricingItem.assignment_type_id})
                      </TableCell>
                      <TableCell>
                        {pricingItem.academic_year?.label} (ID: {pricingItem.academic_years_id})
                      </TableCell>
                      <TableCell>
                        {pricingItem.level?.label} (ID: {pricingItem.level_id})
                      </TableCell>
                      <TableCell>
                        {pricingItem.fee_type?.label} (ID: {pricingItem.fee_type_id})
                      </TableCell>
                      <TableCell>
                        {pricingItem.installments && pricingItem.installments.length > 0 ? (
                          <div className="space-y-1">
                            {pricingItem.installments.map((installment) => (
                              <div key={installment.id} className="text-xs">
                                <div className="flex items-center gap-1">
                                  <span>ID: {installment.id}</span>
                                  <span>{installment.amount_due} FCFA</span>
                                  <Badge color={installment.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                                    {installment.status}
                                  </Badge>
                                </div>
                                <div>Échéance: {installment.due_date}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Aucun échéancier</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentMaintenancePage;