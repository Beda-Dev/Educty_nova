import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

export default function ControlledSelectData({
  datas,
  onSelect,
  placeholder,
  defaultValue,
}: {
  datas: any[];
  onSelect: (id: number) => void;
  placeholder: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState<string>(defaultValue?.toString() || "");

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue.toString());
      onSelect(defaultValue);
    }
  }, [defaultValue, onSelect]);

  return (
    <Select
      value={value}
      onValueChange={(val) => {
        setValue(val);
        onSelect(Number(val));
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {datas.map((item) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.label || item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}