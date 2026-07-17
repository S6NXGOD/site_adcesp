/**
 * Seed de BOOTSTRAP — roda a cada deploy (preDeployCommand no railway.json).
 *
 * Regra de ouro: só CRIA o que falta. Nunca altera nem apaga nada que já
 * exista. Assim rodar de novo é sempre um no-op, e um deploy jamais desfaz
 * o que a diretoria configurou pelo painel.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Texto institucional oficial exibido em /quem-somos. */
const QUEM_SOMOS_OFICIAL = `<p>ADCESP – Seção Sindical do ANDES-SN. Em 05 de maio de 1987 é fundada a ADCESP, um ano antes da promulgação da Constituição Federal de 1988 (Fonte: Presidência da República/Planalto) e da Associação Nacional dos Docentes do Ensino Superior – ANDES, constituído em 1981, transformar-se em SINDICATO NACIONAL. Tornou-se Seção Sindical dos Docentes da Universidade Estadual do Piauí em 29 de outubro de 1992. Esta é uma seção sindical com instância organizativa e deliberativa territorial do Andes, com o objetivo principal de organizar sindicalmente os docentes da UESPI, amparado pelas prerrogativas sindicais asseguradas na Constituição Federal (Fonte: Presidência da República/Planalto). Podem sindicalizar-se à ADCESP docentes ativos e aposentados, substitutos, temporários e visitantes, que estejam em efetivo exercício, das carreiras do ensino superior lotados na UESPI. Todos devem se comprometer a cumprir o Regimento da Seção Sindical e as deliberações de Assembleias, CONAD's e Congressos.</p>`;

/**
 * Garante que exista ao menos UM administrador para o primeiro acesso.
 * Se já houver qualquer admin, não faz nada — nem cria, nem promove, nem
 * reativa. Trocar a senha, o papel ou o e-mail é decisão do painel.
 */
async function garantirAdmin() {
  const admins = await prisma.usuario.count({ where: { role: "ADMIN" } });
  if (admins > 0) {
    console.log(`Admin: já existe (${admins}) — nada a fazer.`);
    return;
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  const senha = process.env.ADMIN_PASSWORD;
  if (!email || !senha) {
    throw new Error(
      "Nenhum administrador no banco e ADMIN_EMAIL/ADMIN_PASSWORD não definidos. " +
        "Defina as duas variáveis para criar o primeiro acesso."
    );
  }

  // O e-mail é único: se a conta existir sem ser ADMIN, não a promovemos —
  // isso desfaria um rebaixamento feito de propósito no painel.
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(
      `Admin: nenhum ADMIN ativo, mas "${email}" já existe como ${existente.role}. ` +
        "Não foi alterado — promova pelo painel ou use outro ADMIN_EMAIL."
    );
    return;
  }

  await prisma.usuario.create({
    data: {
      nome: "Administrador ADCESP",
      email,
      senha: await bcrypt.hash(senha, 10),
      role: "ADMIN",
    },
  });
  console.log(`Admin: criado o primeiro acesso (${email}).`);
}

/** Cria a página institucional só se ela ainda não existir. */
async function garantirQuemSomos() {
  const existe = await prisma.paginaInstitucional.findUnique({
    where: { id: "singleton" },
    select: { id: true },
  });
  if (existe) {
    console.log("Quem Somos: já existe — conteúdo do painel preservado.");
    return;
  }
  await prisma.paginaInstitucional.create({
    data: { id: "singleton", quemSomosTexto: QUEM_SOMOS_OFICIAL },
  });
  console.log("Quem Somos: criado com o texto oficial.");
}

async function main() {
  await garantirAdmin();
  await garantirQuemSomos();
}

main()
  .catch((e) => {
    console.error("Falha no seed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
