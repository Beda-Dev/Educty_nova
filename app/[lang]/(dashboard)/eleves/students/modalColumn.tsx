"use client";
import { useState, useEffect } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { ColumnItem } from "./ColumnItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileSpreadsheet, GripVertical, X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ColumnConfig {
  id: string;
  header: string;
  enabled: boolean;
}

export default function ExportModal({
  columns,
  isOpen,
  onExport,
  onCloseAction,
}: {
  columns: ColumnConfig[];
  isOpen: boolean;
  onExport: (selectedColumns: string[]) => void;
  onCloseAction: () => void;
}): JSX.Element {
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>(columns);
  const [selectedCount, setSelectedCount] = useState(0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalColumns((columns) => {
        const oldIndex = columns.findIndex((col) => col.id === active.id);
        const newIndex = columns.findIndex((col) => col.id === over.id);
        return arrayMove(columns, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    setLocalColumns(columns);
    setSelectedCount(columns.filter(col => col.enabled).length);
  }, [columns]);

  const toggleColumn = (id: string) => {
    setLocalColumns((cols) =>
      cols.map((col) =>
        col.id === id ? { ...col, enabled: !col.enabled } : col
      )
    );
    setSelectedCount(prev => localColumns.find(col => col.id === id)?.enabled ? prev - 1 : prev + 1);
  };

  const handleExport = () => {
    const selectedColumns = localColumns
      .filter((col) => col.enabled)
      .map((col) => col.id);
    onExport(selectedColumns);
    onCloseAction();
  };

  const toggleAllColumns = (enable: boolean) => {
    setLocalColumns(cols => cols.map(col => ({ ...col, enabled: enable })));
    setSelectedCount(enable ? localColumns.length : 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-skyblue" />
            <div>
              <DialogTitle>Configuration de l'export</DialogTitle>
              <DialogDescription>
                Sélectionnez et ordonnez les colonnes à inclure dans le fichier
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-1">
                {selectedCount} {selectedCount > 1 ? "colonnes" : "colonne"} sélectionnée{selectedCount > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="select-all" 
                checked={selectedCount === localColumns.length}
                onCheckedChange={(checked) => toggleAllColumns(checked)}
              />
              <Label htmlFor="select-all">
                {selectedCount === localColumns.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Label>
            </div>
          </div>

          <Card className="p-4 border rounded-lg">
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localColumns}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {localColumns.map((column) => (
                    <ColumnItem
                      key={column.id}
                      id={column.id}
                      label={column.header}
                      enabled={column.enabled}
                      onToggle={toggleColumn}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </Card>
          
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            <span>Glissez-déposez pour réorganiser les colonnes</span>
          </div>
        </div>
        
        <DialogFooter className="gap-4 sm:gap-0">
          <Button variant="outline"  className="m-2"   onClick={onCloseAction}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button onClick={handleExport} className="m-2" disabled={selectedCount === 0}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exporter ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};