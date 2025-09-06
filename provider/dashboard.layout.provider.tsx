"use client";
import React from "react";
import Header from "@/components/partials/header";
import Sidebar from "@/components/partials/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar, useThemeStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Footer from "@/components/partials/footer";
import { useMediaQuery } from "@/hooks/use-media-query";
import MobileSidebar from "@/components/partials/sidebar/mobile-sidebar";
import HeaderSearch from "@/components/header-search";
import { useMounted } from "@/hooks/use-mounted";
import LayoutLoader from "@/components/layout-loader";
import { useSchoolStore } from "@/store";
import { CashRegisterSession } from '@/lib/interface'
import { getCurrentUser , saveUser } from "@/lib/userStore";
import { useSessionManager } from "@/hooks/useSessionManager";
import { FULL_ACCESS_ROLES_LOWERCASE } from "@/app/[lang]/(dashboard)/caisse_comptabilite/RoleFullAcess";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

const DashBoardLayoutProvider = ({ children, trans }: { children: React.ReactNode, trans: any }) => {
  const { userOnline, cashRegisterSessions, setCashRegisterSessionCurrent , setUserOnline , settings } = useSchoolStore()
  const { collapsed, sidebarType, setCollapsed, subMenu } = useSidebar();
  const [open, setOpen] = React.useState(false);
  const [showBlockedSessionModal, setShowBlockedSessionModal] = React.useState(false);
  const [currentSession, setCurrentSession] = React.useState<CashRegisterSession | null>(null);
  const { layout } = useThemeStore();
  const location = usePathname();
  const isMobile = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();
  const router = useRouter();
  const { logout, checkSession } = useSessionManager();
  const time = Number(process.env.NEXT_PUBLIC_SESSION_DURATION_MINUTES) || 60;
  const minutesToMs = (minutes: number): number => minutes * 60 * 1000;

  React.useEffect(() => {
    const initializeUser = async () => {
      if (!userOnline) {
        const user = await getCurrentUser();
        if (user) {
          setUserOnline(user);
        } else {
          router.push("/");
        }
      }
    };

    initializeUser();
  }, [userOnline, setUserOnline, router]);

  React.useEffect(() => {
    const checkCashRegisterSession = () => {
      if (cashRegisterSessions?.length && userOnline) {
        const session = cashRegisterSessions.find(
          (session: CashRegisterSession) =>
            session.user_id === userOnline.id && session.status === "open"
        );
        setCashRegisterSessionCurrent(session ?? null);
        setCurrentSession(session ?? null);
      }
    };

    checkCashRegisterSession();
  }, [cashRegisterSessions, userOnline, setCashRegisterSessionCurrent]);

  // Vérification de la session bloquée
  React.useEffect(() => {
    const checkBlockedSession = () => {
      // Ne pas afficher la modale si on est déjà sur la page de fermeture
      if (location.includes("close-session")) {
        setShowBlockedSessionModal(false);
        return;
      }

      if (currentSession && currentSession.is_blocked === 1 && userOnline) {
        // Vérifier si l'utilisateur n'a pas un rôle avec accès complet
        const userRoles = userOnline.roles?.map(role => role.name.toLowerCase()) || [];
        const hasFullAccess = userRoles.some(role => FULL_ACCESS_ROLES_LOWERCASE.includes(role));
        
        if (!hasFullAccess) {
          setShowBlockedSessionModal(true);
        }
      } else {
        setShowBlockedSessionModal(false);
      }
    };

    checkBlockedSession();
  }, [currentSession, userOnline, location]);

  const handleCloseSession = () => {
    if (currentSession) {
      router.push(`/caisse_comptabilite/close-session/${currentSession.id}`);
      setShowBlockedSessionModal(false);
    }
  };

  const getClosureTime = () => {
    return settings && settings[0]?.session_closure_time ? settings[0].session_closure_time : "17:00";
  };

  if (!mounted) {
    return <LayoutLoader />;
  }

  if (layout === "semibox") {
    return (
      <>
        <Header handleOpenSearch={() => setOpen(true)} trans={trans} />
        <Sidebar trans={trans} />

        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
            "ltr:xl:ml-[272px] rtl:xl:mr-[272px]": !collapsed,
          })}
        >
          <div
            className={cn(
              "pt-6 pb-8 px-4  page-min-height-semibox ",

            )}
          >
            <div className="semibox-content-wrapper ">
              <LayoutWrapper
                isMobile={isMobile}
                setOpen={setOpen}
                open={open}
                location={location}
                trans={trans}
              >
                {children}
              </LayoutWrapper>
            </div>
          </div>
        </div>
        <Footer handleOpenSearch={() => setOpen(true)} />

        {/* Modale de session bloquée */}
        <BlockedSessionModal
          isOpen={showBlockedSessionModal}
          onClose={handleCloseSession}
          closureTime={getClosureTime()}
        />
      </>
    );
  }
  if (layout === "horizontal") {
    return (
      <>
        <Header handleOpenSearch={() => setOpen(true)} trans={trans} />

        <div className={cn("content-wrapper transition-all duration-150 ")}>
          <div
            className={cn(
              "  pt-6 px-6 pb-8  page-min-height-horizontal ",
              {}
            )}
          >
            <LayoutWrapper
              isMobile={isMobile}
              setOpen={setOpen}
              open={open}
              location={location}
              trans={trans}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        <Footer handleOpenSearch={() => setOpen(true)} />

        {/* Modale de session bloquée */}
        <BlockedSessionModal
          isOpen={showBlockedSessionModal}
          onClose={handleCloseSession}
          closureTime={getClosureTime()}
        />
      </>
    );
  }

  if (sidebarType !== "module") {
    return (
      <>
        <Header handleOpenSearch={() => setOpen(true)} trans={trans} />
        <Sidebar trans={trans} />

        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[248px] rtl:xl:mr-[248px] ": !collapsed,
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
          })}
        >
          <div
            className={cn(
              "  pt-6 px-6 pb-8  page-min-height ",
              {}
            )}
          >
            <LayoutWrapper
              isMobile={isMobile}
              setOpen={setOpen}
              open={open}
              location={location}
              trans={trans}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        <Footer handleOpenSearch={() => setOpen(true)} />

        {/* Modale de session bloquée */}
        <BlockedSessionModal
          isOpen={showBlockedSessionModal}
          onClose={handleCloseSession}
          closureTime={getClosureTime()}
        />
      </>
    );
  }
  return (
    <>
      <Header handleOpenSearch={() => setOpen(true)} trans={trans} />
      <Sidebar trans={trans} />

      <div
        className={cn("content-wrapper transition-all duration-150 ", {
          "ltr:xl:ml-[300px] rtl:xl:mr-[300px]": !collapsed,
          "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
        })}
      >
        <div
          className={cn(
            " layout-padding px-6 pt-6  page-min-height ",

          )}
        >
          <LayoutWrapper
            isMobile={isMobile}
            setOpen={setOpen}
            open={open}
            location={location}
            trans={trans}
          >
            {children}
          </LayoutWrapper>
        </div>
      </div>
      <Footer handleOpenSearch={() => setOpen(true)} />

      {/* Modale de session bloquée */}
      <BlockedSessionModal
        isOpen={showBlockedSessionModal}
        onClose={handleCloseSession}
        closureTime={getClosureTime()}
      />
    </>
  );
};

