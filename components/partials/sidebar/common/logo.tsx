import LogoComponent1 from "@/app/[lang]/logo1";
import { useSidebar } from "@/store";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const SidebarLogo = ({ hovered }: { hovered?: boolean }) => {
  const { sidebarType, setCollapsed, collapsed } = useSidebar();

  return (
    <div className="px-4 py-4">
      <div className="flex items-center">
        <div className="flex flex-1 items-center gap-x-3">
          {/* Animation du logo */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <LogoComponent1 width={32} height={32} />
          </motion.div>

          {/* Animation du texte avec couleurs spécifiques */}
          <AnimatePresence>
            {(!collapsed || hovered) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 text-xl font-semibold"
              >
                <span className="text-skyblue">Edu</span>
                <span className="text-bittersweet">cty</span>
                <span className="text-tyrian"> Nova</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Animation du bouton de collapse */}
        {sidebarType === "classic" && (!collapsed || hovered) && (
          <motion.div
            className="flex-none lg:block hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              onClick={() => setCollapsed(!collapsed)}
              className={`h-4 w-4 border-[1.5px] border-default-900 dark:border-default-200 rounded-full transition-all duration-150 ${
                collapsed
                  ? ""
                  : "ring-2 ring-inset ring-offset-4 ring-default-900 bg-default-900 dark:ring-offset-default-300"
              }`}
              animate={{
                rotate: collapsed ? 0 : 180,
                backgroundColor: collapsed
                  ? "transparent"
                  : "var(--default-900)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;
