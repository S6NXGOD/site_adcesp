import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { campusLabel, centroLabel } from "@/lib/filiacao";
import type { FiliacaoInput } from "@/lib/validations";

// =====================================================================
// Geração da "Proposta de Filiação" preenchendo o template físico do
// sindicato (public/template_filiacao.pdf) com pdf-lib.
//
// Página do template: A4 retrato — 595.32 x 842.04 pt.
// Origem do pdf-lib: canto INFERIOR esquerdo (y cresce para cima).
//
// AJUSTE DE ALINHAMENTO:
//  - `offsets` desloca TODOS os campos de uma vez (calibração global).
//  - Cada campo tem { x, y } próprios (e `size` opcional).
//  - As coordenadas abaixo foram calibradas a partir do modelo enviado;
//    ajuste fino de alguns pontos pode ser necessário na sua impressão.
// =====================================================================

/** Deslocamento global aplicado a todos os campos (calibração fina). */
export const offsets = { x: 0, y: 0 };

/** Tamanho padrão da fonte (Helvetica). */
export const FONTE_TAMANHO = 10;

// `max` = largura máxima disponível (pt) para o texto do campo. Se o valor
// não couber nesse espaço, a fonte é reduzida automaticamente (até 6pt) para
// não invadir o rótulo/campo vizinho — trata nomes longos, endereços, e os
// rótulos extensos dos selects (Campus/Centro).
type Coord = { x: number; y: number; size?: number; max?: number };

// Coordenadas calibradas a partir das baselines reais dos rótulos do
// template (extraídas do PDF). Espaçamento entre linhas ≈ 19 pt.
export const campos: Record<string, Coord> = {
  // Linha "Professor(a). ______"  (baseline 625)
  nome: { x: 126, y: 626, max: 408 },

  // Linha "RG:____ CPF:____ , Data Nasc.:____"  (baseline 606)
  rg: { x: 74, y: 607, max: 104 },
  cpf: { x: 206, y: 607, max: 122 },
  dataNascimento: { x: 454, y: 607, max: 84 },

  // Linha "Matricula:____ Curso:____"  (baseline 587)
  matricula: { x: 109, y: 588, max: 110 },
  curso: { x: 258, y: 588, max: 276 },

  // Linha "Centro:____ Campus ____"  (baseline 568). Centro usa sigla curta
  // para não invadir o rótulo "Campus" (que começa em x≈208).
  centro: { x: 90, y: 569, max: 112 },
  campus: { x: 247, y: 569, size: 9, max: 288 },

  // Linha "Residente à:____ , nº____"  (baseline 549). O "à:" vai até x≈133,
  // então o endereço começa em 135 para não sobrepor o rótulo.
  endereco: { x: 135, y: 550, size: 9, max: 310 },
  numero: { x: 492, y: 550, max: 46 },

  // Linha "Apto.____ CEP:____ Cidade:____"  (baseline 530)
  apto: { x: 83, y: 531, max: 76 },
  cep: { x: 188, y: 531, max: 112 },
  cidade: { x: 345, y: 531, size: 9, max: 188 },

  // Linha "Telefone (__)____ Cel.: (__)____"  (baseline 511)
  telefoneDdd: { x: 103, y: 512, max: 14 },
  telefoneNumero: { x: 122, y: 512, max: 172 },
  celularDdd: { x: 332, y: 512, max: 14 },
  celularNumero: { x: 356, y: 512, max: 178 },

  // Linha "e-mails: ____"  (baseline 492)
  email: { x: 100, y: 493, size: 9, max: 434 },

  // Rodapé: "________ , ____ de ____________ de _______."  (baseline 361)
  footerCidade: { x: 150, y: 362, max: 96 },
  footerDia: { x: 254, y: 362, max: 40 },
  footerMes: { x: 300, y: 362, max: 74 },
  footerAno: { x: 386, y: 362, max: 48 },
};

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "yyyy-mm-dd" -> "dd/mm/aaaa" (sem depender de timezone). */
function formatarData(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Separa telefone em DDD e número já formatado. */
function separarFone(v?: string): { ddd: string; numero: string } {
  if (!v) return { ddd: "", numero: "" };
  const d = v.replace(/\D/g, "");
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  let numero = resto;
  if (resto.length === 9) numero = `${resto.slice(0, 5)}-${resto.slice(5)}`;
  else if (resto.length === 8) numero = `${resto.slice(0, 4)}-${resto.slice(4)}`;
  return { ddd, numero };
}

/** Remove a palavra "Campus" do rótulo (o template já a imprime). */
function campusCurto(label: string): string {
  return label.replace(/\s*Campus\s+/i, " ").replace(/\s+/g, " ").trim();
}

/** Sigla do centro (parte antes do "–"), pois o espaço no template é curto. */
function centroCurto(label: string): string {
  return label.split("–")[0].trim();
}

/** Nome de arquivo seguro: "João da Silva" -> "Joao_da_Silva". */
function nomeArquivoSeguro(nome: string): string {
  return (
    nome
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_\-]/g, "") || "Docente"
  );
}

