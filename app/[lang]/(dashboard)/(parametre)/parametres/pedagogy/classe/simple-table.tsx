import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Classe } from "@/lib/interface";
import { Icon } from "@iconify/react";
import EditClassModal from "./modal-mod";
import { fetchClasses } from "@/store/schoolservice";
import { useSchoolStore } from "@/store";
import { useRouter } from "next/navigation";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import DialogForm from "./modal_form";

interface ClassTableProps {
  data: Classe[];
}

const ClassTable: React.FC<ClassTableProps> = ({ data }) => {
  const [selectedClass, setSelectedClass] = useState<Classe | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { setClasses, userOnline } = useSchoolStore();
  const router = useRouter();

  const permissionRequisVoir = ["voir classe"];
  const permissionRequisModifier = ["modifier classe"];
  const permissionRequisCreer = ["creer classe"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
  );

  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
  );

  const handleEditClick = (classe: Classe) => {
    setSelectedClass(classe);
    setIsEditOpen(true);
  };

  const onUpdate = async () => {
    const updatedClasses = await fetchClasses();
    if (updatedClasses) {
      setClasses(updatedClasses);
      router.refresh();
    }
  };

  const onClose = () => {
    setIsEditOpen(false);
  };


  const ITEMS_PER_PAGE = 10;

  // Tri décroissant par date de création
  const sortedData = [...data].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const filteredData = sortedData.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Classes</CardTitle>
            </div>
            <Badge variant="outline">
              {data.length} {data.length > 1 ? "classes" : "classe"}
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <Input
                placeholder="Rechercher une classe..."
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {true ? (
                <div className="flex flex-wrap items-center gap-4 mb-1">
                  <div className="flex-none">
                    <DialogForm />
                  </div>
                </div>
              ) : null}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Nombre d'élèves</TableHead>
                  <TableHead>Max élèves</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Série</TableHead>
                  {true && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody >
                {filteredData.length > 0 ? (
                  <AnimatePresence>
                    {paginatedData.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-primary/5 border-t border-muted-foreground/20 "
                      >
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.student_number}</TableCell>
                        <TableCell>{item.max_student_number}</TableCell>
                        <TableCell>{item.level?.label}</TableCell>
                        <TableCell>
                          {item.serie?.label ? item.serie.label : "-"}
                        </TableCell>
                        {true && (
                          <TableCell className="flex justify-end gap-2">
                            <Button
                              
                              size="icon"
                              onClick={() => router.push(`/parametres/pedagogy/classe/${item.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              
                              size="icon"
                              color="tyrian"
                              onClick={() => handleEditClick(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground h-24"
                    >
                      {searchTerm
                        ? "Aucune classe ne correspond à votre recherche."
                        : "Aucune classe enregistrée."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {filteredData.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={
                          currentPage === 1 ? undefined : handlePreviousPage
                        }
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : 0}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <Button
                        
                          variant={currentPage === i + 1 ? "outline" : "ghost"}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={
                          currentPage === totalPages
                            ? undefined
                            : handleNextPage
                        }
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : 0}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50 text-muted-foreground"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {selectedClass && isEditOpen && (
        <EditClassModal
          classData={selectedClass}
          onClose={onClose}
          onUpdate={onUpdate}
          onOpen={isEditOpen}
        />
      )}
    </>
  );
};

export default ClassTable;
