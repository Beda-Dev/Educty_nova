// Modal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog"; // ou ton propre composant de modale

export function ModalWithAnimation({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog onOpenChange={onClose} open={open}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-xl"
          >
            {children}
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
