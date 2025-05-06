'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface EditDialogProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function EditDialog({ title, children, open, onOpenChangeAction }: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}