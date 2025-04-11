import CustomLayout from "@/components/layouts";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import WalletProvider from "@/providers/wallet-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bink AI",
  description: "Bink AI",
  icons: {
    icon: "/images/logo.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo.png" sizes="any" />
      </head>
      <body className={`${inter.className} mobile:text-mobile-base`}>
        <WalletProvider>
          <AuthProvider>
            <TooltipProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <CustomLayout>{children}</CustomLayout>
              </ThemeProvider>
            </TooltipProvider>
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
