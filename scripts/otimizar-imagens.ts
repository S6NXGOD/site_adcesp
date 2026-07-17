/**
 * Reduz as imagens JÁ GRAVADAS no storage (Volume do Railway).
 *
 * Estratégia deliberadamente conservadora:
 * - Reescreve o arquivo NO LUGAR, mantendo nome e extensão (.jpg continua
 *   .jpg). Assim NENHUM caminho no banco muda — zero risco de link quebrado.
 * - Só redimensiona para BAIXO (máx. 1920 px) e recomprime.
 * - Pula o que não vale a pena: arquivos pequenos ou que não encolheriam.
 * - Ignora `filiacao/` (documentos LGPD — prova documental).
 *
 * ATENÇÃO: a operação é IRREVERSÍVEL (sobrescreve o original). Rode primeiro
 * sem argumentos (dry-run) para ver o relatório, e só então com `--aplicar`.
 * Use `--backup` para guardar os originais ao lado, em .bak.
 *
 * Uso (no Railway, onde o Volume está montado):
 *   npx tsx scripts/otimizar-imagens.ts              # simulação
 *   npx tsx scripts/otimizar-imagens.ts --aplicar    # aplica
 *   npx tsx scripts/otimizar-imagens.ts --aplicar --backup
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const MAX_DIMENSAO = 1920;
const QUALIDADE = 82;
/** Abaixo disso não compensa mexer. */
const MIN_BYTES = 150 * 1024;
/** Só reescreve se economizar pelo menos isso. */
const GANHO_MINIMO = 0.1; // 10%

const EXT_IMAGEM = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PASTAS_IGNORADAS = new Set(["filiacao"]);

const aplicar = process.argv.includes("--aplicar");
const backup = process.argv.includes("--backup");

const root = path.resolve(process.env.STORAGE_PATH || "./private/storage");

function listar(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const rel = path.relative(base, full).split(path.sep)[0];
      if (PASTAS_IGNORADAS.has(rel)) return [];
      return listar(full, base);
    }
    return EXT_IMAGEM.has(path.extname(e.name).toLowerCase()) ? [full] : [];
  });
}

const kb = (n: number) => (n / 1024).toFixed(0).padStart(6) + " KB";

async function main() {
  console.log(`\nStorage : ${root}`);
  console.log(`Modo    : ${aplicar ? "APLICAR (sobrescreve)" : "simulação (dry-run)"}`);
  if (aplicar && backup) console.log("Backup  : sim (.bak ao lado de cada arquivo)");
  console.log("Ignorado: filiacao/ (documentos LGPD)\n");

  const arquivos = listar(root);
  if (arquivos.length === 0) {
    console.log("Nenhuma imagem encontrada.\n");
    return;
  }

  let totalAntes = 0;
  let totalDepois = 0;
  let mexidos = 0;
  let pulados = 0;
  let erros = 0;

  for (const file of arquivos) {
    const rel = path.relative(root, file);
    const antes = fs.statSync(file).size;
    totalAntes += antes;

    if (antes < MIN_BYTES) {
      totalDepois += antes;
      pulados++;
      continue;
    }

    try {
      const buf = fs.readFileSync(file);
      const meta = await sharp(buf).metadata();
      const ext = path.extname(file).toLowerCase();

      // Mantém o MESMO formato do arquivo (o nome/extensão não muda).
      let pipe = sharp(buf, { failOn: "none" })
        .rotate()
        .resize(MAX_DIMENSAO, MAX_DIMENSAO, {
          fit: "inside",
          withoutEnlargement: true,
        });
      if (ext === ".png") pipe = pipe.png({ compressionLevel: 9, palette: true });
      else if (ext === ".webp") pipe = pipe.webp({ quality: QUALIDADE });
      else pipe = pipe.jpeg({ quality: QUALIDADE, progressive: true, mozjpeg: true });

      const out = await pipe.toBuffer();
      const ganho = 1 - out.length / antes;

      if (ganho < GANHO_MINIMO) {
        totalDepois += antes;
        pulados++;
        continue;
      }

      console.log(
        `${kb(antes)} -> ${kb(out.length)}  (-${(ganho * 100).toFixed(0)}%)  ` +
          `${meta.width}x${meta.height}  ${rel}`
      );

      if (aplicar) {
        if (backup) fs.copyFileSync(file, file + ".bak");
        fs.writeFileSync(file, out);
      }
      totalDepois += out.length;
      mexidos++;
    } catch (e) {
      erros++;
      totalDepois += antes;
      console.log(`   ERRO  ${rel}: ${e instanceof Error ? e.message : e}`);
    }
  }

  const economia = totalAntes - totalDepois;
  console.log("\n--------------------------------------------------");
  console.log(`Imagens analisadas : ${arquivos.length}`);
  console.log(`A otimizar         : ${mexidos}`);
  console.log(`Puladas            : ${pulados} (pequenas ou sem ganho)`);
  if (erros) console.log(`Erros              : ${erros}`);
  console.log(`Antes              : ${(totalAntes / 1048576).toFixed(2)} MB`);
  console.log(`Depois             : ${(totalDepois / 1048576).toFixed(2)} MB`);
  console.log(
    `Economia           : ${(economia / 1048576).toFixed(2)} MB` +
      (totalAntes ? ` (${((economia / totalAntes) * 100).toFixed(1)}%)` : "")
  );
  console.log("--------------------------------------------------");
  if (!aplicar && mexidos > 0) {
    console.log("\nSimulação. Para aplicar de verdade:");
    console.log("  npx tsx scripts/otimizar-imagens.ts --aplicar --backup\n");
  }
}

main().catch((e) => {
  console.error("Falhou:", e);
  process.exit(1);
});
