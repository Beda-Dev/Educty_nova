"use client";

import Image from "next/image";
import LogInForm from "./login-form";
import auth3Light from "@/public/images/auth/auth3-light.png";
import auth3Dark from "@/public/images/auth/auth3-dark.png";
import { Icon } from "@iconify/react";
import background from "@/public/images/auth/line.png";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Fragment, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LogoComponent from "./logo";
import { motion } from "framer-motion";

const LoginPage = () => {
  return (
    <Fragment>
      <div className="min-h-screen bg-whitesmoke  flex items-center  overflow-hidden w-full">
        <div className="min-h-screen basis-full flex flex-wrap w-full  justify-center overflow-y-auto">
          <div
            className="basis-1/2  w-full  relative hidden xl:flex justify-center items-center bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#1e40af] 
         "
          >
            {/* <Image
              src={background}
              alt="image"
              className="absolute top-0 left-0 w-full h-full "
            /> */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className=" relative hidden xl:flex justify-center items-center"
            >
              <LogoComponent />
            </motion.div>
          </div>

          <div className=" bg-whitesmoke min-h-screen basis-full md:basis-1/2 w-full px-4 py-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="bg-whitesmoke min-h-screen basis-full md:basis-1/2 w-full px-4 py-5 flex justify-center items-center"
            >
              <div className="lg:w-[480px] bg-whitesmoke ">
                <LogInForm />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginPage;
