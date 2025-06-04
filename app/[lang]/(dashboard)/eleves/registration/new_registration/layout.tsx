"use client"
import { RegistrationReset } from "@/components/registration/registration-reset";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <><RegistrationReset />{children}</>;
};

export default Layout;
