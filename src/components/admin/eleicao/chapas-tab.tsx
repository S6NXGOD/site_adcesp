"use client";

import { Users } from "lucide-react";
import { ChapaFormDialog } from "@/components/admin/chapa-form-dialog";
import { CandidatoFormDialog } from "@/components/admin/candidato-form-dialog";
import { ApuracaoForm } from "@/components/admin/apuracao-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { excluirChapa, excluirCandidato } from "@/app/actions/eleicoes";

type Candidato = { id: string; nome: string; cargo: string };
type Chapa = {
  id: string;
  nome: string;
  numero: number;
  slogan: string | null;
  logoUrl: string | null;
  candidatos: Candidato[];
};
type Resultado = {
  votosBrancos: number;
  votosNulos: number;
  totalAptos: number;
  votosChapasJson: unknown;
} | null;

export function ChapasTab({
  eleicaoId,
  chapas,
  resultado,
}: {
  eleicaoId: string;
  chapas: Chapa[];
  resultado: Resultado;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Chapas e candidatos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Chapas concorrentes</h3>
          <ChapaFormDialog eleicaoId={eleicaoId} />
        </div>

        {chapas.length === 0 ? (
          <p className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
            Nenhuma chapa cadastrada.
          </p>
        ) : (
          chapas.map((chapa) => (
            <div
              key={chapa.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                    {chapa.numero}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{chapa.nome}</p>
                    {chapa.slogan && (
                      <p className="text-xs text-muted-foreground">
                        {chapa.slogan}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CandidatoFormDialog chapaId={chapa.id} />
                  <ChapaFormDialog eleicaoId={eleicaoId} chapa={chapa} />
                  <DeleteButton
                    id={chapa.id}
                    action={excluirChapa}
                    label="Excluir chapa"
                  />
                </div>
              </div>

              {chapa.candidatos.length > 0 ? (
                <ul className="mt-3 divide-y border-t pt-2">
                  {chapa.candidatos.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span>
                        <span className="font-medium text-slate-900">
                          {c.nome}
                        </span>
                        <span className="text-muted-foreground"> — {c.cargo}</span>
                      </span>
                      <DeleteButton
                        id={c.id}
                        action={excluirCandidato}
                        label="Remover candidato"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 flex items-center gap-1 border-t pt-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> Nenhum candidato vinculado.
                </p>
              )}
            </div>
          ))
        )}
      </section>

      {/* Apuração */}
      <section>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Apuração de votos</h3>
            {resultado && <Badge variant="secondary">Já apurada</Badge>}
          </div>
          <ApuracaoForm
            eleicaoId={eleicaoId}
            chapas={chapas}
            resultado={resultado}
          />
        </div>
      </section>
    </div>
  );
}
