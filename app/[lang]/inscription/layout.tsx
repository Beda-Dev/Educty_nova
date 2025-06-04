import { RegistrationReset } from "@/components/registration/registration-reset";

export default function InscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RegistrationReset />
      {children}
    </>
  );
}
