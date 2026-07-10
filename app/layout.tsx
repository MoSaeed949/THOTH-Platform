import type { Metadata } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { I18nProvider, localeInitScript } from "@/components/I18nProvider";
import { ToastProvider } from "@/components/ui/Toast";

// Fonts wired to the CSS variables referenced in tailwind.config.ts, so the
// intended display / body / mono typefaces actually render (previously these
// variables were undefined and fell back to the browser defaults).
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

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
    <html lang="en" dir="ltr" className={`${cinzel.variable} ${inter.variable} ${jbmono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeInitScript }} />
      </head>
      <body className="bg-obsidian text-papyrus font-body antialiased">
        <I18nProvider>
          <ThemeProvider>
            <ToastProvider>
              <div id="app-root">{children}</div>
            </ToastProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
