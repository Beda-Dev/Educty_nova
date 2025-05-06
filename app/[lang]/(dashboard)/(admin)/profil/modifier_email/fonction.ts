import { toast } from 'react-hot-toast';
import { startTransition } from 'react';
import { generateOTP } from "@/lib/auth";
import { useState } from "react";

// Définir les types
type EmailData = {
  currentEmail: string;
  newEmail: string;
};

type OTPData = {
  otp: number;
  email: string;
  expiresAt: string;
};

type FormData = {
  currentEmail: string;
  newEmail: string;
};

type SendEmailParams = {
  email: string;
  CodeOtp: string;
  message: string;
};

// Fonction pour envoyer l'email
const sendVerificationEmail = async (params: SendEmailParams): Promise<boolean> => {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || "Erreur lors de l'envoi du code");
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

// Fonction principale onSubmit
export const useEmailVerification = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [codeOTP, setCodeOTP] = useState<OTPData | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      // Validation personnalisée
      const isCustomValid = await validateCustomRules();

      // Example definition of validateCustomRules
      async function validateCustomRules(): Promise<boolean> {
        // Add your custom validation logic here
        return true; // Return true if valid, false otherwise
      }
      if (!isCustomValid) return;

      await handleEmailVerification(data);
    } catch (error) {
      console.error("Erreur dans onSubmit:", error);
      toast.error("Une erreur est survenue, veuillez réessayer");
    }
  };

  const handleEmailVerification = async (data: FormData) => {
    startTransition(async () => {
      try {
        const otp = generateOTP(data.newEmail);
        
        // Préparer les données OTP
        prepareOtpData(otp, data.newEmail);
        
        // Envoyer l'email de vérification
        await sendVerificationEmail({
          email: data.newEmail,
          CodeOtp: otp.otp.toString(),
          message: otp.message
        });

        // Gérer le succès
        handleVerificationSuccess(data);
      } catch (error) {
        handleVerificationError(error);
      }
    });
  };

  const prepareOtpData = (otp: ReturnType<typeof generateOTP>, email: string) => {
    setCodeOTP({
      otp: Number(otp.otp),
      email,
      expiresAt: otp.expiresAt.toISOString(),
    });
  };

  const handleVerificationSuccess = (data: FormData) => {
    setEmailData({
      currentEmail: data.currentEmail,
      newEmail: data.newEmail,
    });
    setIsModalOpen(true);
    toast.success("Code de vérification envoyé à votre nouvel email");
  };

  const handleVerificationError = (error: unknown) => {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Erreur réseau, veuillez réessayer");
    }
  };

  return {
    onSubmit,
    isModalOpen,
    setIsModalOpen,
    emailData,
    codeOTP,
  };
};

// Exemple d'utilisation dans un composant :
/*
const { onSubmit, isModalOpen, setIsModalOpen, emailData, codeOTP } = useEmailVerification();
*/