import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";

const layout = async ({ children, params: { lang } }: { children: React.ReactNode; params: { lang: any } }) => {


 // if (!session?.user?.email) {
 //   redirect("/");
 // }

  const trans = await getDictionary(lang);

  return (
    <DashBoardLayoutProvider trans={trans}>{children}</DashBoardLayoutProvider>
  );
};

export default layout;
