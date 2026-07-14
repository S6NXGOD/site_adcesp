"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type VotoChapa = {
  chapaId: string;
  nome: string;
  numero: number;
  votos: number;
};

const CORES = ["#0d3b66", "#1b998b", "#f4a261", "#e76f51", "#2a9d8f"];

export function ResultadoChart({
  votos,
  brancos,
  nulos,
}: {
  votos: VotoChapa[];
  brancos: number;
  nulos: number;
}) {
  const data = [
    ...votos.map((v) => ({ nome: `${v.numero} - ${v.nome}`, votos: v.votos })),
    { nome: "Brancos", votos: brancos },
    { nome: "Nulos", votos: nulos },
  ];

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 56)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
      >
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="nome"
          width={140}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [`${value} votos`, "Total"]}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="votos" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CORES[i % CORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
