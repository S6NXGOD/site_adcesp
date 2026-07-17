import { prisma } from "@/lib/prisma";

/**
 * Wrapper resiliente: se o banco não estiver disponível (ex: PostgreSQL
 * fora do ar durante o desenvolvimento), retorna um fallback em vez de
 * derrubar a página pública.
 */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[queries] Falha ao consultar o banco:", e);
    return fallback;
  }
}

// --------------------------- NOTÍCIAS ---------------------------

/**
 * Notícias do carrossel da home.
 *
 * Regra: se a diretoria curou destaques, o carrossel mostra exatamente eles
 * (máx. 5, mais recente primeiro). Se NINGUÉM marcou nada, cai para as últimas
 * publicadas que tenham capa — assim a home nunca fica com o hero genérico só
 * porque o destaque é opt-in. Ao marcar a primeira notícia, a curadoria manual
 * volta a mandar.
 */
export function getCarrossel(limit = 5) {
  return safe(
    async () => {
      const include = {
        categorias: { select: { id: true, nome: true, cor: true } },
      };

      const destaques = await prisma.noticia.findMany({
        where: { publicado: true, destaque: true },
        orderBy: { destaqueEm: "desc" },
        take: limit,
        include,
      });
      if (destaques.length > 0) return destaques;

      return prisma.noticia.findMany({
        where: { publicado: true, imagemCapa: { not: null } },
        orderBy: { dataPublicacao: "desc" },
        take: limit,
        include,
      });
    },
    []
  );
}

/** Últimas notícias publicadas (grid da home / listagens). */
export function getUltimasNoticias(limit = 6) {
  return safe(
    () =>
      prisma.noticia.findMany({
        where: { publicado: true },
        orderBy: { dataPublicacao: "desc" },
        take: limit,
        include: { categorias: { select: { id: true, nome: true, cor: true } } },
      }),
    []
  );
}

export function getCategorias() {
  return safe(
    () =>
      prisma.categoria.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, slug: true, cor: true },
      }),
    []
  );
}

