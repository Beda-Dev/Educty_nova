"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeEvent, KeyboardEvent, useRef, useState, useEffect, startTransition } from "react";
import LogoComponent1 from "@/app/[lang]/logo1";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSchoolStore } from "@/store";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const VerfiyForm = () => {
  const { CodeOTP, setCodeOTP } = useSchoolStore();
  const totalOtpField = 6;
  const otpArray: string[] = Array.from({ length: totalOtpField }, () => "");
  const [otp, setOtp] = useState<string[]>(otpArray);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpFields = Array.from({ length: totalOtpField }, (_, index) => index);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const router = useRouter();

  // Gestion du compte à rebours
  useEffect(() => {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
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

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const enteredOtp = otp.join("");

    try {
      if (!CodeOTP) {
        toast.error("Aucun code trouvé. Veuillez recommencer la procédure.");
        return;
      }

      const { otp: storedOtp, email, expiresAt } = CodeOTP;
      const isExpired = new Date() > new Date(expiresAt);

      if (isExpired) {
        toast.error("Le code a expiré. Veuillez en demander un nouveau.");
        return;
      }

      if (enteredOtp !== String(storedOtp)) {
        toast.error("Code incorrect. Veuillez réessayer.");
        return;
      }

      toast.success("Code correct ! Redirection en cours...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCodeOTP(null)
      router.push("/create-password");
      
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (!CodeOTP?.email) {
      toast.error("Aucun email trouvé pour renvoyer le code");
      return;
    }

    setIsResending(true);
    setShowResendModal(false);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: CodeOTP.email }),
      });

      const result = await res.json();

      if (res.ok) {
        const expiration = new Date(Date.now() + 20 * 60 * 1000); // 20 min
        const otpData = {
          otp: result.otp as number,
          email: CodeOTP.email as string,
          expiresAt: expiration.toISOString(),
        };
        
        setCodeOTP(otpData);
        setOtp(otpArray);
        inputRefs.current[0]?.focus();
        toast.success("Un nouveau code a été envoyé à votre adresse e-mail");
      } else {
        toast.error(result.message || "Erreur lors de l'envoi du code");
      }
    } catch (error) {
      console.error("Erreur envoi OTP:", error);
      toast.error("Erreur réseau, veuillez réessayer");
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
    <div className="w-full md:w-[480px] py-5">
      <Link href="/dashboard" className="inline-block">
        <LogoComponent1 width={40} height={40} className="2xl:h-14 2xl:w-14 text-primary" />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Vérification à deux facteurs
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Entrez le code de confirmation à 6 chiffres envoyé par e-mail
      </div>

      {countdown !== null && countdown > 0 && (
        <div className="mt-2 text-sm text-default-500">
          Code valide pendant: {formatCountdown(countdown)}
        </div>
      )}

      {countdown === 0 && (
        <div className="mt-2 text-sm text-red-500">
          Le code a expiré. Veuillez en demander un nouveau.
        </div>
      )}

      <form className="mt-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="flex flex-wrap gap-1 lg:gap-6 justify-center">
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
              className="w-10 h-10 sm:w-[60px] sm:h-16 rounded border-default-300 text-center text-2xl font-medium text-default-900 focus-visible:ring-2 focus-visible:ring-primary"
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              disabled={isSubmitting}
            />
          ))}
        </div>
        <div className="mt-6">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isOtpComplete || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier maintenant"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center text-sm text-default-500">
        Vous n'avez pas reçu de code?{" "}
        <button 
          className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          onClick={() => setShowResendModal(true)}
          disabled={isResending}
        >
          {isResending ? "Envoi en cours..." : "Renvoyer le code"}
        </button>
      </div>

      {/* Modal de confirmation pour renvoi OTP */}
      <Dialog open={showResendModal} onOpenChange={setShowResendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le renvoi du code</DialogTitle>
            <DialogDescription>
              Un nouveau code de vérification sera envoyé à l'adresse : 
              <span className="font-semibold"> {CodeOTP?.email}</span>
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
              onClick={resendOtp}
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
    </div>
  );
};

export default VerfiyForm;