"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AcademicYear } from "@/lib/interface";

interface Data {
  id: number;
  label?: string; 
  year?: string; 
  slug?: string;
  active: number;
  created_at: string;
  updated_at: string;
}

interface ControlledSelectProps {
  datas: Data[] | AcademicYear[];
  onSelect: (id: number | null) => void;
  placeholder?: string;
  defaultValue?: number | null; // Nouvelle prop pour la valeur par défaut
}

const ControlledSelectData: React.FC<ControlledSelectProps> = ({
  datas,
  onSelect,
  placeholder = "Sélectionnez un niveau",
  defaultValue = null, // Valeur par défaut en props
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(defaultValue);
  const [defaultValueSet, setDefaultValueSet] = useState(false);

  // Trouver l'élément correspondant à la valeur par défaut
  const defaultItem = datas.find(item => item.id === defaultValue);

  // Valeur par défaut pour le Select
  const selectDefaultValue = defaultItem 
    ? ("year" in defaultItem ? defaultItem.year! : defaultItem.label!)
    : undefined;

  useEffect(() => {
    if (defaultValue && !defaultValueSet && datas.length > 0) {
      const defaultItem = datas.find(item => item.id === defaultValue);
      if (defaultItem) {
        setSelectedId(defaultItem.id);
        onSelect(defaultItem.id);
        setDefaultValueSet(true);
      }
    }
  }, [defaultValue, datas, onSelect, defaultValueSet]);

  const handleValueChange = (value: string) => {
    const selectedItem = datas.find((data) =>
      "year" in data ? String(data.year) === value : data.label === value
    );
    setSelectedId(selectedItem ? selectedItem.id : null);
    onSelect(selectedItem ? selectedItem.id : null);
  };
  
  return (
    <div>
      <Select 
        onValueChange={handleValueChange}
        value={selectedId !== null ? selectDefaultValue : undefined}
        defaultValue={selectDefaultValue}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          {datas.map((data) => (
            <SelectItem
              key={data.id}
              value={"year" in data ? data.year! : data.label!}
            >
              {"year" in data ? data.year : data.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ControlledSelectData;