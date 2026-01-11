import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Smart Forms - Build Intelligent Forms with Conditional Logic",
  description:
    "Stop asking irrelevant questions. Build intelligent, tree-structured forms with conditional branching. Create personalized forms with dynamic question flows, multiple choice options, and text inputs. Perfect for surveys, assessments, and data collection.",
  keywords: [
    "smart forms",
    "conditional forms",
    "dynamic forms",
    "form builder",
    "survey builder",
    "questionnaire",
    "branching logic",
    "conditional logic",
    "online forms",
    "form creator",
  ],
  authors: [{ name: "Smart Forms" }],
  creator: "Smart Forms",
  publisher: "Smart Forms",
  metadataBase: new URL("https://smartforms.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartforms.app",
    title: "Smart Forms - Build Intelligent Forms with Conditional Logic",
    description:
      "Stop asking irrelevant questions. Build intelligent, tree-structured forms with conditional branching. Ask only what matters, collect less data, gain deeper insights.",
    siteName: "Smart Forms",
    images: [
      {
        url: "/img/Checklist.jpg",
        width: 1200,
        height: 630,
        alt: "Smart Forms - Intelligent Form Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Forms - Build Intelligent Forms with Conditional Logic",
    description:
      "Stop asking irrelevant questions. Build intelligent, tree-structured forms with conditional branching. Ask only what matters, collect less data, gain deeper insights.",
    images: ["/img/Checklist.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={firaSans.variable}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
