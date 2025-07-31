"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchoolStore } from '@/store';
import {
  fetchRegistration,
  fetchCorrespondencesBooks,
  fetchCorrespondencesEntries,
  fetchAcademicYears
} from '@/store/schoolservice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Separator,
} from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarDays,
  MessageSquare,
  Plus,
  User,
  School,
  BookOpen,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Loading from "@/app/[lang]/loading"
import { fetchCorrespondenceBooks } from '@/lib/fonction';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CorrespondenceEntryForm {
  message_type: string;
  content: string;
  correspondence_book_id: number;
}

const CorrespondenceBookPage = () => {
  const form = useForm<CorrespondenceEntryForm>({
    defaultValues: {
      message_type: '',
      content: '',
      correspondence_book_id: 0
    }
  });

  const {
    registrations,
    correspondencesBooks,
    correspondencesEntries,
    academicYears,
    academicYearCurrent,
    setRegistration,
    setCorrespondencesBooks,
    setCorrespondencesEntries,
    setAcademicYears,
    levels
  } = useSchoolStore();

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(
    academicYearCurrent?.id || 0
  );
  const [selectedRegistration, setSelectedRegistration] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentInfoOpen, setIsStudentInfoOpen] = useState(true);
  const [isSchoolInfoOpen, setIsSchoolInfoOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date function
  const formatDate = (dateString: string, withTime = false) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit' })
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [registrationsData, correspondenceBooksData, correspondenceEntriesData, academicYearsData] = await Promise.all([
          fetchRegistration(),
          fetchCorrespondencesBooks(),
          fetchCorrespondencesEntries(),
          fetchAcademicYears()
        ]);

        setRegistration(registrationsData);
        setCorrespondencesBooks(correspondenceBooksData);
        setCorrespondencesEntries(correspondenceEntriesData);
        setAcademicYears(academicYearsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données. Vérifiez votre connexion.",
          color: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);




  // Filter registrations based on selected academic year and search query
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(
      (registration) => registration.academic_year_id === selectedAcademicYear
    );
  }, [registrations, selectedAcademicYear]);

  // Get selected registration data
  const selectedRegistrationData = useMemo(() => {
    return filteredRegistrations.find(reg => reg.id.toString() === selectedRegistration);
  }, [filteredRegistrations, selectedRegistration]);

  // Get student's correspondence book
  const studentCorrespondenceBook = useMemo(() => {
    if (!selectedRegistrationData) return null;
    return correspondencesBooks.find(book => book.registration_id === selectedRegistrationData.id);
  }, [correspondencesBooks, selectedRegistrationData]);

  // Get correspondence entries, sorted by date
  const correspondenceEntries = useMemo(() => {
    if (!studentCorrespondenceBook) return [];
    return correspondencesEntries
      .filter(entry => entry.correspondence_book_id === studentCorrespondenceBook.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [correspondencesEntries, studentCorrespondenceBook]);

  // Statistics
  const statistics = useMemo(() => {
    const total = correspondenceEntries.length;
    const messageTypes = correspondenceEntries.reduce((acc, entry) => {
      acc[entry.message_type] = (acc[entry.message_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thisMonth = correspondenceEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      messageTypes,
      thisMonth
    };
  }, [correspondenceEntries]);

  useEffect(() => {
    if (selectedRegistration && selectedRegistrationData) {
      setSearchQuery(
        `${selectedRegistrationData.student.name} ${selectedRegistrationData.student.first_name} (${selectedRegistrationData.classe.label})`
      );
    }
  }, [selectedRegistration, selectedRegistrationData]);

  // Submit new entry
  const onSubmit: SubmitHandler<CorrespondenceEntryForm> = async (data) => {
    setIsSubmitting(true);
    let correspondenceBookId: number;

    if (!studentCorrespondenceBook) {
      if (!selectedRegistrationData) {
        toast({
          title: "Erreur",
          description: "Aucun élève sélectionné.",
          color: "destructive",
        });
        return;
      }

      // Create new correspondence book
      const newCorrespondenceBook = await fetchCorrespondenceBooks(selectedRegistrationData.id);

      if (!newCorrespondenceBook || !newCorrespondenceBook.id) {
        toast({
          title: "Erreur",
          description: "Impossible de créer un nouveau carnet de correspondance.",
          color: "destructive",
        });
        return;
      }

      // Update store with new book
      setCorrespondencesBooks([...correspondencesBooks, newCorrespondenceBook]);
      correspondenceBookId = newCorrespondenceBook.id;
    } else {
      correspondenceBookId = studentCorrespondenceBook.id;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/correspondence-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          correspondence_book_id: correspondenceBookId
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setCorrespondencesEntries([...correspondencesEntries, newEntry]);
        form.reset();
        setIsDialogOpen(false);
        toast({
          title: "Succès",
          description: "L'entrée a été ajoutée avec succès.",
        });
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'entrée. Veuillez réessayer.",
        color: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get message type color
  const getMessageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Information': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'Avertissement': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'Félicitations': 'bg-green-100 text-green-800 hover:bg-green-200',
      'Remarque': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      'Sanction': 'bg-red-100 text-red-800 hover:bg-red-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <CardHeader>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Carnet de Correspondance</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Consultez et gérez les communications avec les familles
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </motion.div>
      </CardHeader>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Année Académique</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedAcademicYear.toString()}
              onValueChange={(value) => {
                setSelectedAcademicYear(parseInt(value));
                setSelectedRegistration('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une année" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id.toString()}>
                    {year.label} {year.isCurrent ? '(Actuelle)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Élève</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isDropdownOpen) setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Rechercher un élève par nom ou matricule"
                className="w-full"
              />
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {filteredRegistrations
                    .filter(registration => {
                      const searchLower = searchQuery.toLowerCase();
                      const studentName = `${registration.student.name} ${registration.student.first_name}`.toLowerCase();
                      const registrationNumber = registration.student.registration_number?.toLowerCase() || '';
                      return studentName.includes(searchLower) ||
                        registrationNumber.includes(searchLower) ||
                        registration.classe.label.toLowerCase().includes(searchLower);
                    })
                    .map((registration) => (
                      <div
                        key={registration.id}
                        role="button"
                        tabIndex={0}
                        className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${selectedRegistration === registration.id.toString() ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                        onClick={() => {
                          // console.log("CLICK SUR :", registration); // ← À garder pour vérifier
                          setSelectedRegistration(registration.id.toString());
                          setSearchQuery(`${registration.student.name} ${registration.student.first_name} (${registration.classe.label})`);
                          setIsDropdownOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setSelectedRegistration(registration.id.toString());
                            setSearchQuery(`${registration.student.name} ${registration.student.first_name} (${registration.classe.label})`);
                            setIsDropdownOpen(false);
                          }
                        }}
                      >
                        <div className="font-medium">
                          {registration.student.name} {registration.student.first_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {registration.classe.label} • {registration.student.registration_number}
                        </div>
                      </div>
                    ))}
                  {filteredRegistrations.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Aucun élève trouvé
                    </div>
                  )}
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info message */}
      {!selectedRegistration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="flex items-center p-4">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <p className="text-blue-800 dark:text-blue-200">
                Sélectionnez un élève pour consulter son carnet de correspondance
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main content */}
      {selectedRegistrationData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Student information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal info */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Collapsible
                  open={isStudentInfoOpen}
                  onOpenChange={setIsStudentInfoOpen}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between space-x-4">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations Personnelles
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        {isStudentInfoOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom complet</p>
                        <p className="text-base dark:text-white">
                          {selectedRegistrationData.student.name} {selectedRegistrationData.student.first_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">N° Matricule</p>
                        <p className="text-base dark:text-white">{selectedRegistrationData.student.registration_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de naissance</p>
                        <p className="text-base dark:text-white">
                          {formatDate(selectedRegistrationData.student.birth_date, false)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexe</p>
                        <p className="text-base dark:text-white">{selectedRegistrationData.student.sexe}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</p>
                        <Badge
                          color={selectedRegistrationData.student.status === 'actif' ? 'success' : 'destructive'}
                          className="mt-1"
                        >
                          {selectedRegistrationData.student.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* School info */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Collapsible
                  open={isSchoolInfoOpen}
                  onOpenChange={setIsSchoolInfoOpen}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between space-x-4">
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5" />
                      Informations Scolaires
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        {isSchoolInfoOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Classe</p>
                        <p className="text-base dark:text-white">{selectedRegistrationData.classe.label}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Niveau</p>
                        <p className="text-base dark:text-white">{selectedRegistrationData.classe.level_id ? levels.find((level) => Number(level.id) === Number(selectedRegistrationData.classe.level_id))?.label : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Année académique</p>
                        <p className="text-base dark:text-white">{selectedRegistrationData.academic_year.label}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date d'inscription</p>
                        <p className="text-base dark:text-white">
                          {formatDate(selectedRegistrationData.created_at, true)}
                        </p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>

            {/* Statistics */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Collapsible
                  open={isStatsOpen}
                  onOpenChange={setIsStatsOpen}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between space-x-4">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Statistiques
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 p-0">
                        {isStatsOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Total d'entrées</span>
                        <Badge variant="outline">{statistics.total}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Ce mois</span>
                        <Badge variant="outline">{statistics.thisMonth}</Badge>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Types de messages</p>
                        {Object.entries(statistics.messageTypes).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center py-1">
                            <span className="text-sm dark:text-gray-300">{type}</span>
                            <Badge variant="outline" className="text-xs">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>
          </div>

          {/* Correspondence book */}
          <div className="lg:col-span-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Carnet de Correspondance
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Historique des communications - {correspondenceEntries.length} entrée(s)
                    </CardDescription>
                  </div>

                  {/* Add entry button */}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button color='indigodye'>
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvelle entrée
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Ajouter une nouvelle entrée</DialogTitle>
                        <DialogDescription className="dark:text-gray-400">
                          Créez une nouvelle entrée dans le carnet de correspondance de l'élève
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="message_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type de message</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className='z-[9999]' >
                                    <SelectItem value="Information">Information</SelectItem>
                                    <SelectItem value="Avertissement">Avertissement</SelectItem>
                                    <SelectItem value="Félicitations">Félicitations</SelectItem>
                                    <SelectItem value="Remarque">Remarque</SelectItem>
                                    <SelectItem value="Sanction">Sanction</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contenu du message</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Saisissez le contenu du message..."
                                    className="min-h-[150px] text-black dark:text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter >
                            <div className="flex justify-around w-full" >


                              <Button
                                color='destructive'
                                type="button"
                                onClick={() => setIsDialogOpen(false)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                Annuler
                              </Button>
                              <Button
                                color='indigodye'
                                type="submit"
                                disabled={isSubmitting}
                                className="min-w-[100px]"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Ajout...
                                  </>
                                ) : 'Ajouter'}
                              </Button>
                            </div>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent>
                {correspondenceEntries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune entrée dans le carnet de correspondance</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Cliquez sur "Nouvelle entrée" pour commencer
                    </p>
                  </motion.div>
                ) : (
                  <ScrollArea className="h-[600px] pr-4">
                    <AnimatePresence>
                      {correspondenceEntries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors mb-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    className={`${getMessageTypeColor(entry.message_type)} cursor-help`}
                                  >
                                    {entry.message_type}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Type de message</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(entry.created_at, true)}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {entry.content}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default CorrespondenceBookPage;