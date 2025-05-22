import Image from "next/image";
import { LogoImage1 } from "@/components/icons/index1";
import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LogoComponentProps = {
  className?: string;
  width?: number;
  height?: number;
} & ImgHTMLAttributes<HTMLImageElement>;

export default function LogoComponent1({
  className,
  width = 32,   
  height = 32,    
  ...props
}: LogoComponentProps) {
  return (
    <Image
      src={LogoImage1}
      alt="Logo"
      width={width}
      height={height}
      priority
      className={cn("object-contain", className)}
      {...props}
    />
  );
}
