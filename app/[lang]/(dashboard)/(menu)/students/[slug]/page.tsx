"use client"

import { useEffect, useState } from "react"
import { useSchoolStore } from "@/store"
import { findStudentByMatricule, getCompleteStudentData, obtenirDonneesCompletesEtudiant , DonneesEtudiantFusionnees } from "./fonction"
import { Student , Registration } from "@/lib/interface"
import { Card } from "@/components/ui/card"
import Loading from "./loading"
import StudentProfile from "./student-profile"
import ProfileProgress from "./overview/profile-progress";
import UserInfo from "./overview/user-info";
import Portfolio from "./overview/portfolio";
import Skills from "./overview/skills";
import Connections from "./overview/connections";
import Teams from "./overview/teams";
import About from "./overview/about";
import RecentActivity from "./overview/recent-activity";
import Projects from "./overview/projects";
import Header from "./components/header";
import { useRouter } from "next/navigation";

interface OverviewProps {
  params: {
    slug: string
  }
}

const Studentview = ({ params }: OverviewProps) => {
  const {
    students,
    academicYearCurrent,
    pricing,
    registrations,
    installements,
    payments,
    documents
  } = useSchoolStore()

  const { slug } = params
  const [student, setStudent] = useState<Student | null>(null)
  const [dataPayment, setDataPayment] = useState<DonneesEtudiantFusionnees | null>(null)
  const [completeStudent, setCompleteStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [re, setre] = useState<Registration>()
  const router = useRouter()

  useEffect(() => {
    const currentStudent = findStudentByMatricule(slug, students)

    if (currentStudent) {
      setStudent(currentStudent)

      const paymentData = obtenirDonneesCompletesEtudiant(
        academicYearCurrent,
        registrations,
        pricing,
        students,
        installements,
        payments,
        currentStudent.registration_number
      )
      setDataPayment(paymentData)

      const completeStudentData = getCompleteStudentData(currentStudent, {
        students,
        registrations,
        documents,
        payments,
      })
      setCompleteStudent(completeStudentData || null)

      const registration = registrations.find((r) => r.student_id === currentStudent.id && r.academic_year_id === academicYearCurrent.id)
      if (registration) {
        setre(registration)
      }else {
        router.push(`/students`)
      }

    }

    setLoading(false)
  }, [slug, students, academicYearCurrent, registrations, pricing, installements, payments, documents])

  if (loading || !student || !completeStudent || !dataPayment) {
    return (
      <Card>
        <Loading />
      </Card>
    )
  }

  return (
    <Card>
      <StudentProfile data={completeStudent} pay={dataPayment} />
    </Card>
  )
}

export default Studentview
