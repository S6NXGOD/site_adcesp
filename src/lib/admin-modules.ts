// Módulos do painel administrativo e regras de permissão por usuário.
// Usado pelo formulário de usuários, pela sidebar e pelo middleware (edge-safe,
// sem dependências de Node).

/** Módulos que podem ser atribuídos a um usuário EDITOR. */
export const MODULOS: { key: string; label: string }[] = [
  { key: "noticias", label: "Notícias" },
  { key: "imprensa", label: "Saiu na Imprensa" },
  { key: "artigos", label: "Artigos" },
  { key: "videos", label: "Vídeos" },
  { key: "eventos", label: "Eventos" },
  { key: "institucional", label: "Conteúdo Institucional" },
  { key: "coordenacoes", label: "Coordenações" },
  { key: "diretorias", label: "Diretorias" },
  { key: "servicos", label: "Serviços" },
  { key: "filiacoes", label: "Filiações" },
  { key: "eleicoes", label: "Eleições" },
  { key: "transparencia", label: "Transparência" },
  { key: "popup", label: "Pop-up" },
  { key: "contato", label: "Contato (WhatsApp)" },
];

// Prefixo de rota -> módulo (a rota /admin/usuarios é ADMIN-only, tratada à parte).
const ROTA_MODULO: [string, string][] = [
  ["/admin/noticias", "noticias"],
  ["/admin/imprensa", "imprensa"],
  ["/admin/artigos", "artigos"],
  ["/admin/videos", "videos"],
  ["/admin/eventos", "eventos"],
  ["/admin/institucional", "institucional"],
  ["/admin/coordenacoes", "coordenacoes"],
  ["/admin/diretorias", "diretorias"],
  ["/admin/servicos", "servicos"],
  ["/admin/filiacoes", "filiacoes"],
  ["/admin/eleicoes", "eleicoes"],
  ["/admin/transparencia", "transparencia"],
  ["/admin/popup", "popup"],
  ["/admin/contato", "contato"],
];

/** Retorna o módulo correspondente a uma rota (ou null se for sempre liberada). */
export function moduloDaRota(pathname: string): string | null {
  for (const [prefix, modulo] of ROTA_MODULO) {
    if (pathname.startsWith(prefix)) return modulo;
  }
  return null; // /admin/dashboard e /admin/configuracoes (perfil) são liberados
}

/** Verifica se o usuário pode acessar uma rota do painel. */
export function podeAcessarRota(
  role: string,
  modulos: string[],
  pathname: string
): boolean {
  if (role === "ADMIN") return true;
  if (pathname.startsWith("/admin/usuarios")) return false; // somente ADMIN
  const modulo = moduloDaRota(pathname);
  if (!modulo) return true; // dashboard / perfil
  return modulos.includes(modulo);
}

/** Verifica se o usuário pode ver/usar um módulo (para a sidebar). */
export function podeAcessarModulo(
  role: string,
  modulos: string[],
  modulo?: string,
  adminOnly?: boolean
): boolean {
  if (role === "ADMIN") return true;
  if (adminOnly) return false;
  if (!modulo) return true;
  return modulos.includes(modulo);
}
