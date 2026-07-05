import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Thoth — Study Platform",
  description: "Thoth: AI-guided study platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-obsidian text-papyrus font-body antialiased">
        <ThemeProvider>
          <div id="app-root">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
