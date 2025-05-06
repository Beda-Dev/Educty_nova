"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { themes } from "@/config/thems";
import { useTheme } from "next-themes";
import { hslToHex, hexToRGB } from "@/lib/utils";
import { useThemeStore } from "@/store";


interface CardSnippetProps {
  title?: string;
  children: React.ReactNode
  code?: string;
}
const CardSnippet = ({ title, code, children }: CardSnippetProps) => {
  const [show, setShow] = useState(false);
  const toggle = () => {
    setShow(!show);
  };
  const { theme: mode } = useTheme();
  const { theme: config, setTheme: setConfig } = useThemeStore();
  const newTheme = themes.find((theme) => theme.name === config);

  const hslPrimary = `hsla(${newTheme?.cssVars[mode === "dark" ? "dark" : "light"][
    "secondary-foreground"
  ]
    })`;
  const hslPrimary2 = `hsla(${newTheme?.cssVars[mode === "dark" ? "dark" : "light"].secondary
    })`;

  const hexPrimary = hslToHex(hslPrimary);
  const hexPrimary2 = hslToHex(hslPrimary2);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        {title && (
          <CardTitle className="flex-1 leading-normal"> {title}</CardTitle>
        )}
        {code && (
          <div className="flex-none">
            <Switch id="airplane-mode" onClick={toggle} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
        <Collapsible open={show}>
          <CollapsibleContent className="CollapsibleContent">
          <div>
            javascript
          </div>

          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default CardSnippet;
