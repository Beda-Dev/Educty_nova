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


const DashBoardLayoutProvider = ({ children, trans }: { children: React.ReactNode, trans: any }) => {
  const { userOnline, cashRegisterSessions, setCashRegisterSessionCurrent , setUserOnline } = useSchoolStore()
  const { collapsed, sidebarType, setCollapsed, subMenu } = useSidebar();
  const [open, setOpen] = React.useState(false);
  const { layout } = useThemeStore();
  const location = usePathname();
  const isMobile = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();
  const router = useRouter();
  const time = Number(process.env.NEXT_PUBLIC_SESSION_DURATION_MINUTES) || 60;
  const minutesToMs = (minutes: number): number => minutes * 60 * 1000;


  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const checkUserAuth = async () => {
      
      if (userOnline){
        saveUser(userOnline);
      }

      if (!userOnline) {
        const user = await getCurrentUser(); 
  
        if (user) {
          setUserOnline(user); 
        } else {
          router.push("/"); 
        }
      }
    };
  
    const checkCashRegisterSession = () => {
      if (cashRegisterSessions?.length && userOnline) {
        const currentSession = cashRegisterSessions.find(
          (session: CashRegisterSession) =>
            session.user_id === userOnline.id && session.status === "open"
        );
        setCashRegisterSessionCurrent(currentSession ?? null);
      }
    };
  
    // 🔄 Boucle toutes les 60 minutes au moins
    intervalId = setInterval(() => {
      checkUserAuth();
      checkCashRegisterSession();
    }, minutesToMs(time)); 
  
    // Appel initial immédiat
    checkUserAuth();
    checkCashRegisterSession();
  
    // Nettoyage à la destruction du composant
    return () => {
      clearInterval(intervalId);
    };
  }, [cashRegisterSessions]);
  
  


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
