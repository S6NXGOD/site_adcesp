import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/admin/pwa-register";

// Metadata aplicada apenas às rotas /admin: é aqui (e não no site público)
// que o PWA fica disponível. O manifest só é referenciado no painel.
export const metadata: Metadata = {
  title: {
    default: "Painel ADCESP",
    template: "%s | Painel ADCESP",
  },
  manifest: "/manifest.webmanifest",
  applicationName: "ADCESP Admin",
  appleWebApp: {
    capable: true,
    title: "ADCESP Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo_pwa.png",
    apple: "/logo_pwa.png",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d3b66",
  width: "device-width",
  initialScale: 1,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PwaRegister />
    </>
  );
}
