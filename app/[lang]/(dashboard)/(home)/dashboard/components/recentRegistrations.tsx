"use client";

import Image from "next/image";
import { Fragment } from "react";
import { Registration, AcademicYear } from "@/lib/interface";

interface Props {
  inscriptions: Registration[];
  academicYear: AcademicYear;
};

const RecentInscription = ({ inscriptions, academicYear }: Props) => {
  // Filtrer les inscriptions pour ne garder que celles de l'année académique fournie
  const filteredInscriptions = inscriptions
    .filter((inscription) => inscription.academic_year_id === academicYear.id)
    .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
    .slice(0, 10); // Garder les 10 dernières inscriptions

  return (
    <Fragment>
      {filteredInscriptions.map((item, index) => (
        <li
          className="flex justify-between items-center gap-2 border-b border-default-300 py-3 px-6 hover:bg-default-50"
          key={`top-sell-${item.id}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-200">
              {item.student.photo ? (
                <Image
                  src={typeof item.student.photo === 'string' ? `${process.env.NEXT_PUBLIC_API_BASE_URL_2}/${item.student.photo}` : ''}
                  alt={item.student.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover rounded-md"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                  {item.student.name.charAt(0).toUpperCase()} {item.student.first_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-default-700">
                {item.student.first_name} {item.student.name}
              </span>
              <span className="text-xs font-medium text-default-600">
                {item.classe.label}
              </span>
            </div>
          </div>
          <span className="text-xs text-default-600">
            {new Date(item.registration_date).toLocaleDateString()}
          </span>
        </li>
      ))}
    </Fragment>
  );
};

export default RecentInscription;
