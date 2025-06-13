"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/store";
import { toast } from "react-hot-toast";
import { useEmailVerification } from "./fonction";


interface VerificationModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  emailData: {
    currentEmail: string;
    newEmail: string;
  } | null;
}

export function VerificationModal({
  isOpen,
  onCloseAction,
  emailData,
}: VerificationModalProps) {
  const totalOtpField = 6;
  const otpArray: string[] = Array.from({ length: totalOtpField }, () => "");
  const [otp, setOtp] = React.useState<string[]>(otpArray);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [showResendModal, setShowResendModal] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const otpFields = Array.from({ length: totalOtpField }, (_, index) => index);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { CodeOTP, setCodeOTP, userOnline , setUserOnline } = useSchoolStore();

  // Utilisation du hook pour le renvoi d'OTP
  const { onSubmit: resendOtp , codeOTP: newCodeOTP  } = useEmailVerification();

    // Synchroniser le codeOTP du store avec celui du hook
    React.useEffect(() => {
      if (newCodeOTP) {
        setCodeOTP(newCodeOTP);
      }
    }, [newCodeOTP, setCodeOTP]);

  // Gestion du compte à rebours
  React.useEffect(() => {
    if (CodeOTP?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiresAt = new Date(CodeOTP.expiresAt);
        const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
        
        if (diff <= 0) {
          clearInterval(interval);
          setCountdown(0);
        } else {
          setCountdown(diff);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [CodeOTP]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!isNaN(Number(value)) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value.length === 1 && index < totalOtpField - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      setOtp(prevOtp => {
        const newOtp = [...prevOtp];
        newOtp[index - 1] = "";
        return newOtp;
      });
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < totalOtpField - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!emailData) return;
    
    setIsSubmitting(true);
    const enteredOtp = otp.join("");

    try {
      if (!CodeOTP) {
        toast.error("Aucun code trouvé. Veuillez recommencer la procédure.");
        return;
      }

      const { otp: storedOtp, expiresAt } = CodeOTP;
      const isExpired = new Date() > new Date(expiresAt);

      if (isExpired) {
        toast.error("Le code a expiré. Veuillez en demander un nouveau.");
        return;
      }

      if (enteredOtp !== String(storedOtp)) {
        toast.error("Code incorrect. Veuillez réessayer.");
        return;
      }

      const res = await fetch(`/api/user?id=${userOnline?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userOnline?.name,
          email: emailData.newEmail
        }),
      });

      if (res.ok) {
        toast.success("Email mis à jour avec succès !");
        if (userOnline) {
          setUserOnline({ ...userOnline, email: emailData.newEmail });
        }
  

        setCodeOTP(null);
        router.push("/profil");
        onCloseAction();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!emailData?.newEmail) {
      toast.error("Aucun email trouvé pour renvoyer le code");
      return;
    }

    setIsResending(true);
    setShowResendModal(false);

    try {
      // Utilisation du hook pour renvoyer l'OTP
      await resendOtp({
        currentEmail: emailData.currentEmail,
        newEmail: emailData.newEmail
      });

      setOtp(otpArray);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Erreur envoi OTP:", error);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Vérification du code</DialogTitle>
          <DialogDescription className="text-center">
            Un code de vérification a été envoyé à{" "}
            <span className="font-semibold">{emailData?.newEmail}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message pour vérifier les spams */}
          <div className="text-sm text-center text-yellow-600 bg-yellow-50 p-2 rounded">
            <p>Si vous ne trouvez pas l'email, vérifiez votre dossier spam/courrier indésirable.</p>
          </div>

          {countdown !== null && countdown > 0 && (
            <div className="text-sm text-center text-default-500">
              Code valide pendant: {formatCountdown(countdown)}
            </div>
          )}

          {countdown === 0 && (
            <div className="text-sm text-center text-red-500">
              Le code a expiré. Veuillez en demander un nouveau.
            </div>
          )}

          {/* Conteneur amélioré pour les inputs OTP */}
          <div className="flex justify-center gap-2">
            {otpFields.map((index) => (
              <Input
                key={`otp-code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id={`otp${index}`}
                name={`otp${index}`}
                value={otp[index]}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onFocus={(e) => e.target.select()}
                maxLength={1}
                className="w-12 h-14 text-center text-2xl font-medium focus-visible:ring-2 focus-visible:ring-primary"
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                disabled={isSubmitting}
              />
            ))}
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleVerify}
            disabled={!isOtpComplete || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Confirmer la modification"
            )}
          </Button>

          <div className="text-center text-sm text-default-500">
            Vous n'avez pas reçu de code?{" "}
            <button 
              className="text-skyblue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              onClick={() => setShowResendModal(true)}
              disabled={isResending}
            >
              {isResending ? "Envoi en cours..." : "Renvoyer le code"}
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Modal de confirmation pour renvoi OTP */}
      <Dialog open={showResendModal} onOpenChange={setShowResendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le renvoi du code</DialogTitle>
            <DialogDescription>
              Un nouveau code de vérification sera envoyé à l'adresse : 
              <span className="font-semibold"> {emailData?.newEmail}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowResendModal(false)}
              disabled={isResending}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}