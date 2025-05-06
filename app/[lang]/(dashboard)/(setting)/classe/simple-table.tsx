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
import { Card } from "@/components/ui/card";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

interface ClassTableProps {
  data: Classe[];
}

const ClassTable: React.FC<ClassTableProps> = ({ data }) => {
  const [selectedClass, setSelectedClass] = useState<Classe | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const { setClasses , userOnline } = useSchoolStore();
  const router = useRouter();

  const permissionRequisVoir = ["voir classe"];
  const permissionRequisModifier = ["modifier classe"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
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

  if (hasAdminAccessVoir === false) {
    router.push("/dashboard");

  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Classe</TableHead>
            <TableHead>Nombre d'élèves</TableHead>
            <TableHead>Max élèves</TableHead>
            <TableHead>Niveau</TableHead>
            {hasAdminAccessModifier ? (<TableHead>Action</TableHead>): null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.label}</TableCell>
              <TableCell>{item.student_number}</TableCell>
              <TableCell>{item.max_student_number}</TableCell>
              <TableCell>{item.level?.label}</TableCell>
{hasAdminAccessModifier ? (              <TableCell className="ltr:pr-5 rtl:pl-5">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="p-2"
                  onClick={() => handleEditClick(item)}
                >
                  <Icon icon="heroicons:pencil" className="h-4 w-4" />
                </Button>
              </TableCell>): null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
