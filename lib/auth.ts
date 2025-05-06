
export type OTPPayload = {
    email: string;
    otp: string;
    expiresAt: Date;
    message: string;
  };
  
  export function generateOTP(email: string): OTPPayload {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // expire dans 20 min
    const message = `Bonjour,\n\nVotre code de verification est : ${otp}\nIl est valide pendant 20 minutes.\n\nL'équipe DIGIFAZ.`;
    // console.log(`Envoi du code ${otp} à ${email} :\n${message}`);
  
    return { email, otp, expiresAt, message };
  }
  