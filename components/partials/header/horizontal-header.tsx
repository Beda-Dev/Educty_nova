import React from "react";
import { Search } from "lucide-react";
import LogoComponent1 from "@/app/[lang]/logo1";
import Link from "next/link";
const horizontalHeader: React.FC<{ handleOpenSearch: () => void }> = ({ handleOpenSearch }) => {
  return (
    <div className="flex items-center lg:gap-12 gap-3 ">
      <div>
        <Link
          href="/dashboard"
          className=" text-skyblue flex items-center gap-2"
        >
          <LogoComponent1 width={28} height={28} />
          <span className=" text-xl font-semibold lg:inline-block hidden">
            {" "}
            Educty Nova
          </span>
        </Link>
      </div>
      <button
        onClick={handleOpenSearch}
        className=" inline-flex lg:gap-2 lg:mr-0 mr-2 items-center text-default-600 text-sm"
      >
        <span>
          <Search className=" h-4 w-4" />
        </span>
        <span className=" lg:inline-block hidden"> Recherche...</span>
      </button>
    </div>
  );
};

export default horizontalHeader;
