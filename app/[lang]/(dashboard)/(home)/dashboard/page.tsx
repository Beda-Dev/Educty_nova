import { getDictionary } from "@/app/dictionaries";
import DashbordView from "./page-view";

interface DashboardProps {
  params: {
    lang: any;
  };
}
const Page = async ({ params: { lang } }: DashboardProps) => {
  const trans = await getDictionary(lang);
  return <DashbordView trans={trans} />;
};

export default Page;
