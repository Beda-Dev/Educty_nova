"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Card from "@/components/ui/card-snippet";
import DatePickerForm from "./date-picker";
import { columns, ColumnProps } from "./data";
import { AcademicYear } from "@/lib/interface";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import EditModal from "./edit-modal";
import { useSchoolStore } from "@/store";
import { verificationPermission } from "@/lib/fonction";
import ErrorPage from "@/app/[lang]/non-Autoriser";

interface Props {
  data: AcademicYear[];
}

const AcademicYearPage = ({ data }: Props) => {
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userOnline } = useSchoolStore();
  const permissionRequisCreer = ["creer annee_Academique"];
  const permissionRequisSupprimer = ["supprimer annee_Academique"];
  const permissionRequisModifier = ["modifier annee_Academique"];
  const permissionRequisVoir = ["voir annee_Academique"];

  const hasAdminAccessVoir = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisVoir
  );

  const hasAdminAccessCreer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisCreer
  );
  const hasAdminAccessModifier = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisModifier
  );
  const hasAdminAccessSupprimer = verificationPermission(
    { permissionNames: userOnline?.permissionNames || [] },
    permissionRequisSupprimer
  );

  const handleUpdate = () => {
    setIsModalOpen(false);
  };

  const filteredData = data.filter((item) => item.active === 1);

  if (hasAdminAccessVoir === false) {
    return (
      <Card>
        <ErrorPage />
      </Card>
    );
  }

  return (
    <div
      className={`grid grid-cols-1  ${
        hasAdminAccessCreer ? ` md:grid-cols-[2fr_1fr]` : ` md:grid-cols-1`
      }  gap-5 text`}
    >
      {hasAdminAccessCreer ? (
        <div className="bg-transparent p-2 h-[300px] rounded-sm w-[90%] mx-auto text-center items-center justify-center text-sm order-1 md:order-2  ">
          <Card title="Créer une année académique">
            <DatePickerForm />
          </Card>
        </div>
      ) : null}
      
      <div className="order-2 md:order-1" >
      <Card title="Année académique">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column: ColumnProps) => (
                <TableHead key={`simple-table-${column.key}`}>
                  {column.label}
                </TableHead>
              ))}
              {hasAdminAccessModifier ? <TableHead>Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item: AcademicYear) => (
              <TableRow key={item.id}>
                <TableCell>{item.label}</TableCell>
                <TableCell>{item.start_date}</TableCell>
                <TableCell>{item.end_date}</TableCell>
                <TableCell>
                  {item.isCurrent === 1 ? (
                    <span className="text-green-500 font-medium">Actif</span>
                  ) : (
                    <span className="text-red-500 font-medium">Inactif</span>
                  )}
                </TableCell>
                {hasAdminAccessModifier ? (
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedYear(item);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      </div>

      {selectedYear && (
        <EditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          academicYear={selectedYear}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default AcademicYearPage;
