"use client";

import { useEffect, useState } from "react";
import { useSchoolStore } from "@/store";
import { Student, Registration } from "@/lib/interface";
import { Card } from "@/components/ui/card";
import Loading from "../loading";
import ResumeFinancie from "./componant";
import { fetchRegistration , fetchStudents } from "@/store/schoolservice";

interface OverviewProps {
  params: {
    id: string;
  };
}

const ResumeFinancieView = ({ params }: OverviewProps) => {
  const {
    students,
    registrations,
    setStudents,
    setRegistration,
  } = useSchoolStore();

  const { id } = params;
  const [rEgistration, setREgistration] = useState<Registration | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const update = async() => {
    fetchRegistration().then((reg) => {
        setRegistration(reg);
      });
      fetchStudents().then((students) => {
        setStudents(students);
      });
    
  }

  useEffect(() => {
    setLoading(true);
    update()

    const reg = registrations.find((r) => Number(r.id) === Number(id));
    const stu = reg ? students.find((s) => s.id === reg.student_id) : null;

    setREgistration(reg ?? null);
    setStudent(stu ?? null);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Card>
        <Loading />
      </Card>
    );
  }

  if (!rEgistration || !student) {
    return (
      <Card className="p-4 text-center text-sm text-red-500">
        Données introuvables pour cet élève.
      </Card>
    );
  }

  return (
    <Card>
      <ResumeFinancie studentRegistration={rEgistration} student={student} />
    </Card>
  );
};

export default ResumeFinancieView;