export function getNoticias({
  page = 1,
  perPage = 9,
  q,
  categoria,
}: {
  page?: number;
  perPage?: number;
  q?: string;
  categoria?: string; // slug da categoria
}) {
  return safe(
    async () => {
      const where = {
        publicado: true,
        ...(q
          ? {
              OR: [
                { titulo: { contains: q, mode: "insensitive" as const } },
                { resumo: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(categoria ? { categorias: { some: { slug: categoria } } } : {}),
      };
      const [items, total] = await Promise.all([
        prisma.noticia.findMany({
          where,
          orderBy: { dataPublicacao: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            categorias: { select: { id: true, nome: true, cor: true } },
          },
        }),
        prisma.noticia.count({ where }),
      ]);
      return { items, total, totalPages: Math.ceil(total / perPage) };
    },
    { items: [], total: 0, totalPages: 0 }
  );
}

export function getNoticiaBySlug(slug: string) {
  return safe(
    () =>
      prisma.noticia.findFirst({
        where: { slug, publicado: true },
        include: {
          autor: { select: { nome: true } },
          categorias: { select: { id: true, nome: true, cor: true, slug: true } },
        },
      }),
    null
  );
}

/**
 * Notícias sugeridas no fim de uma matéria ("Confira também").
 *
 * Prioriza o mesmo segmento (categoria). Se não houver o bastante — ou se a
 * notícia não tiver categoria —, completa com as últimas publicadas, para a
 * seção nunca aparecer vazia ou pela metade.
 */
export function getNoticiasRelacionadas(
  slugAtual: string,
  categoriaIds: string[],
  limit = 3
) {
  return safe(
    async () => {
      const include = {
        categorias: { select: { id: true, nome: true, cor: true } },
      };
      const base = { publicado: true, slug: { not: slugAtual } };

      const mesmoSegmento =
        categoriaIds.length > 0
          ? await prisma.noticia.findMany({
              where: { ...base, categorias: { some: { id: { in: categoriaIds } } } },
              orderBy: { dataPublicacao: "desc" },
              take: limit,
              include,
            })
          : [];

      if (mesmoSegmento.length >= limit) {
        return { itens: mesmoSegmento, mesmoSegmento: true };
      }

      // Completa com as mais recentes, sem repetir as que já entraram.
      const jaIncluidas = mesmoSegmento.map((n) => n.id);
      const complemento = await prisma.noticia.findMany({
        where: { ...base, id: { notIn: jaIncluidas } },
        orderBy: { dataPublicacao: "desc" },
        take: limit - mesmoSegmento.length,
        include,
      });

      return {
        itens: [...mesmoSegmento, ...complemento],
        mesmoSegmento: mesmoSegmento.length > 0,
      };
    },
    { itens: [], mesmoSegmento: false }
  );
}

// --------------------------- SAIU NA IMPRENSA ---------------------------

/** Clippings publicados (página pública /saiu-na-imprensa). */
export function getClippingsPublicados() {
  return safe(
    () =>
      prisma.clippingImprensa.findMany({
        where: { status: "PUBLICADO" },
        orderBy: { dataPublicacao: "desc" },
      }),
    []
  );
}

// --------------------------- EVENTOS ---------------------------

export function getProximosEventos(limit = 3) {
  return safe(
    () =>
      prisma.evento.findMany({
        where: { publicado: true, dataInicio: { gte: new Date() } },
        orderBy: { dataInicio: "asc" },
        take: limit,
      }),
    []
  );
}

export function getEventos() {
  return safe(
    () =>
      prisma.evento.findMany({
        where: { publicado: true },
        orderBy: { dataInicio: "desc" },
      }),
    []
  );
}

// --------------------------- TRANSPARÊNCIA ---------------------------

export function getDocumentosTransparencia() {
  return safe(
    () =>
      prisma.transparencia.findMany({
        orderBy: { dataDocumento: "desc" },
      }),
    []
  );
}

// --------------------------- SERVIÇOS ---------------------------

export function getServicoByTipo(tipo: string) {
  return safe(
    () =>
      prisma.servico.findFirst({
        where: { tipo: tipo as never, publicado: true },
      }),
    null
  );
}

// --------------------------- QUEM SOMOS ---------------------------

export function getCoordenacoes() {
  return safe(
    () =>
      prisma.coordenacao.findMany({
        orderBy: [{ tipo: "asc" }, { ordem: "asc" }],
      }),
    []
  );
}

export function getDiretorias() {
  return safe(
    () =>
      prisma.diretoriaHistorico.findMany({
        orderBy: [{ status: "asc" }, { gestao: "desc" }],
      }),
    []
  );
}

// --------------------------- VÍDEOS ---------------------------

/** Vídeos ativos (carrossel da home e página /videos). */
export function getVideos() {
  return safe(
    () =>
      prisma.video.findMany({
        where: { ativo: true },
        orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
      }),
    []
  );
}

// --------------------------- ARTIGOS ---------------------------

/** Artigos publicados (listagem pública). */
export function getArtigos() {
  return safe(
    () =>
      prisma.artigo.findMany({
        where: { status: "PUBLICADO" },
        orderBy: { dataPublicacao: "desc" },
      }),
    []
  );
}

export function getArtigoBySlug(slug: string) {
  return safe(
    () =>
      prisma.artigo.findFirst({
        where: { slug, status: "PUBLICADO" },
      }),
    null
  );
}

// --------------------------- CONFIGURAÇÕES DO SITE ---------------------------

/** Pop-up ativo do site (ou null). `version` invalida a chave no cliente. */
export function getPopup() {
  return safe(async () => {
    const p = await prisma.popup.findFirst({ where: { ativo: true } });
    if (!p) return null;
    return {
      id: p.id,
      imagem: p.imagem,
      linkUrl: p.linkUrl,
      tempoExibicao: p.tempoExibicao,
      version: p.atualizadoEm.getTime(),
    };
  }, null);
}

/** Texto institucional (Quem Somos) — registro único. */
export function getPaginaInstitucional() {
  return safe(
    () => prisma.paginaInstitucional.findUnique({ where: { id: "singleton" } }),
    null
  );
}

/** Setores de contato (WhatsApp) ativos, ordenados. */
export function getContatos() {
  return safe(
    () =>
      prisma.contatoWhatsapp.findMany({
        where: { ativo: true },
        orderBy: { ordem: "asc" },
        select: { id: true, setor: true, numero: true, mensagem: true },
      }),
    []
  );
}

// --------------------------- ELEIÇÕES ---------------------------

export function getEleicoes() {
  return safe(
    () =>
      prisma.eleicao.findMany({
        orderBy: { criadoEm: "desc" },
        include: {
          documentos: { orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] },
          comissao: { orderBy: { ordem: "asc" } },
          chapas: {
            orderBy: { numero: "asc" },
            include: { candidatos: { orderBy: { ordem: "asc" } } },
          },
          resultado: true,
        },
      }),
    []
  );
}