/** Gera os bytes do PDF preenchido a partir do template. */
export async function gerarPropostaFiliacao(
  dados: FiliacaoInput
): Promise<Uint8Array> {
  const resp = await fetch("/template_filiacao.pdf");
  if (!resp.ok) {
    throw new Error("Template não encontrado em public/template_filiacao.pdf.");
  }
  const templateBytes = await resp.arrayBuffer();

  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPages()[0];

  const draw = (key: string, texto?: string | null) => {
    if (texto === undefined || texto === null || texto === "") return;
    const c = campos[key];
    if (!c) return;
    const t = String(texto);
    let size = c.size ?? FONTE_TAMANHO;
    // Reduz a fonte até o texto caber na largura disponível (mínimo 6pt).
    if (c.max) {
      while (size > 6 && font.widthOfTextAtSize(t, size) > c.max) {
        size -= 0.5;
      }
    }
    page.drawText(t, {
      x: c.x + offsets.x,
      y: c.y + offsets.y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const agora = new Date();
  const tel = separarFone(dados.telefone);
  const cel = separarFone(dados.celular);

  // Dados pessoais
  draw("nome", dados.nome);
  draw("rg", dados.rg);
  draw("cpf", dados.cpf);
  draw("dataNascimento", formatarData(dados.dataNascimento));
  draw("matricula", dados.matricula);
  draw("curso", dados.curso);

  // Vínculo UESPI
  draw("centro", centroCurto(centroLabel[dados.centro] ?? dados.centro));
  draw("campus", campusCurto(campusLabel[dados.campus] ?? dados.campus));

  // Endereço
  draw("endereco", dados.endereco);
  draw("numero", dados.numero);
  draw("apto", dados.apto);
  draw("cep", dados.cep);
  draw("cidade", dados.cidade);

  // Contato
  draw("telefoneDdd", tel.ddd);
  draw("telefoneNumero", tel.numero);
  draw("celularDdd", cel.ddd);
  draw("celularNumero", cel.numero);
  draw("email", dados.email);

  // Rodapé: cidade selecionada + data atual do sistema
  draw("footerCidade", dados.cidade);
  draw("footerDia", String(agora.getDate()).padStart(2, "0"));
  draw("footerMes", MESES[agora.getMonth()]);
  draw("footerAno", String(agora.getFullYear()));

  return pdfDoc.save();
}

/**
 * Gera e dispara o download do PDF:
 *   Proposta_Filiacao_[Nome_do_Docente].pdf
 */
export async function baixarPropostaFiliacao(
  dados: FiliacaoInput
): Promise<void> {
  const bytes = await gerarPropostaFiliacao(dados);
  const blob = new Blob([bytes.slice()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Proposta_Filiacao_${nomeArquivoSeguro(dados.nome)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
