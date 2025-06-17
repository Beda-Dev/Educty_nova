"use client"

import type React from "react"

import { useState, useRef } from "react"
import ReactToPrint from "react-to-print"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Receipt } from "./receipt"
import type { Payment, Student, Transaction } from "@/lib/interface"
import { Printer, Download, Share2 } from "lucide-react"

interface PrintReceiptProps {
  transaction: Transaction
  payments: Payment[]
  student: Student
  trigger?: React.ReactNode
  onPrint?: () => void
}

export function PrintReceipt({ transaction, payments, student, trigger, onPrint }: PrintReceiptProps) {
  const [open, setOpen] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    // Utiliser l'API Web Share si disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reçu de paiement - ${student.first_name} ${student.name}`,
          text: `Reçu de paiement pour ${student.first_name} ${student.name} d'un montant de ${payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0,
          )} FCFA`,
        })
      } catch (error) {
        console.error("Erreur lors du partage:", error)
      }
    } else {
      // Fallback si l'API Web Share n'est pas disponible
      alert("Le partage n'est pas disponible sur ce navigateur.")
    }
  }

  const handleDownloadPDF = () => {
    // Cette fonction pourrait être implémentée avec jsPDF ou une autre bibliothèque
    // Pour l'instant, on utilise l'impression comme alternative
    if (receiptRef.current) {
      window.print()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimer le reçu
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du reçu</DialogTitle>
          </DialogHeader>
          {/* <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <Receipt ref={receiptRef} transaction={transaction} payments={payments} student={student} />
          </div> */}
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
            <ReactToPrint
              trigger={() => (
                <Button className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
              )}
              content={() => receiptRef.current}
              documentTitle={`Reçu-${transaction.id}-${student.registration_number}`}
              onAfterPrint={onPrint}
              pageStyle={`
                @page {
                  size: A4;
                  margin: 0;
                }
                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                }
              `}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
