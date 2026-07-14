import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SitePopup } from "@/components/public/site-popup";
import { FloatingContact } from "@/components/public/floating-contact";
import { getPopup, getContatos } from "@/lib/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [popup, contatos] = await Promise.all([getPopup(), getContatos()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SitePopup config={popup} />
      <FloatingContact setores={contatos} />
    </div>
  );
}
