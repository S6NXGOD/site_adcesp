import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Texto institucional oficial exibido em /quem-somos. */
const QUEM_SOMOS_OFICIAL = `<p>ADCESP – Seção Sindical do ANDES-SN. Em 05 de maio de 1987 é fundada a ADCESP, um ano antes da promulgação da Constituição Federal de 1988 (Fonte: Presidência da República/Planalto) e da Associação Nacional dos Docentes do Ensino Superior – ANDES, constituído em 1981, transformar-se em SINDICATO NACIONAL. Tornou-se Seção Sindical dos Docentes da Universidade Estadual do Piauí em 29 de outubro de 1992. Esta é uma seção sindical com instância organizativa e deliberativa territorial do Andes, com o objetivo principal de organizar sindicalmente os docentes da UESPI, amparado pelas prerrogativas sindicais asseguradas na Constituição Federal (Fonte: Presidência da República/Planalto). Podem sindicalizar-se à ADCESP docentes ativos e aposentados, substitutos, temporários e visitantes, que estejam em efetivo exercício, das carreiras do ensino superior lotados na UESPI. Todos devem se comprometer a cumprir o Regimento da Seção Sindical e as deliberações de Assembleias, CONAD's e Congressos.</p>`;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const senha = process.env.ADMIN_PASSWORD;

  if (!email || !senha) {
    throw new Error(
      "ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios para rodar o seed."
    );
  }

  // Usuário administrador de produção.
  // Em re-execuções não sobrescreve a senha (que pode ter sido trocada no painel),
  // apenas garante que a conta continue ativa e como ADMIN.
  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.upsert({
    where: { email },
    update: { role: "ADMIN", ativo: true },
    create: {
      nome: "Administrador ADCESP",
      email,
      senha: senhaHash,
      role: "ADMIN",
    },
  });

  // Página institucional "Quem Somos" (registro único).
  // `update: {}` preserva o conteúdo já editado pelo painel.
  await prisma.paginaInstitucional.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", quemSomosTexto: QUEM_SOMOS_OFICIAL },
  });

  console.log(`Seed concluído. Administrador: ${email}`);
}

main()
  .catch((e) => {
    console.error("Falha no seed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