export default DashBoardLayoutProvider;

const LayoutWrapper = ({ children, isMobile, setOpen, open, location, trans }: { children: React.ReactNode, isMobile: boolean, setOpen: any, open: boolean, location: any, trans: any }) => {
  return (
    <>
      <motion.div
        key={location}
        initial="pageInitial"
        animate="pageAnimate"
        exit="pageExit"
        variants={{
          pageInitial: {
            opacity: 0,
            y: 50,
          },
          pageAnimate: {
            opacity: 1,
            y: 0,
          },
          pageExit: {
            opacity: 0,
            y: -50,
          },
        }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.5,
        }}
      >
        <main>{children}</main>
      </motion.div>

      <MobileSidebar trans={trans} className="left-[300px]" />
      <HeaderSearch open={open} setOpen={setOpen} />
    </>
  );
};

// Composant pour la modale de session bloquée
const BlockedSessionModal = ({ 
  isOpen, 
  onClose, 
  closureTime 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  closureTime: string; 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Session de caisse bloquée
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Session non fermée à temps</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Votre dernière session de caisse ouverte n'a pas été fermée avant l'heure limite ({closureTime}).
                </p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Conséquence :</strong> La session a été automatiquement bloquée par le système pour des raisons de sécurité.
              </p>
            </div>
            <p className="text-xs">
              Vous devez entrer le montant final et fermer cette session pour continuer à utiliser l'application.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            onClick={onClose}
            className="w-full sm:w-auto justify-center"
            variant='outline'
          >
            <Clock className="h-4 w-4 mr-2" />
            Fermer la session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};