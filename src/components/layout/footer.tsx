import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { allNavLinks, siteConfig } from "@/lib/site";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-slate-900 text-slate-300">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div>
          <Logo variant="white" className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase text-white">
            Navegação
          </h3>
          <ul className="space-y-2 text-sm">
            {allNavLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase text-white">
            Contato
          </h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2 text-slate-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{siteConfig.address}</span>
            </p>
            <a
              href={`tel:+55${siteConfig.phoneRaw}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white"
            >
              <Phone className="h-4 w-4 shrink-0" /> Fone: {siteConfig.phone}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-2 text-slate-400 hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0" /> {siteConfig.email}
            </a>
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-800 p-2 hover:bg-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-800 p-2 hover:bg-primary"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-800 p-2 hover:bg-primary"
              aria-label="YouTube"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
          <Link
            href="/admin/login"
            className="mt-6 inline-block text-xs text-slate-500 hover:text-slate-300"
          >
            Acesso restrito (Diretoria)
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4">
        <p className="container text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {siteConfig.name} —{" "}
          {siteConfig.fullName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
