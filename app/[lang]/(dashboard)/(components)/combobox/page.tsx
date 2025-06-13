import Card from "@/components/ui/card-snippet";
import BasicCombobox from "./basic-combobox"
import { basicComboBox } from "./source-code"
const ComboBoxPage = () => {
  return (
    <Card title="Combobox" code={basicComboBox}>
      <p className="text-sm text-default-400 dark:text-default-600  mb-4">
        In the <code className="text-skyblue">Combobox </code> component
        <code className="text-skyblue"> Command </code> and{" "}
        <code className="text-skyblue">Popover </code> component used together
        to make a combobox.
      </p>
      <div className="max-w-md">
        <BasicCombobox />
      </div>
    </Card>
  );
};

export default ComboBoxPage;
