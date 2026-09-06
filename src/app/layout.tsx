import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ClientProviders } from "@/components/providers/ClientProviders";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devsoke.com"),
  applicationName: "Devsoke",
  title: {
    default: "Devsoke | Software Websites and Apps Built to Convert",
    template: "%s | Devsoke",
  },
  description:
    "Devsoke builds conversion-focused websites, software products, AI workflows, and dashboards for teams selling into the UK, UAE, and Europe.",
  openGraph: {
    title: "Devsoke | Software Websites and Apps Built to Convert",
    description:
      "Conversion-focused websites, software products, AI workflows, and dashboards for teams selling into the UK, UAE, and Europe.",
    siteName: "Devsoke",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devsoke | Software Websites and Apps Built to Convert",
    description:
      "Conversion-focused websites, software products, AI workflows, and dashboards.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} min-h-full antialiased font-sans`}
    >
      <body className="min-h-screen flex flex-col bg-brand-bg text-brand-fg overflow-x-hidden selection:bg-brand-rose selection:text-brand-fg">
        <ClientProviders>
          <Navbar />
          <main id="main-content" className="flex-grow flex flex-col w-full">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
