export const siteConfig = {
  name: "ADCESP",
  fullName: "Secção Sindical dos Docentes da UESPI",
  description:
    "Portal oficial da ADCESP — Secção Sindical dos Docentes da Universidade Estadual do Piauí (UESPI). Notícias, transparência, eventos, filiação e eleições.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "adcesp@gmail.com",
  phone: "(86) 3213 2300",
  phoneRaw: "8632132300", // usado em links tel:
  address: "Rua João Cabral 2231 – Bairro: Pirajá – CEP: 64.002-156",
  social: {
    instagram: "https://instagram.com/adcesp",
    facebook: "https://facebook.com/adcesp",
    youtube: "https://youtube.com/@adcesp",
  },
};

// ---------------------------------------------------------------------
// Menu principal do portal público
// Organizado por intenção do usuário: 5 categorias + CTA.
// Os `href` refletem as rotas que existem de fato (ver servicoSlugToTipo).
// ---------------------------------------------------------------------
export type NavLink = { title: string; href: string; descricao?: string };
export type NavEntry =
  | NavLink
  | { title: string; children: NavLink[] };

export function isGrupo(
  item: NavEntry
): item is { title: string; children: NavLink[] } {
  return "children" in item;
}

export const mainNav: NavEntry[] = [
  {
    title: "O Sindicato",
    children: [
      {
        title: "Quem Somos",
        href: "/quem-somos",
        descricao: "História, princípios e atuação da ADCESP.",
      },
      {
        title: "Coordenações",
        href: "/coordenacoes",
        descricao: "Coordenação estadual e regionais.",
      },
      {
        title: "Eleições",
        href: "/eleicoes",
        descricao: "Editais, chapas, comissão e apuração.",
      },
    ],
  },
  {
    title: "Comunicação",
    children: [
      {
        title: "Notícias",
        href: "/noticias",
        descricao: "Ações, conquistas e mobilizações.",
      },
      {
        title: "Artigos",
        href: "/artigos",
        descricao: "Produção autoral dos docentes.",
      },
      {
        title: "Saiu na Imprensa",
        href: "/saiu-na-imprensa",
        descricao: "A ADCESP nos veículos de comunicação.",
      },
      { title: "Vídeos", href: "/videos", descricao: "Canal e coberturas." },
    ],
  },
  {
    title: "Serviços",
    children: [
      {
        title: "Espaço Jurídico",
        href: "/servicos/espaco-juridico",
        descricao: "Assessoria jurídica aos filiados.",
      },
      {
        title: "Plano de Saúde",
        href: "/servicos/plano-saude",
        descricao: "Condições especiais para a categoria.",
      },
      {
        title: "Parceria com SESC",
        href: "/servicos/parceria-sesc",
        descricao: "Benefícios em lazer, cultura e esporte.",
      },
      {
        title: "Espaço de Lazer",
        href: "/servicos/espaco-lazer",
        descricao: "Estrutura para filiados e familiares.",
      },
    ],
  },
  { title: "Transparência", href: "/transparencia" },
  { title: "Eventos", href: "/eventos" },
];

/** Botão de ação em destaque da Navbar. */
export const navCta: NavLink = { title: "Filie-se", href: "/filiacao" };

/** Todos os links do menu, achatados (usado no rodapé e no sitemap). */
export const allNavLinks: NavLink[] = mainNav.flatMap((i) =>
  isGrupo(i) ? i.children : [i]
);

// Mapeia o slug do submenu de serviços -> enum TipoServico
export const servicoSlugToTipo: Record<string, string> = {
  "espaco-juridico": "ESPACO_JURIDICO",
  "parceria-sesc": "PARCERIA_SESC",
  "espaco-lazer": "ESPACO_LAZER",
  "plano-saude": "PLANO_SAUDE",
};

export const servicoLabels: Record<string, string> = {
  ESPACO_JURIDICO: "Espaço Jurídico",
  PARCERIA_SESC: "Parceria com SESC",
  ESPACO_LAZER: "Espaço de Lazer",
  PLANO_SAUDE: "Plano de Saúde",
};

// Campi da UESPI (usado no formulário de filiação)
export const campiUespi = [
  "Teresina - Torquato Neto",
  "Teresina - Pirajá",
  "Teresina - Clóvis Moura",
  "Parnaíba",
  "Picos",
  "Floriano",
  "Campo Maior",
  "Corrente",
  "Oeiras",
  "São Raimundo Nonato",
  "Uruçuí",
  "Bom Jesus",
  "Piripiri",
  "Outro",
];

// ---------------------------------------------------------------------
// Menu do painel administrativo (grupos pai/filho)
// ---------------------------------------------------------------------
export type AdminItem = {
  title: string;
  href: string;
  icon: string;
  modulo?: string; // chave de permissão (ver lib/admin-modules)
  adminOnly?: boolean;
};
export type AdminGroup = { label: string; items: AdminItem[] };

export const adminDashboard: AdminItem = {
  title: "Dashboard",
  href: "/admin/dashboard",
  icon: "LayoutDashboard",
};

export const adminPerfil: AdminItem = {
  title: "Meu Perfil",
  href: "/admin/configuracoes",
  icon: "UserCog",
};

export const adminNavGroups: AdminGroup[] = [
  {
    label: "Conteúdo",
    items: [
      { title: "Notícias", href: "/admin/noticias", icon: "Newspaper", modulo: "noticias" },
      { title: "Saiu na Imprensa", href: "/admin/imprensa", icon: "Radio", modulo: "imprensa" },
      { title: "Artigos", href: "/admin/artigos", icon: "PenLine", modulo: "artigos" },
      { title: "Vídeos", href: "/admin/videos", icon: "Video", modulo: "videos" },
      { title: "Eventos", href: "/admin/eventos", icon: "CalendarDays", modulo: "eventos" },
    ],
  },
  {
    label: "Institucional",
    items: [
      { title: "Conteúdo Institucional", href: "/admin/institucional", icon: "BookOpen", modulo: "institucional" },
      { title: "Coordenações", href: "/admin/coordenacoes", icon: "Network", modulo: "coordenacoes" },
      { title: "Diretorias", href: "/admin/diretorias", icon: "History", modulo: "diretorias" },
      { title: "Serviços", href: "/admin/servicos", icon: "Briefcase", modulo: "servicos" },
    ],
  },
  {
    label: "Sindical",
    items: [
      { title: "Filiações", href: "/admin/filiacoes", icon: "Users", modulo: "filiacoes" },
      { title: "Eleições", href: "/admin/eleicoes", icon: "Vote", modulo: "eleicoes" },
      { title: "Transparência", href: "/admin/transparencia", icon: "FileText", modulo: "transparencia" },
    ],
  },
  {
    label: "Aparência do Site",
    items: [
      { title: "Pop-up", href: "/admin/popup", icon: "MonitorSmartphone", modulo: "popup" },
      { title: "Contato (WhatsApp)", href: "/admin/contato", icon: "MessageCircle", modulo: "contato" },
    ],
  },
  {
    label: "Administração",
    items: [
      { title: "Usuários", href: "/admin/usuarios", icon: "ShieldCheck", adminOnly: true },
    ],
  },
];
