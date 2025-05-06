import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

// Configuration SMTP
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SENDER_NAME = process.env.NAME || "Educty";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";

if (!SMTP_USER || !SMTP_PASS) {
  throw new Error("Les identifiants SMTP ne sont pas configurés");
}

// Schéma de validation pour la requête
const requestSchema = z.object({
  email: z.string().email(),
  CodeOtp: z.string().min(4),
  message: z.string().optional(),
});

async function sendEmailWithNodemailer(email: string, otp: string, message?: string) {
  // Création du transporteur SMTP
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Options de l'email
  const mailOptions = {
    from: `"${SMTP_SENDER_NAME}" <${SMTP_USER}>`,
    to: email,
    subject: "Votre code de vérification",
    html: `
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

  // Envoi de l'email
  const info = await transporter.sendMail(mailOptions);
  return info;
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

    // Envoi via Nodemailer
    const info = await sendEmailWithNodemailer(email, CodeOtp, message);

    return NextResponse.json({
      success: true,
      message: `Code envoyé à ${email}`,
      info: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      }
    });

  } catch (err) {
    console.error("Erreur:", err);

    // Gestion des erreurs spécifiques à Nodemailer
    if (err instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Erreur lors de l'envoi de l'email",
          details: err.message 
        }, 
        { status: 500 }
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
