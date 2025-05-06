import { NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";

// Configuration de l'API Brevo
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "no-reply@votredomaine.com";
const NAME = process.env.BREVO_SENDER_NAME || "Educty";

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY n'est pas configurée");
}

// Schéma de validation pour la requête
const requestSchema = z.object({
  email: z.string().email(),
  CodeOtp: z.string().min(4),
  message: z.string().optional(),
});

async function sendEmailWithBrevo(email: string, otp: string, message?: string) {
  const brevoEndpoint = "https://api.brevo.com/v3/smtp/email";

  const emailData = {
    sender: {
      name: NAME,
      email: BREVO_SENDER_EMAIL,
    },
    to: [{ email }],
    subject: "Votre code de vérification",
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .otp-code { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #2563eb;
                  margin: 20px 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Votre code de vérification</h2>
              ${message ? `<p>${message}</p>` : ''}
              <div class="otp-code">${otp}</div>
              <p>Ce code expirera dans 20 minutes.</p>
              <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
          </div>
      </body>
      </html>
    `,
  };

  const response = await axios.post(brevoEndpoint, emailData, {
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
  });

  return response.data;
}

export async function POST(req: Request) {
  // Vérification du Content-Type
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { success: false, message: "Content-Type must be application/json" },
      { status: 415 }
    );
  }

  try {
    // Validation du corps de la requête
    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Données invalides",
          errors: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, CodeOtp, message } = validation.data;

    // Envoi via Brevo
    await sendEmailWithBrevo(email, CodeOtp, message);

    return NextResponse.json({
      success: true,
      message: `Code envoyé à ${email}`,
    });

  } catch (err) {
    console.error("Erreur:", err);

    // Gestion des erreurs spécifiques à Axios
    if (axios.isAxiosError(err)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Erreur lors de l'envoi de l'email",
          details: err.response?.data || err.message 
        }, 
        { status: err.response?.status || 500 }
      );
    }

    // Gestion des autres erreurs
    return NextResponse.json(
      { 
        success: false, 
        message: "Une erreur est survenue" 
      },
      { status: 500 }
    );
  }
}