import { cn } from "@/lib/utils";

/**
 * Logo institucional da ADCESP.
 *
 * Os arquivos ficam em /public:
 *  - LOGO_ADCESP.PNG         → versão padrão (colorida), para fundos claros
 *  - LOGO_ADCESP_BRANCA.png  → versão branca, para fundos escuros
 *
 * Use `variant="white"` em áreas com fundo escuro (footer, sidebar, login).
 * Centralizar aqui facilita trocar os arquivos/dimensões em um só lugar.
 */
export function Logo({
  variant = "default",
  className,
  alt = "ADCESP — Secção Sindical dos Docentes da UESPI",
}: {
  variant?: "default" | "white";
  className?: string;
  alt?: string;
}) {
  const src =
    variant === "white" ? "/LOGO_ADCESP_BRANCA.png" : "/LOGO_ADCESP.PNG";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-10 w-auto object-contain", className)}
    />
  );
}
