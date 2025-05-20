import Image from "next/image";
import { LogoImage } from "@/components/icons/index";
import type { HTMLAttributes } from "react";

type LogoComponentProps = {
  className?: string;
} & HTMLAttributes<HTMLImageElement>;

export default function LogoComponent({ className, ...props }: LogoComponentProps) {
  return (
    <Image
      src={LogoImage}
      alt="Logo"
      width={150}
      height={100}
      priority
      className={className}
      {...props}
    />
  );
}
