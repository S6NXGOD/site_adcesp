// Opções e rótulos dos enums de filiação.
// Mantido em TS puro (sem importar @prisma/client) para poder ser usado com
// segurança em componentes client sem empacotar o Prisma no bundle do navegador.
// Os `value` correspondem exatamente aos nomes dos enums no schema.prisma.

export const CAMPUS_OPTIONS = [
  { value: "TERESINA_TORQUATO_NETO", label: "Teresina – Campus Poeta Torquato Neto" },
  { value: "TERESINA_CLOVIS_MOURA", label: "Teresina – Campus Clóvis Moura" },
  { value: "PARNAIBA_ALEXANDRE_ALVES", label: "Parnaíba – Campus Alexandre Alves de Oliveira" },
  { value: "PICOS_BARROS_ARAUJO", label: "Picos – Campus Prof. Barros Araújo" },
  { value: "FLORIANO_JOSEFINA_DEMES", label: "Floriano – Campus Dra. Josefina Demes" },
  { value: "CAMPO_MAIOR_HEROIS_JENIPAPO", label: "Campo Maior – Campus Heróis do Jenipapo" },
  { value: "CORRENTE_JESUALDO_CAVALCANTI", label: "Corrente – Campus Jesualdo Cavalcanti" },
  { value: "OEIRAS_EDILBERTO_DINKELBORG", label: "Oeiras – Campus Prof. Edilberto Dinkelborg" },
  { value: "SAO_RAIMUNDO_NONATO_ARISTON_DIAS_LIMA", label: "São Raimundo Nonato – Campus Ariston Dias Lima" },
  { value: "OUTRO", label: "Outro" },
] as const;

export const CENTRO_OPTIONS = [
  { value: "CCECA", label: "CCECA – Ciências da Educação, Comunicação e Artes" },
  { value: "CCN", label: "CCN – Ciências da Natureza" },
  { value: "CCHL", label: "CCHL – Ciências Humanas e Letras" },
  { value: "CCS", label: "CCS – Ciências da Saúde" },
  { value: "CTU", label: "CTU – Tecnologia e Urbanismo" },
  { value: "CCA", label: "CCA – Ciências Agrárias" },
  { value: "NAO_SE_APLICA", label: "Não se aplica" },
] as const;

export const CAMPUS_VALUES = CAMPUS_OPTIONS.map((o) => o.value) as [
  string,
  ...string[]
];
export const CENTRO_VALUES = CENTRO_OPTIONS.map((o) => o.value) as [
  string,
  ...string[]
];

export const campusLabel: Record<string, string> = Object.fromEntries(
  CAMPUS_OPTIONS.map((o) => [o.value, o.label])
);
export const centroLabel: Record<string, string> = Object.fromEntries(
  CENTRO_OPTIONS.map((o) => [o.value, o.label])
);

export const UF_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

// Textos legais exigidos nos consentimentos (usados no formulário).
export const TEXTO_CONTRIBUICAO =
  "Aceite do desconto da contribuição confederativa (Fonte: Constituição Federal de 1988, Art. 8º, inciso IV)";

export const TEXTO_LGPD =
  "Consentimento para tratamento de dados pessoais (Fonte: Presidência da República/Planalto - Lei Geral de Proteção de Dados Pessoais - LGPD, Lei nº 13.709/2018)";
