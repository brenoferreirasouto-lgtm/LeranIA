import "@fontsource-variable/lexend";
import "@fontsource-variable/atkinson-hyperlegible-next";
import "@fontsource-variable/atkinson-hyperlegible-mono";
import "./globals.css";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Learn AI — letramento em inteligência artificial",
    template: "%s · Learn AI",
  },
  description:
    "Aprenda a usar IA generativa com senso crítico: trilhas curtas, situações práticas e feedback em cada resposta.",
};

export const viewport: Viewport = {
  themeColor: "#081634",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
