import { getDictionary } from "@/app/dictionaries";
import Dashboard from "./test"

interface DashboardProps {
  params: {
    lang: any;
  };
}
const Page = async ({ params: { lang } }: DashboardProps) => {
  const trans = await getDictionary(lang);
  return <Dashboard trans={trans} />;
};

export default Page;
