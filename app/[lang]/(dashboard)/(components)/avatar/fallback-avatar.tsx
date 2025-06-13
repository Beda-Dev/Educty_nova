"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
const FallbackAvatar = () => {
  return (
    <>
      <Avatar>
        <AvatarFallback className=" bg-primary text-skyblue-foreground">
          <Icon icon="heroicons:user-20-solid" className=" h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className=" bg-secondary text-secondary-foreground">
          <Icon
            icon="heroicons:chat-bubble-left-20-solid"
            className=" h-6 w-6"
          />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className=" bg-destructive text-skyblue-foreground">
          <Icon icon="heroicons:trash-20-solid" className=" h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className=" bg-success text-skyblue-foreground">
          <Icon icon="heroicons:check-circle-20-solid" className=" h-6 w-6" />
        </AvatarFallback>
      </Avatar>
    </>
  );
};

export default FallbackAvatar;
