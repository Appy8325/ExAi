"use client";

import type { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@saas-ui/react";

export function SaasProvider({ children }: { children: ReactNode }) {
  return <ChakraProvider theme={theme} resetCSS={false}>{children}</ChakraProvider>;
}
