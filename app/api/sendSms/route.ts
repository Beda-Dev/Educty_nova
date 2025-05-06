// app/api/sendSms/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { phoneNumber, message, sender, smsType } = await request.json();

    // Validation
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, error: "Numéro et message requis" },
        { status: 400 }
      );
    }

    // Formatage du numéro
    const formattedNumber = formatIvorianNumber(phoneNumber);

    // Configuration de l'API Brevo
    const brevoUrl = "https://api.brevo.com/v3/transactionalSMS/sms";
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY || "",
    };

    // Options SMS
    const smsData = {
      sender: sender || "Educty",
      recipient: formattedNumber,
      content: message,
      type: smsType || "transactional",
    };

    // Envoi du SMS via Axios
    const response = await axios.post(brevoUrl, smsData, { headers });

    return NextResponse.json({
      success: true,
      data: {
        messageId: response.data.messageId,
        numberUsed: formattedNumber,
      },
    });
  } catch (error: any) {
    console.error("Erreur Brevo:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Erreur lors de l'envoi du SMS";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper pour formater les numéros ivoiriens (10 chiffres après 225)
function formatIvorianNumber(phoneNumber: string): string {
  // Supprimer tous les caractères non numériques
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Vérification du format 225XXXXXXXX (10 chiffres au total)
  if (/^225\d{10}$/.test(cleaned)) {
    return cleaned;
  }

  // Si 8 chiffres seulement (sans 225)
  if (/^\d{10}$/.test(cleaned)) {
    return `225${cleaned}`;
  }

  // Si format international +225XXXXXXXX
  if (/^\+225\d{10}$/.test(phoneNumber)) {
    return phoneNumber.replace("+", "");
  }

  throw new Error(
    "Format de numéro invalide. Doit être 225XXXXXXXX ou +225XXXXXXXX"
  );
}
