import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

// Configuration SMTP et environnement
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SENDER_NAME = process.env.NAME || "Educty";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_PASSWORD;

if (!SMTP_USER || !SMTP_PASS || !DEFAULT_PASSWORD) {
  throw new Error("Variables d'environnement SMTP ou mot de passe par défaut non configurées.");
}

// Schéma de validation pour la requête
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Fonction d'envoi d'email via Nodemailer
async function sendAccountInfoEmail(name: string, email: string) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

const htmlContent = `
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Bienvenue sur Educty</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .header img {
          height: 50px;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px 20px;
          color: #333333;
        }
        .content h2 {
          color: #2563eb;
        }
        .info {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
          font-size: 15px;
        }
        .info li {
          margin-bottom: 8px;
        }
        .footer {
          padding: 15px;
          font-size: 13px;
          text-align: center;
          color: #888;
          background-color: #f4f4f4;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          
          <h1>Bienvenue sur ${SMTP_SENDER_NAME}</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${name},</h2>
          <p>Votre compte a été créé avec succès sur notre plateforme.</p>
          <p>Voici vos informations de connexion :</p>
          <ul class="info">
            <li><strong>Email :</strong> ${email}</li>
            <li><strong>Mot de passe :</strong> ${DEFAULT_PASSWORD}</li>
          </ul>
          <p style="margin-top: 20px;">
            Veuillez vous connecter et modifier votre mot de passe dès que possible pour sécuriser votre compte.
          </p>
          <p>— L’équipe ${SMTP_SENDER_NAME}</p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} ${SMTP_SENDER_NAME}. Tous droits réservés.
        </div>
      </div>
    </body>
  </html>
`;


  const mailOptions = {
    from: `"${SMTP_SENDER_NAME}" <${SMTP_USER}>`,
    to: email,
    subject: "Vos identifiants de connexion",
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

// API Route POST
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { success: false, message: "Content-Type must be application/json" },
      { status: 415 }
    );
  }

  try {
    const body = await req.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Données invalides", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email } = validation.data;

    const info = await sendAccountInfoEmail(name, email);

    return NextResponse.json({
      success: true,
      message: `Email envoyé à ${email}`,
      info: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    });

  } catch (err) {
    console.error("Erreur:", err);

    if (err instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors de l'envoi de l'email",
          details: err.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
