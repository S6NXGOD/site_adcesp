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

// Menu principal do portal público
export const mainNav: {
  title: string;
  href: string;
  children?: { title: string; href: string }[];
}[] = [
  { title: "Início", href: "/" },
  { title: "Quem Somos", href: "/quem-somos" },
  { title: "Coordenações", href: "/coordenacoes" },
  { title: "Notícias", href: "/noticias" },
  { title: "Saiu na Imprensa", href: "/saiu-na-imprensa" },
  { title: "Artigos", href: "/artigos" },
  { title: "Vídeos", href: "/videos" },
  { title: "Transparência", href: "/transparencia" },
  { title: "Eventos", href: "/eventos" },
  {
    title: "Serviços",
    href: "/servicos",
    children: [
      { title: "Espaço Jurídico", href: "/servicos/espaco-juridico" },
      { title: "Parceria com SESC", href: "/servicos/parceria-sesc" },
      { title: "Espaço de Lazer", href: "/servicos/espaco-lazer" },
      { title: "Plano de Saúde", href: "/servicos/plano-saude" },
    ],
  },
  { title: "Eleições", href: "/eleicoes" },
];

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
